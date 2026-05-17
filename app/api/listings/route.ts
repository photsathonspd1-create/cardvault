// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId, getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"
import { CardSeries, Condition, CardLanguage } from "@prisma/client"

const createListingSchema = z.object({
  series: z.nativeEnum(CardSeries),
  customName: z.string().min(1).max(200),
  customSet: z.string().max(200).optional(),
  cardNumber: z.string().max(50).optional(),
  rarity: z.string().max(100).optional(),
  condition: z.nativeEnum(Condition),
  language: z.nativeEnum(CardLanguage).default("THAI"),
  isGraded: z.boolean().default(false),
  gradingCompany: z.string().max(50).nullable().optional(),
  gradeScore: z.string().max(20).nullable().optional(),
  gradeCertNo: z.string().max(100).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive().nullable().optional(),
  isNegotiable: z.boolean().default(false),
  quantity: z.number().int().positive().default(1),
  shippingOptions: z.array(z.object({
    provider: z.string(),
    name: z.string(),
    price: z.number().int().min(0),
    estimatedDays: z.string(),
  })).optional(),
  images: z.array(z.string().url()).max(6).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Rate limit: 10 req/hr/user
    const rateLimitResult = await checkRateLimit(
      rateLimiters.createListing,
      userId
    )
    if (!rateLimitResult.success) return rateLimitResult.response

    const body = await request.json()
    const parsed = createListingSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const data = parsed.data

    // Get or create seller profile
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    })

    if (!sellerProfile) {
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId,
          displayName: "Seller",
        },
      })
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        sellerId: sellerProfile.id,
        series: data.series,
        customName: data.customName,
        customSet: data.customSet,
        customSeries: data.series,
        condition: data.condition,
        language: data.language,
        isGraded: data.isGraded,
        gradingCompany: data.gradingCompany ?? undefined,
        gradeScore: data.gradeScore ?? undefined,
        gradeCertNo: data.gradeCertNo ?? undefined,
        description: data.description ?? undefined,
        price: data.price,
        originalPrice: data.originalPrice ?? undefined,
        isNegotiable: data.isNegotiable,
        quantity: data.quantity,
        status: "PENDING_REVIEW",
        images: data.images
          ? {
              create: data.images.map((url, i) => ({
                url,
                type: "photo",
                order: i,
              })),
            }
          : undefined,
        shippingOptions: data.shippingOptions
          ? {
              create: data.shippingOptions,
            }
          : undefined,
      },
    })

    return new Response(
      JSON.stringify({ success: true, listing }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Create listing error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const series = searchParams.get("series")
    const condition = searchParams.get("condition")
    const sort = searchParams.get("sort") ?? "newest"
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)

    const where: any = { status: "ACTIVE" }
    if (series && series !== "ALL") where.series = series
    if (condition && condition !== "ALL") where.condition = condition

    let orderBy: any = { createdAt: "desc" }
    if (sort === "price_asc") orderBy = { price: "asc" }
    if (sort === "price_desc") orderBy = { price: "desc" }
    if (sort === "popular") orderBy = { views: "desc" }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          seller: {
            include: {
              user: { select: { name: true, username: true } },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return new Response(
      JSON.stringify({
        listings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Get listings error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
