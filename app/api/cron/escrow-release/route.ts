import { NextRequest } from "next/server"
import { autoReleaseEscrow } from "@/services/escrow.service"

/**
 * Cron endpoint for auto-releasing escrow funds
 * 
 * Called by Vercel Cron daily at 3:00 AM ICT (UTC+7)
 * Verifies via CRON_SECRET or Vercel's x-vercel-cron-secret header
 * 
 * @see vercel.json for cron configuration
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  const vercelCronSecret = request.headers.get("x-vercel-cron-secret")

  // Accept either CRON_SECRET bearer token or Vercel's cron secret header
  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && vercelCronSecret === cronSecret) ||
    // If no CRON_SECRET is set, allow in development
    process.env.NODE_ENV === "development"

  if (!isAuthorized) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const result = await autoReleaseEscrow()

    console.log("Escrow auto-release completed:", {
      released: result.released,
      errors: result.errors.length,
    })

    return new Response(
      JSON.stringify({
        success: true,
        released: result.released,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Escrow auto-release cron error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
