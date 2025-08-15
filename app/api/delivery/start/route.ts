import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { getDeliveryEngine } from "@/lib/service-delivery/delivery-engine"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only allow admin users to start/stop the delivery engine
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deliveryEngine = getDeliveryEngine()
    await deliveryEngine.start()

    return NextResponse.json({
      success: true,
      message: "Delivery engine started",
      status: deliveryEngine.getStatus(),
    })
  } catch (error) {
    console.error("[v0] Delivery engine start error:", error)
    return NextResponse.json({ error: "Failed to start delivery engine" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const deliveryEngine = getDeliveryEngine()
    const status = deliveryEngine.getStatus()

    return NextResponse.json({ status })
  } catch (error) {
    console.error("[v0] Delivery engine status error:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
