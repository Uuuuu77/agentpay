import { type NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
  skipSuccessfulRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class MemoryRateLimitStore {
  private store: RateLimitStore = {}

  get(key: string): { count: number; resetTime: number } | null {
    const record = this.store[key]
    if (!record) return null

    // Clean up expired records
    if (Date.now() > record.resetTime) {
      delete this.store[key]
      return null
    }

    return record
  }

  set(key: string, count: number, resetTime: number): void {
    this.store[key] = { count, resetTime }
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now()
    const record = this.get(key)

    if (!record) {
      const newRecord = { count: 1, resetTime: now + windowMs }
      this.set(key, 1, now + windowMs)
      return newRecord
    }

    record.count++
    this.set(key, record.count, record.resetTime)
    return record
  }

  // Clean up expired records periodically
  cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }
}

const store = new MemoryRateLimitStore()

// Clean up expired records every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000)

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const identifier = getClientIdentifier(request)
    const key = `${identifier}:${request.nextUrl.pathname}`

    const record = store.increment(key, config.windowMs)

    if (record.count > config.maxRequests) {
      const resetTime = Math.ceil((record.resetTime - Date.now()) / 1000)

      return NextResponse.json(
        {
          error: config.message || "Too many requests",
          retryAfter: resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": record.resetTime.toString(),
            "Retry-After": resetTime.toString(),
          },
        },
      )
    }

    return null // Allow request to proceed
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxy/CDN scenarios)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown"

  // For authenticated requests, use user ID if available
  const userId = request.headers.get("x-user-id")

  return userId || ip
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: "Too many authentication attempts, please try again later",
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: "API rate limit exceeded",
  },
  fileUpload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    message: "File upload rate limit exceeded",
  },
  payment: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 payment attempts per 5 minutes
    message: "Payment rate limit exceeded",
  },
}
