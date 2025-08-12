import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const query = `
      SELECT * FROM invoices 
      ${status ? "WHERE status = $1" : ""}
      ORDER BY created_at DESC 
      LIMIT $${status ? "2" : "1"} OFFSET $${status ? "3" : "2"}
    `

    const params = status ? [status, limit, offset] : [limit, offset]
    const invoices = await sql(query, params)

    return NextResponse.json({ invoices, total: invoices.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service_type, service_config, amount, token, chain, customer_email, customer_wallet } = body

    // Validate required fields
    if (!service_type || !amount || !token || !chain) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const invoice = await sql`
      INSERT INTO invoices (
        invoice_id, service_type, service_config, amount, token, chain,
        customer_email, customer_wallet, status, created_at
      ) VALUES (
        ${invoiceId}, ${service_type}, ${JSON.stringify(service_config)}, 
        ${amount}, ${token}, ${chain}, ${customer_email}, ${customer_wallet},
        'pending', NOW()
      ) RETURNING *
    `

    return NextResponse.json({ invoice: invoice[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
