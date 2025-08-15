import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export class DeliveryEngine {
  private isRunning = false

  constructor() {
    // Simplified constructor without SQLite dependencies for build
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
          // Simplified processing without SQLite dependencies
          await this.processSimpleInvoice(invoice)
        } catch (error) {
          console.error(`[v0] Failed to process invoice ${invoice.invoice_id}:`, error)

          // Mark invoice as failed
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

  private async processSimpleInvoice(invoice: any): Promise<void> {
    // Simplified invoice processing that doesn't require SQLite
    await sql`
      UPDATE invoices 
      SET 
        status = 'IN_PROGRESS',
        updated_at = NOW()
      WHERE invoice_id = ${invoice.invoice_id}
    `
    
    console.log(`[v0] Marked invoice ${invoice.invoice_id} as in progress`)
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
      await this.processSimpleInvoice(invoice)
    } catch (error) {
      console.error(`[v0] Failed to process invoice ${invoiceId}:`, error)
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
