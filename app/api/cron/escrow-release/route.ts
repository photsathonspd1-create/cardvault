import { NextRequest } from "next/server"
import { autoReleaseEscrow } from "@/services/escrow.service"

/**
 * Cron endpoint for auto-releasing escrow funds
 * 
 * Called by Vercel Cron daily at 3:00 AM ICT (UTC+7)
 * Verifies CRON_SECRET to prevent unauthorized access
 * 
 * @see vercel.json for cron configuration
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("CRON_SECRET not configured")
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
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
