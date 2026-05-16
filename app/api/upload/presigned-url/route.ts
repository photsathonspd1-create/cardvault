import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"
import { generatePresignedUploadUrl, isR2Configured } from "@/lib/r2"
import crypto from "crypto"

/**
 * Upload presigned URL endpoint
 *
 * Rate limit: 30 req/10min/user
 *
 * If R2 is configured → generate real presigned URL
 * Otherwise → return mock URL (development)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined
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
    const { filename, contentType, fileSize } = body as {
      filename?: string
      contentType?: string
      fileSize?: number
    }

    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: "กรุณาระบุ filename และ contentType" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: "อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate file size (5MB max)
    if (fileSize && fileSize > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "ไฟล์ต้องมีขนาดไม่เกิน 5MB" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Real R2 upload
    if (isR2Configured()) {
      const result = await generatePresignedUploadUrl(
        userId,
        filename,
        contentType,
        fileSize
      )
      return new Response(
        JSON.stringify({
          uploadUrl: result.uploadUrl,
          key: result.key,
          publicUrl: result.publicUrl,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    // Fallback: mock URL for development
    const ext = filename.split(".").pop() ?? "jpg"
    const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`
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
