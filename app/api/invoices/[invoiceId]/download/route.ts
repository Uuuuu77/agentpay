import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get invoice and verify ownership
    const invoice = await sql`
      SELECT * FROM invoices 
      WHERE id = ${params.invoiceId} 
      AND payer = ${session.user.address}
      AND status = 'completed'
    `

    if (invoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found or not accessible" }, { status: 404 })
    }

    const invoiceData = invoice[0]

    // Check if deliverable exists
    if (!invoiceData.deliverable_url) {
      return NextResponse.json({ error: "No deliverable found for this invoice" }, { status: 404 })
    }

    // Construct file path
    const filePath = path.join(process.cwd(), "public", invoiceData.deliverable_url)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Deliverable file not found" }, { status: 404 })
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    
    // Return file
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      }
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get invoice and verify ownership
    const invoice = await sql`
      SELECT * FROM invoices 
      WHERE id = ${params.invoiceId} 
      AND payer = ${session.user.address}
    `

    if (invoice.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoiceData = invoice[0]

    // Return download URL for frontend
    if (invoiceData.deliverable_url) {
      return NextResponse.json({ 
        downloadUrl: `/api/invoices/${params.invoiceId}/download`,
        filename: `AgentPay-${invoiceData.service_type}-${invoiceData.id}.zip`,
        status: invoiceData.status,
        deliveredAt: invoiceData.delivered_at
      })
    }

    return NextResponse.json({ error: "No deliverable available" }, { status: 404 })
  } catch (error) {
    console.error("Download info error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}