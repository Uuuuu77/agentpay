import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all orders with user information
    const orders = await sql`
      SELECT 
        i.*,
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 100
    `

    const formattedOrders = orders.map((order) => ({
      ...order,
      displayAmount: (Number.parseFloat(order.amount) / 1000000).toFixed(2), // Convert from token decimals
      userEmail: order.user_email,
      userName: order.first_name && order.last_name ? `${order.first_name} ${order.last_name}` : null,
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error("[v0] Admin orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
