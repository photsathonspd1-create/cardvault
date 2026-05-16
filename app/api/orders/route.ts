import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimiters, checkRateLimit } from "@/lib/rate-limit"
import { calculatePlatformFee, calculateSellerReceives } from "@/services/escrow.service"
import { z } from "zod"

const createOrderSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().positive().default(1),
  shippingName: z.string().min(1).max(200),
  shippingPhone: z.string().min(10).max(20),
  shippingAddress: z.string().min(10).max(500),
  shippingDistrict: z.string().min(1).max(100),
  shippingProvince: z.string().min(1).max(100),
  shippingPostcode: z.string().min(5).max(10),
  shippingProvider: z.string().optional(),
  paymentMethod: z.string().default("card"),
})

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
      rateLimiters.createOrder,
      userId
    )
    if (!rateLimitResult.success) return rateLimitResult.response

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const data = parsed.data

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId, status: "ACTIVE" },
      include: {
        seller: { include: { user: true } },
        shippingOptions: true,
        images: { take: 1 },
      },
    })

    if (!listing) {
      return new Response(
        JSON.stringify({ error: "ไม่พบรายการนี้" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Can't buy own listing
    if (listing.seller.userId === userId) {
      return new Response(
        JSON.stringify({ error: "ไม่สามารถซื้อสินค้าของตัวเองได้" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check quantity
    const availableQty = listing.quantity - listing.soldCount
    if (data.quantity > availableQty) {
      return new Response(
        JSON.stringify({ error: `สินค้าเหลือเพียง ${availableQty} ชิ้น` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Calculate pricing
    const subtotal = listing.price * data.quantity
    const shippingOption = listing.shippingOptions.find(
      (s) => !data.shippingProvider || s.provider === data.shippingProvider
    )
    const shippingFee = shippingOption?.price ?? 0
    const platformFee = calculatePlatformFee(subtotal)
    const totalAmount = subtotal + shippingFee
    const sellerReceives = calculateSellerReceives(subtotal, shippingFee)

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          listingId: listing.id,
          buyerId: userId,
          sellerId: listing.seller.userId,
          cardName: listing.customName ?? "Untitled",
          cardImage: listing.images?.[0]?.url ?? "",
          condition: listing.condition,
          quantity: data.quantity,
          unitPrice: listing.price,
          subtotal,
          shippingFee,
          platformFee,
          totalAmount,
          sellerReceives,
          shippingName: data.shippingName,
          shippingPhone: data.shippingPhone,
          shippingAddress: data.shippingAddress,
          shippingDistrict: data.shippingDistrict,
          shippingProvince: data.shippingProvince,
          shippingPostcode: data.shippingPostcode,
          shippingProvider: shippingOption?.provider,
          paymentMethod: data.paymentMethod,
          status: "PENDING_PAYMENT",
          escrowStatus: "HOLDING",
        },
      })

      // Update listing sold count
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          soldCount: { increment: data.quantity },
          ...(listing.soldCount + data.quantity >= listing.quantity
            ? { status: "SOLD" }
            : {}),
        },
      })

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING_PAYMENT",
          note: "สร้างออเดอร์ รอการชำระเงิน",
        },
      })

      return newOrder
    })

    return new Response(
      JSON.stringify({ success: true, order }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Create order error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
