import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get("invoice_id")
    const status = searchParams.get("status")

    let query = "SELECT * FROM payments WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (invoiceId) {
      query += ` AND invoice_id = $${paramIndex}`
      params.push(invoiceId)
      paramIndex++
    }

    if (status) {
      query += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += " ORDER BY created_at DESC"

    const payments = await sql(query, params)
    return NextResponse.json({ payments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoice_id, tx_hash, amount, token, chain, from_address, block_number } = body

    const payment = await sql`
      INSERT INTO payments (
        invoice_id, tx_hash, amount, token, chain, from_address,
        block_number, status, created_at
      ) VALUES (
        ${invoice_id}, ${tx_hash}, ${amount}, ${token}, ${chain},
        ${from_address}, ${block_number}, 'pending', NOW()
      ) RETURNING *
    `

    return NextResponse.json({ payment: payment[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}
