import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { rateLimit, rateLimitConfigs } from "./lib/security/rate-limiter"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
    const isPublicRoute = ["/", "/services"].includes(req.nextUrl.pathname)
    const isApiRoute = req.nextUrl.pathname.startsWith("/api")

    const response = NextResponse.next()

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    // CSP header for additional security
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; ")

    response.headers.set("Content-Security-Policy", cspHeader)

    if (isApiRoute && !isApiAuthRoute) {
      let rateLimitConfig = rateLimitConfigs.api

      // Apply stricter rate limits to sensitive endpoints
      if (req.nextUrl.pathname.includes("/payment")) {
        rateLimitConfig = rateLimitConfigs.payment
      } else if (req.nextUrl.pathname.includes("/upload")) {
        rateLimitConfig = rateLimitConfigs.fileUpload
      }

      const rateLimitResult = await rateLimit(rateLimitConfig)(req)
      if (rateLimitResult) {
        return rateLimitResult
      }
    }

    // Apply auth rate limiting to auth pages
    if (isAuthPage) {
      const rateLimitResult = await rateLimit(rateLimitConfigs.auth)(req)
      if (rateLimitResult) {
        return rateLimitResult
      }
    }

    // Allow API auth routes
    if (isApiAuthRoute) {
      return response
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Allow public routes
    if (isPublicRoute) {
      return response
    }

    // Redirect unauthenticated users to sign in
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Check role-based access
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    return response
  },
  {
    callbacks: {
      authorized: () => true, // Let middleware handle the logic
    },
  },
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/protected/:path*",
    "/api/invoices/:path*",
    "/api/payments/:path*",
    "/api/files/:path*",
  ],
}
