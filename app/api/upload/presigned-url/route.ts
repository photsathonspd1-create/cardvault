import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

/**
 * Upload presigned URL endpoint
 * 
 * Rate limit: 30 req/10min/user
 * 
 * In production, this would generate a presigned URL for S3/R2.
 * For development, we return a mock URL.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Rate limit: 30 req/10min/user
    const rateLimitResult = await checkRateLimit(
      rateLimiters.upload,
      userId
    )
    if (!rateLimitResult.success) return rateLimitResult.response

    const body = await request.json()
    const { filename, contentType } = body

    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: "กรุณาระบุ filename และ contentType" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: "อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP, GIF)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Generate unique key
    const ext = filename.split(".").pop() ?? "jpg"
    const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`

    // In production: generate presigned URL for S3/R2
    // For development: return mock URL
    const mockUrl = `/api/upload/mock?key=${encodeURIComponent(key)}`

    return new Response(
      JSON.stringify({
        uploadUrl: mockUrl,
        key,
        publicUrl: `/${key}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Presigned URL error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
