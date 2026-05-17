import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Get user ID from session.
 * Tries auth() first. If it fails (known NextAuth v5 beta issue on Netlify
 * where auth() doesn't get request context in API routes), falls back to
 * calling the internal session endpoint.
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  // Try auth() first (works in server components, sometimes works in API routes)
  try {
    const session = await auth()
    const id = (session?.user as { id?: string })?.id
    if (id) return id
  } catch {}

  // Fallback: call the internal session endpoint with the request cookies
  try {
    const cookieHeader = request.headers.get("cookie") || ""
    if (cookieHeader) {
      const baseUrl = process.env.NEXTAUTH_URL || "https://cardvault-tcg.netlify.app"
      const res = await fetch(`${baseUrl}/api/auth/session`, {
        headers: { cookie: cookieHeader },
      })
      if (res.ok) {
        const session = await res.json()
        if (session?.user?.id) return session.user.id as string
      }
    }
  } catch {}

  return null
}

/**
 * Get full session (with role, etc.)
 */
export async function getSession(request: NextRequest) {
  // Try auth() first
  try {
    const session = await auth()
    if (session?.user) return session
  } catch {}

  // Fallback: call the internal session endpoint
  try {
    const cookieHeader = request.headers.get("cookie") || ""
    if (cookieHeader) {
      const baseUrl = process.env.NEXTAUTH_URL || "https://cardvault-tcg.netlify.app"
      const res = await fetch(`${baseUrl}/api/auth/session`, {
        headers: { cookie: cookieHeader },
      })
      if (res.ok) {
        const session = await res.json()
        if (session?.user) return session
      }
    }
  } catch {}

  return null
}
