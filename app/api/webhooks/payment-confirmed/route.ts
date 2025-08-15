import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { ServiceProcessor } from "@/backend/services/service-processor"
import { DatabaseManager } from "@/backend/database"
import { WebhookManager } from "@/backend/webhook-manager"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature if needed
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get("x-webhook-signature")
      // Add signature verification logic here
    }

    const { type, data } = body

    if (type !== "payment_confirmed") {
      return NextResponse.json({ error: "Invalid webhook type" }, { status: 400 })
    }

    const { invoiceId, txHash, payer, amount, token, chain } = data

    console.log(`[v0] Payment confirmed webhook received for invoice ${invoiceId}`)

    // Update invoice with payment details
    await sql`
      UPDATE invoices 
      SET 
        status = 'PAID',
        tx_hash = ${txHash},
        payer_address = ${payer},
        confirmed_at = NOW(),
        updated_at = NOW()
      WHERE invoice_id = ${invoiceId}
    `

    // Get the updated invoice
    const invoiceResult = await sql`
      SELECT * FROM invoices WHERE invoice_id = ${invoiceId}
    `

    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = invoiceResult[0]

    // Initialize service processor
    const dbManager = new DatabaseManager()
    const webhookManager = new WebhookManager()
    const serviceProcessor = new ServiceProcessor(dbManager, webhookManager)

    // Process the service delivery asynchronously
    setImmediate(async () => {
      try {
        await serviceProcessor.processInvoice(invoice)
        console.log(`[v0] Service processing completed for invoice ${invoiceId}`)
      } catch (error) {
        console.error(`[v0] Service processing failed for invoice ${invoiceId}:`, error)
      }
    })

    return NextResponse.json({
      success: true,
      message: "Payment confirmed, service processing initiated",
    })
  } catch (error) {
    console.error("[v0] Payment webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
