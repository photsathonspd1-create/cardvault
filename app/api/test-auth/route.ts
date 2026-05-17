// @ts-nocheck
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test if auth module can be loaded
    const authModule = await import("@/lib/auth")
    return NextResponse.json({ ok: true, exports: Object.keys(authModule) })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, stack: err?.stack?.split("\n").slice(0, 5) })
  }
}
