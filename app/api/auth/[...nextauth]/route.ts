// @ts-nocheck
import { handlers } from "@/lib/auth"

// Wrap handlers with error logging for debugging
const originalGet = handlers.GET
const originalPost = handlers.POST

const wrappedGet = async (req: Request, ctx: any) => {
  try {
    return await originalGet(req, ctx)
  } catch (err: any) {
    console.error("[NextAuth GET Error]", err?.message, err?.stack)
    return Response.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}

const wrappedPost = async (req: Request, ctx: any) => {
  try {
    return await originalPost(req, ctx)
  } catch (err: any) {
    console.error("[NextAuth POST Error]", err?.message, err?.stack)
    return Response.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}

export { wrappedGet as GET, wrappedPost as POST }
