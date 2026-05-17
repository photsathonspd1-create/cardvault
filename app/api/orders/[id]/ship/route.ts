// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const shipSchema = z.object({
  shippingProvider: z.string().min(1),
  trackingNumber: z.string().min(5),
  estimatedDelivery: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่系统" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } })
    if (!order) {
      return new Response(
        JSON.stringify({ error: "ไม่พบออเดอร์" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    if (order.sellerId !== userId) {
      return new Response(
        JSON.stringify({ error: "คุณไม่ใช่ผู้ขายของออเดอร์นี้" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    if (order.status !== "PAID") {
      return new Response(
        JSON.stringify({ error: "ออเดอร์นี้ยังไม่ได้ชำระเงิน" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const parsed = shipSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const { shippingProvider, trackingNumber, estimatedDelivery } = parsed.data
    const escrowReleaseAt = new Date()
    escrowReleaseAt.setDate(escrowReleaseAt.getDate() + 7)

    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "SHIPPED",
        shippingProvider,
        trackingNumber,
        shippedAt: new Date(),
        escrowReleaseAt,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        statusHistory: {
          create: {
            status: "SHIPPED",
            note: `จัดส่งผ่าน ${shippingProvider} เลข Tracking: ${trackingNumber}`,
            createdBy: userId,
          },
        },
      },
    })

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "ORDER_SHIPPED",
        title: "ผู้ขายจัดส่งสินค้าแล้ว",
        body: `ออเดอร์ #${order.orderNumber} จัดส่งผ่าน ${shippingProvider} เลข Tracking: ${trackingNumber}`,
        link: `/orders/${order.id}`,
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Ship order error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
