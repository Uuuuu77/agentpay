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

    // Get comprehensive admin statistics
    const [userStats, orderStats, revenueStats] = await Promise.all([
      sql`SELECT COUNT(*) as total_users FROM users`,
      sql`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status IN ('PAID', 'IN_PROGRESS') THEN 1 END) as active_orders,
          COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as failed_orders
        FROM invoices
      `,
      sql`
        SELECT 
          COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total_revenue
        FROM invoices 
        WHERE status IN ('PAID', 'IN_PROGRESS', 'DELIVERED')
      `,
    ])

    return NextResponse.json({
      totalUsers: Number.parseInt(userStats[0].total_users),
      totalOrders: Number.parseInt(orderStats[0].total_orders),
      activeOrders: Number.parseInt(orderStats[0].active_orders),
      completedOrders: Number.parseInt(orderStats[0].completed_orders),
      failedOrders: Number.parseInt(orderStats[0].failed_orders),
      totalRevenue: Number.parseFloat(revenueStats[0].total_revenue) / 1000000, // Convert from token decimals
    })
  } catch (error) {
    console.error("[v0] Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
