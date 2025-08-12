import axios from "axios"

interface PaymentWebhookData {
  invoiceId: string
  txHash: string
  payer: string
  amount: string
  token: string
  chain: string
  serviceType: string
  description: string
}

export class WebhookManager {
  private webhookUrl: string
  private maxRetries = 3
  private retryDelay = 1000 // 1 second

  constructor() {
    this.webhookUrl = process.env.AGENT_DELIVERY_URL || "http://localhost:3001/api/delivery"
  }

  async sendPaymentWebhook(data: PaymentWebhookData): Promise<void> {
    console.log(`Sending payment webhook for invoice ${data.invoiceId}`)

    const payload = {
      type: "payment_confirmed",
      timestamp: new Date().toISOString(),
      data,
    }

    await this.sendWebhookWithRetry(payload)
  }

  private async sendWebhookWithRetry(payload: any, attempt = 1): Promise<void> {
    try {
      const response = await axios.post(this.webhookUrl, payload, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AgentPay-Webhook/1.0",
        },
      })

      if (response.status >= 200 && response.status < 300) {
        console.log(`Webhook sent successfully (attempt ${attempt})`)
        return
      }

      throw new Error(`Webhook failed with status ${response.status}`)
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed:`, error)

      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
        console.log(`Retrying webhook in ${delay}ms...`)

        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.sendWebhookWithRetry(payload, attempt + 1)
      }

      console.error(`Webhook failed after ${this.maxRetries} attempts`)
      throw error
    }
  }

  async sendDeliveryWebhook(invoiceId: string, deliverableUrl: string): Promise<void> {
    console.log(`Sending delivery webhook for invoice ${invoiceId}`)

    const payload = {
      type: "service_delivered",
      timestamp: new Date().toISOString(),
      data: {
        invoiceId,
        deliverableUrl,
      },
    }

    await this.sendWebhookWithRetry(payload)
  }
}
