import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/listings/[id]/feature — Feature a listing (paid boost)
 *
 * Pricing:
 *   homepage_banner: 299฿/day (max 3 slots)
 *   category_top:    99฿/day
 *   search_boost:    49฿/day
 */

const FEATURE_PRICES: Record<string, number> = {
  homepage_banner: 29900, // in สตางค์
  category_top: 9900,
  search_boost: 4900,
}

const MAX_HOMEPAGE_SLOTS = 3

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { type, days = 1 } = body as {
      type?: string
      days?: number
    }

    if (!type || !FEATURE_PRICES[type]) {
      return new Response(
        JSON.stringify({ error: "ประเภทโปรโมชั่นไม่ถูกต้อง" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (days < 1 || days > 30) {
      return new Response(
        JSON.stringify({ error: "จำนวนวันต้องอยู่ระหว่าง 1-30 วัน" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { seller: true },
    })

    if (!listing) {
      return new Response(JSON.stringify({ error: "ไม่พบรายการ" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (listing.seller.userId !== userId) {
      return new Response(
        JSON.stringify({ error: "คุณไม่ใช่เจ้าของรายการนี้" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    if (listing.status !== "ACTIVE") {
      return new Response(
        JSON.stringify({ error: "รายการต้องมีสถานะเปิดขายเท่านั้น" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check homepage banner slot limit
    if (type === "homepage_banner") {
      const activeBanners = await prisma.listing.count({
        where: {
          isFeatured: true,
          featuredUntil: { gt: new Date() },
          status: "ACTIVE",
        },
      })
      if (activeBanners >= MAX_HOMEPAGE_SLOTS) {
        return new Response(
          JSON.stringify({
            error: `ตำแหน่ง Homepage Banner เต็มแล้ว (สูงสุด ${MAX_HOMEPAGE_SLOTS} รายการ)`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      }
    }

    const pricePerDay = FEATURE_PRICES[type]
    const totalPrice = pricePerDay * days
    const featuredUntil = new Date()
    featuredUntil.setDate(featuredUntil.getDate() + days)

    // Update listing
    await prisma.listing.update({
      where: { id: params.id },
      data: {
        isFeatured: true,
        featuredUntil,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        type,
        days,
        totalPrice,
        featuredUntil: featuredUntil.toISOString(),
        message: `โปรโมทสำเร็จ ${days} วัน — ${totalPrice / 100} บาท`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Feature listing error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
