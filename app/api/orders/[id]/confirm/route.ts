import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { releaseEscrow } from "@/services/escrow.service"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }),
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

    if (order.buyerId !== userId) {
      return new Response(
        JSON.stringify({ error: "คุณไม่ใช่ผู้ซื้อของออเดอร์นี้" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    if (order.status !== "SHIPPED" && order.status !== "DELIVERED") {
      return new Response(
        JSON.stringify({ error: "ออเดอร์นี้ยังไม่ได้จัดส่ง" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Release escrow to seller
    await releaseEscrow(order.id, "buyer")

    // Update order status
    await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        confirmedAt: new Date(),
        completedAt: new Date(),
        statusHistory: {
          create: {
            status: "COMPLETED",
            note: "ผู้ซื้อยืนยันรับสินค้าแล้ว",
            createdBy: userId,
          },
        },
      },
    })

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: "ORDER_COMPLETED",
        title: "ออเดอร์สำเร็จ!",
        body: `ผู้ซื้อยืนยันรับสินค้าแล้ว เงินถูกปล่อยให้คุณ`,
        link: `/sell/orders`,
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Confirm order error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
