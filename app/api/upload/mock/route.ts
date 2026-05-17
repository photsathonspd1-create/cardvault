import { NextRequest } from "next/server"

/**
 * Mock upload handler for development/testing when R2 is not configured.
 * Accepts PUT requests and returns a placeholder URL.
 */
export async function PUT(request: NextRequest) {
  // Just accept the upload and return a placeholder
  const body = await request.arrayBuffer()
  const size = body.byteLength

  return new Response(
    JSON.stringify({
      success: true,
      message: "Mock upload successful",
      size,
      url: `https://placehold.co/400x560/1a1a2e/ffffff?text=CardVault+Upload`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}

export async function POST(request: NextRequest) {
  return PUT(request)
}
