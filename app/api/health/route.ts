import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check database connection
    const result = await sql`SELECT 1 as health_check`

    const requiredEnvs = ["DATABASE_URL", "PAYEE_ADDRESS", "ALCHEMY_API_KEY"]

    const missingEnvs = requiredEnvs.filter((env) => !process.env[env])

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: result.length > 0 ? "connected" : "disconnected",
      environment: missingEnvs.length === 0 ? "configured" : "missing_variables",
      missing_variables: missingEnvs,
      version: "1.0.0",
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
