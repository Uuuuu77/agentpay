import express from "express"
import { ethers } from "ethers"
import type { DatabaseManager } from "../database"
import { getServiceByType, calculateServicePrice } from "../../lib/services"
import { generateInvoiceId } from "../../lib/contract-utils"
import { InvoiceStatus, ServiceType } from "../../types"

const router = express.Router()

// Create new invoice
router.post("/", async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db
    const { serviceType, payee, token, chain, description, options = {}, buyerContact, customAmount } = req.body

    // Validate required fields
    if (!serviceType || !payee || !token || !chain || !description) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["serviceType", "payee", "token", "chain", "description"],
      })
    }

    // Validate service type
    const service = getServiceByType(serviceType as ServiceType)
    if (!service) {
      return res.status(400).json({
        error: "Invalid service type",
        availableTypes: Object.values(ServiceType),
      })
    }

    // Calculate amount
    const amount = customAmount || calculateServicePrice(service, options)
    const amountWei = ethers.parseUnits(amount.toString(), 6).toString() // Assuming 6 decimals for USDC/USDT

    // Generate invoice ID
    const timestamp = Math.floor(Date.now() / 1000)
    const invoiceId = generateInvoiceId({
      serviceType,
      amount: amountWei,
      payee,
      timestamp,
    })

    // Set expiry (7 days from now)
    const expiryTimestamp = timestamp + 7 * 24 * 60 * 60

    // Set deadline based on service SLA
    const deadline = timestamp + service.slaHours * 60 * 60

    // Create invoice in database
    const invoice = await db.createInvoice({
      invoiceId,
      serviceType,
      payee,
      amount: amountWei,
      token,
      chain,
      description,
      options,
      status: InvoiceStatus.CREATED,
      buyerContact,
      deadline,
      revisionsAllowed: service.options.revisions?.default || 2,
      expiryTimestamp,
    })

    res.status(201).json({
      success: true,
      invoice: {
        ...invoice,
        displayAmount: amount,
        service: service,
      },
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    res.status(500).json({
      error: "Failed to create invoice",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get invoice by ID
router.get("/:invoiceId", async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db
    const { invoiceId } = req.params

    const invoice = await db.getInvoice(invoiceId)
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" })
    }

    const service = getServiceByType(invoice.serviceType as ServiceType)
    const displayAmount = Number.parseFloat(ethers.formatUnits(invoice.amount, 6))

    res.json({
      success: true,
      invoice: {
        ...invoice,
        displayAmount,
        service,
      },
    })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    res.status(500).json({
      error: "Failed to fetch invoice",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Get invoice status
router.get("/:invoiceId/status", async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db
    const { invoiceId } = req.params

    const invoice = await db.getInvoice(invoiceId)
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" })
    }

    res.json({
      success: true,
      status: invoice.status,
      isPaid: invoice.status === InvoiceStatus.PAID,
      isExpired: invoice.expiryTimestamp < Math.floor(Date.now() / 1000),
      txHash: invoice.txHash,
      payer: invoice.payer,
      paidAt: invoice.paidAt,
      deliverableURL: invoice.deliverableURL,
    })
  } catch (error) {
    console.error("Error fetching invoice status:", error)
    res.status(500).json({
      error: "Failed to fetch invoice status",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// List invoices with filters
router.get("/", async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db
    const { status, limit = 50, offset = 0 } = req.query

    let invoices
    if (status) {
      invoices = await db.getInvoicesByStatus(status as InvoiceStatus)
    } else {
      // For now, return all invoices (in production, add pagination)
      invoices = await db.getInvoicesByStatus(InvoiceStatus.CREATED)
    }

    // Apply pagination
    const startIndex = Number.parseInt(offset as string)
    const endIndex = startIndex + Number.parseInt(limit as string)
    const paginatedInvoices = invoices.slice(startIndex, endIndex)

    // Add display amounts and service info
    const enrichedInvoices = paginatedInvoices.map((invoice) => {
      const service = getServiceByType(invoice.serviceType as ServiceType)
      const displayAmount = Number.parseFloat(ethers.formatUnits(invoice.amount, 6))

      return {
        ...invoice,
        displayAmount,
        service,
      }
    })

    res.json({
      success: true,
      invoices: enrichedInvoices,
      pagination: {
        total: invoices.length,
        limit: Number.parseInt(limit as string),
        offset: Number.parseInt(offset as string),
        hasMore: endIndex < invoices.length,
      },
    })
  } catch (error) {
    console.error("Error listing invoices:", error)
    res.status(500).json({
      error: "Failed to list invoices",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export { router as invoiceRoutes }
