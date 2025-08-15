import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check database connection
    const result = await sql`SELECT 1 as health_check`

    const requiredEnvs = [
      "DATABASE_URL", 
      "PAYEE_ADDRESS", 
      "ALCHEMY_API_KEY",
      "NEXTAUTH_SECRET",
      "OPENAI_API_KEY",
      "GROQ_API_KEY",
      "CONFIRMATIONS_REQUIRED"
    ]

    const missingEnvs = requiredEnvs.filter((env) => !process.env[env])

    const healthStatus = {
      status: missingEnvs.length === 0 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      database: result.length > 0 ? "connected" : "disconnected",
      environment: missingEnvs.length === 0 ? "configured" : "missing_variables",
      missing_variables: missingEnvs,
      version: "1.0.0",
      services: {
        ai_providers: {
          openai: !!process.env.OPENAI_API_KEY,
          groq: !!process.env.GROQ_API_KEY,
          google: !!process.env.GOOGLE_AI_STUDIO_API_KEY
        },
        blockchain: {
          alchemy: !!process.env.ALCHEMY_API_KEY,
          payee_configured: !!process.env.PAYEE_ADDRESS
        }
      }
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
