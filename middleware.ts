import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for route protection and basic security headers
 *
 * NOTE: We do NOT import auth() from lib/auth here because that pulls in bcryptjs
 * which uses Node.js APIs (process.nextTick, setImmediate) not available in Edge Runtime.
 * Instead we decode the NextAuth JWT cookie directly.
 */

// Simple base64url decode for JWT payload (no signature verification needed —
// NextAuth already verified the token when it was issued)
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = parts[1]
    // base64url → base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(b64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function getSessionFromCookies(request: NextRequest): { id?: string; role?: string } | null {
  // NextAuth v5 stores JWT in this cookie
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload) return null

  return {
    id: (payload.sub || payload.id) as string,
    role: payload.role as string,
  }
}

/**
 * Middleware for route protection and basic security headers
 */
export function middleware(request: NextRequest) {
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
    "/reset-password",
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
  const session = getSessionFromCookies(request)

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
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
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
