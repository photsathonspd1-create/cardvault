// @ts-nocheck
import { NextResponse } from "next/server"
import { handlers } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Try calling the NextAuth CSRF handler directly
    const csrfReq = new Request("https://cardvault-tcg.netlify.app/api/auth/csrf", {
      method: "GET",
      headers: req.headers,
    })
    const response = await handlers.GET(csrfReq)
    const body = await response.text()
    return NextResponse.json({
      status: response.status,
      body: body.substring(0, 500),
      headers: Object.fromEntries(response.headers.entries()),
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message,
      name: err?.name,
      stack: err?.stack?.split("\n").slice(0, 10),
    })
  }
}
