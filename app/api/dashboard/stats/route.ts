import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's invoice statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status IN ('PAID', 'IN_PROGRESS') THEN 1 END) as active_orders,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as completed_orders,
        COALESCE(SUM(CASE WHEN status != 'CANCELLED' THEN amount ELSE 0 END), 0) as total_spent
      FROM invoices 
      WHERE user_id = ${session.user.id}
    `

    return NextResponse.json({
      totalOrders: Number.parseInt(stats[0].total_orders),
      activeOrders: Number.parseInt(stats[0].active_orders),
      completedOrders: Number.parseInt(stats[0].completed_orders),
      totalSpent: Number.parseFloat(stats[0].total_spent) || 0,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
