import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Get user ID from session — tries auth() first, then falls back to JWT cookie decode.
 * This is needed because auth() in API route handlers on Netlify sometimes doesn't
 * receive the request context properly (NextAuth v5 beta issue).
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await auth()
    const id = (session?.user as { id?: string })?.id
    if (id) return id
  } catch {}

  // Fallback: decode JWT cookie directly
  try {
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value
    if (token) {
      const parts = token.split(".")
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(atob(b64))
        return ((payload.sub || payload.id) as string) || null
      }
    }
  } catch {}

  return null
}

/**
 * Get full session (with role, etc.) — tries auth() first, then falls back to JWT decode.
 */
export async function getSession(request: NextRequest) {
  try {
    const session = await auth()
    if (session?.user) return session
  } catch {}

  // Fallback: decode JWT cookie directly
  try {
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value
    if (token) {
      const parts = token.split(".")
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(atob(b64))
        const userId = (payload.sub || payload.id) as string
        if (userId) {
          return {
            user: {
              id: userId,
              role: payload.role as string,
              email: payload.email as string,
              name: payload.name as string,
            },
          }
        }
      }
    }
  } catch {}

  return null
}
