import { type NextRequest, NextResponse } from "next/server"
import { rateLimit, rateLimitConfigs } from "@/lib/security/rate-limiter"
import { fileUploadSchema } from "@/lib/security/validation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(rateLimitConfigs.api)(request)
    if (rateLimitResult) return rateLimitResult

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = fileUploadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { filename, size, mimeType } = validation.data

    // Additional security checks
    const securityChecks = {
      filenameSafe: !/[<>:"/\\|?*]/.test(filename),
      sizeReasonable: size > 0 && size <= 50 * 1024 * 1024,
      mimeTypeAllowed: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "application/pdf",
        "text/plain",
        "text/markdown",
        "application/zip",
        "application/json",
      ].includes(mimeType),
    }

    const isValid = Object.values(securityChecks).every((check) => check)

    return NextResponse.json({
      valid: isValid,
      checks: securityChecks,
      recommendations: isValid
        ? []
        : [
            !securityChecks.filenameSafe && "Use alphanumeric characters in filename",
            !securityChecks.sizeReasonable && "File size must be between 1 byte and 50MB",
            !securityChecks.mimeTypeAllowed && "File type not supported",
          ].filter(Boolean),
    })
  } catch (error) {
    console.error("[v0] Security validation error:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
