// @ts-nocheck
import { handlers } from "@/lib/auth"
import { NextRequest } from "next/server"

// Wrap handlers with detailed error logging
const originalGet = handlers.GET
const originalPost = handlers.POST

async function wrappedGet(req: Request, ctx: any) {
  try {
    return await originalGet(req, ctx)
  } catch (err: any) {
    console.error("[NextAuth GET Error]", err?.message, err?.stack)
    return Response.json({
      error: err?.message || "Internal error",
      name: err?.name,
      stack: err?.stack?.split("\n").slice(0, 5),
    }, { status: 500 })
  }
}

async function wrappedPost(req: Request, ctx: any) {
  try {
    return await originalPost(req, ctx)
  } catch (err: any) {
    console.error("[NextAuth POST Error]", err?.message, err?.stack)
    return Response.json({
      error: err?.message || "Internal error",
      name: err?.name,
      stack: err?.stack?.split("\n").slice(0, 5),
    }, { status: 500 })
  }
}

export { wrappedGet as GET, wrappedPost as POST }
