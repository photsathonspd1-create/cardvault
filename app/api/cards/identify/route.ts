import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"
import { identifyCard, searchPokemonCards } from "@/services/card-identify.service"

/**
 * Card Identification API
 * 
 * POST /api/cards/identify
 * - Accepts multipart form with image file
 * - Uses Tesseract.js OCR to extract text
 * - Searches Pokemon TCG API for matches
 * 
 * Rate limit: 20 req/hr/user (external API calls)
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

    // Rate limit: 20 req/hr/user
    const rateLimitResult = await checkRateLimit(
      rateLimiters.cardIdentify,
      userId
    )
    if (!rateLimitResult.success) return rateLimitResult.response

    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: "กรุณาอัปโหลดรูปภาพ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({ error: "ไฟล์ต้องเป็นรูปภาพ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Max 10MB
    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "ไฟล์ต้องมีขนาดไม่เกิน 10MB" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Convert to buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Run identification pipeline
    const result = await identifyCard(buffer)

    return new Response(
      JSON.stringify({
        success: true,
        ocrText: result.ocrText,
        ocrConfidence: result.ocrConfidence,
        candidates: result.candidates.map((card) => ({
          id: card.id,
          name: card.name,
          set: card.set.name,
          series: card.set.series,
          number: card.number,
          rarity: card.rarity,
          imageUrl: card.images.small,
          imageUrlHi: card.images.large,
          marketPrice: card.tcgplayer?.prices?.holofoil?.market ?? card.tcgplayer?.prices?.normal?.market ?? null,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Card identification error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดในการระบุการ์ด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

/**
 * Search Pokemon TCG API directly
 * GET /api/cards/identify?q=pikachu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: "กรุณากรอกคำค้นหาอย่างน้อย 2 ตัวอักษร" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const session = await auth()
    const userId2 = (session?.user as any)?.id
    if (!userId2) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Rate limit
    const rateLimitResult = await checkRateLimit(
      rateLimiters.cardIdentify,
      userId2
    )
    if (!rateLimitResult.success) return rateLimitResult.response

    const result = await searchPokemonCards(query, { pageSize: 10 })

    return new Response(
      JSON.stringify({
        cards: result.cards.map((card) => ({
          id: card.id,
          name: card.name,
          set: card.set.name,
          series: card.set.series,
          number: card.number,
          rarity: card.rarity,
          imageUrl: card.images.small,
          imageUrlHi: card.images.large,
        })),
        total: result.totalCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Card search error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
