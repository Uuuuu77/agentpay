import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { invoiceId: string } }) {
  try {
    const invoice = await sql`
      SELECT * FROM invoices WHERE invoice_id = ${params.invoiceId}
    `

    if (invoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Get related payments
    const payments = await sql`
      SELECT * FROM payments WHERE invoice_id = ${params.invoiceId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      invoice: invoice[0],
      payments,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { invoiceId: string } }) {
  try {
    const body = await request.json()
    const { status, delivery_url, notes } = body

    const updated = await sql`
      UPDATE invoices 
      SET status = ${status}, delivery_url = ${delivery_url}, 
          notes = ${notes}, updated_at = NOW()
      WHERE invoice_id = ${params.invoiceId}
      RETURNING *
    `

    if (updated.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ invoice: updated[0] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}
