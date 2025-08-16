import { neon } from "@neondatabase/serverless"
import { DeliveryService } from "@/lib/email/delivery-service"

const sql = neon(process.env.DATABASE_URL!)

export class DeliveryEngine {
  private deliveryService: DeliveryService
  private isRunning = false

  constructor() {
    this.deliveryService = new DeliveryService()
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[v0] Delivery engine already running")
      return
    }

    this.isRunning = true
    console.log("[v0] Starting delivery engine...")

    // Process pending invoices immediately
    await this.processPendingInvoices()

    // Set up periodic processing (every 30 seconds)
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval)
        return
      }

      try {
        await this.processPendingInvoices()
      } catch (error) {
        console.error("[v0] Periodic processing error:", error)
      }
    }, 30000)

    console.log("[v0] Delivery engine started successfully")
  }

  async stop(): Promise<void> {
    this.isRunning = false
    console.log("[v0] Delivery engine stopped")
  }

  private async processPendingInvoices(): Promise<void> {
    try {
      // Get all paid invoices that haven't been processed yet
      const pendingInvoices = await sql`
        SELECT * FROM invoices 
        WHERE status = 'PAID' 
        AND deliverable_url IS NULL
        ORDER BY confirmed_at ASC
        LIMIT 10
      `

      if (pendingInvoices.length === 0) {
        return
      }

      console.log(`[v0] Processing ${pendingInvoices.length} pending invoices`)

      for (const invoice of pendingInvoices) {
        try {
          console.log(`[v0] Processing invoice ${invoice.invoice_id}`)
          await this.processInvoiceSimple(invoice)
        } catch (error) {
          console.error(`[v0] Failed to process invoice ${invoice.invoice_id}:`, error)

          // Mark invoice as failed (you might want to add a FAILED status)
          await sql`
            UPDATE invoices 
            SET 
              status = 'CREATED',
              updated_at = NOW()
            WHERE invoice_id = ${invoice.invoice_id}
          `
        }
      }
    } catch (error) {
      console.error("[v0] Error processing pending invoices:", error)
    }
  }

  async processInvoice(invoiceId: string): Promise<void> {
    try {
      const invoiceResult = await sql`
        SELECT * FROM invoices WHERE invoice_id = ${invoiceId}
      `

      if (invoiceResult.length === 0) {
        throw new Error(`Invoice ${invoiceId} not found`)
      }

      const invoice = invoiceResult[0]
      await this.processInvoiceSimple(invoice)
    } catch (error) {
      console.error(`[v0] Failed to process invoice ${invoiceId}:`, error)
      throw error
    }
  }

  private async processInvoiceSimple(invoice: any): Promise<void> {
    try {
      // Generate simple results for the service
      const results = {
        content: `Service ${invoice.service_type} completed successfully for invoice ${invoice.invoice_id}`,
        deliverables: [
          {
            name: `${invoice.service_type}-results.md`,
            content: `# ${invoice.service_type} Service Results\n\nService completed successfully.\n\nInvoice ID: ${invoice.invoice_id}\nDescription: ${invoice.description}\nAmount: $${invoice.amount}`,
            type: "text/markdown"
          }
        ]
      }

      // Use delivery service to send email and save files
      const deliveryResult = await this.deliveryService.deliverResults(invoice, results)
      
      if (deliveryResult.success) {
        // Update invoice with delivery URL
        await sql`
          UPDATE invoices 
          SET 
            deliverable_url = ${deliveryResult.downloadUrl},
            status = 'DELIVERED',
            updated_at = NOW()
          WHERE invoice_id = ${invoice.invoice_id}
        `
        
        console.log(`[v0] Invoice ${invoice.invoice_id} delivered successfully`)
      } else {
        throw new Error('Delivery failed')
      }
    } catch (error) {
      console.error(`[v0] Failed to process invoice ${invoice.invoice_id}:`, error)
      throw error
    }
  }

  getStatus(): { running: boolean; uptime: number } {
    return {
      running: this.isRunning,
      uptime: this.isRunning ? Date.now() : 0,
    }
  }
}

// Global delivery engine instance
let deliveryEngine: DeliveryEngine | null = null

export function getDeliveryEngine(): DeliveryEngine {
  if (!deliveryEngine) {
    deliveryEngine = new DeliveryEngine()
  }
  return deliveryEngine
}
