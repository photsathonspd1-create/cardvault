// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId } from "@/lib/auth-helpers"
import { supabaseAdmin } from "@/lib/supabase-client"
import { checkRateLimit, rateLimiters } from "@/lib/rate-limit"
import crypto from "crypto"

const BUCKET = "card-images"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/**
 * Upload API
 * POST /api/upload
 * Accepts multipart form with image file
 * Returns public URL from Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Rate limit
    const rateLimitResult = await checkRateLimit(rateLimiters.upload, userId)
    if (!rateLimitResult.success) return rateLimitResult.response

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return new Response(
        JSON.stringify({ error: "กรุณาเลือกไฟล์" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "อนุญาตเฉพาะไฟล์ JPG, PNG, WebP, GIF" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "ไฟล์ต้องมีขนาดไม่เกิน 10MB" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg"
    const uniqueId = crypto.randomUUID()
    const filePath = `listings/${userId}/${uniqueId}.${ext}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Supabase upload error:", error)

      // If bucket doesn't exist, try to create it
      if (error.message?.includes("Bucket not found")) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_TYPES,
        })

        if (createError) {
          console.error("Create bucket error:", createError)
          return new Response(
            JSON.stringify({ error: "ไม่สามารถอัปโหลดได้ กรุณาลองใหม่" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          )
        }

        // Retry upload
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          })

        if (retryError) {
          console.error("Retry upload error:", retryError)
          return new Response(
            JSON.stringify({ error: "ไม่สามารถอัปโหลดได้ กรุณาลองใหม่" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ error: "ไม่สามารถอัปโหลดได้ กรุณาลองใหม่" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        path: filePath,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
