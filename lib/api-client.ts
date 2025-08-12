export class AgentPayAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
  }

  async createInvoice(invoiceData: {
    service_type: string
    service_config: any
    amount: number
    token: string
    chain: string
    customer_email?: string
    customer_wallet?: string
  }) {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    })
    return response.json()
  }

  async getInvoice(invoiceId: string) {
    const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}`)
    return response.json()
  }

  async getInvoices(filters?: { status?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.offset) params.append("offset", filters.offset.toString())

    const response = await fetch(`${this.baseUrl}/invoices?${params}`)
    return response.json()
  }

  async startPaymentWatcher(chain = "polygon") {
    const response = await fetch(`${this.baseUrl}/watcher/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chain }),
    })
    return response.json()
  }

  async getHealth() {
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }
}

export const agentPayAPI = new AgentPayAPI()
