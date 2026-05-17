import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Middleware for route protection and basic security headers
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers for all responses
  const response = NextResponse.next()
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )

  // Public routes that don't need auth
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/browse",
    "/listing",
    "/card",
    "/check",
    "/forgot-password",
    "/faq",
    "/how-it-works",
    "/escrow-info",
    "/contact",
    "/terms",
    "/privacy",
    "/api/auth",
    "/api/listings",
    "/api/cards",
    "/api/reports/scammer/check",
    "/api/webhooks",
    "/api/debug",
  ]

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  if (isPublicPath) {
    return response
  }

  // Check auth for protected routes
  const session = await auth()

  // Sell routes - require login
  if (pathname.startsWith("/sell") && !session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes - require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
    const role = (session.user as any)?.role
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // API routes - require auth (except public ones above)
  if (pathname.startsWith("/api/") && !session) {
    return Response.json(
      { error: "กรุณาเข้าสู่ระบบ" },
      { status: 401 }
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
