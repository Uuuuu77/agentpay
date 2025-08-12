import express from "express"
import type { DatabaseManager } from "../database"

const router = express.Router()

// Get payment by transaction hash
router.get("/tx/:txHash", async (req, res) => {
  try {
    const db: DatabaseManager = req.app.locals.db
    const { txHash } = req.params

    const payment = await db.getPaymentByTxHash(txHash)
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    res.json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error("Error fetching payment:", error)
    res.status(500).json({
      error: "Failed to fetch payment",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Webhook endpoint for delivery notifications
router.post("/delivery", async (req, res) => {
  try {
    const { type, data } = req.body

    console.log("Received delivery webhook:", { type, data })

    if (type === "payment_confirmed") {
      // Handle payment confirmation
      console.log(`Payment confirmed for invoice ${data.invoiceId}`)

      // Here you would trigger the service delivery process
      // For now, just log the event

      res.json({ success: true, message: "Payment webhook processed" })
    } else if (type === "service_delivered") {
      // Handle service delivery
      console.log(`Service delivered for invoice ${data.invoiceId}`)

      res.json({ success: true, message: "Delivery webhook processed" })
    } else {
      res.status(400).json({ error: "Unknown webhook type" })
    }
  } catch (error) {
    console.error("Error processing delivery webhook:", error)
    res.status(500).json({
      error: "Failed to process webhook",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

export { router as paymentRoutes }
