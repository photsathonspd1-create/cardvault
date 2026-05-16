// @ts-nocheck
import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { freezeEscrow } from "@/services/escrow.service"
import { z } from "zod"
import { DisputeReason } from "@prisma/client"

const disputeSchema = z.object({
  reason: z.nativeEnum(DisputeReason),
  description: z.string().min(20, "กรุณาอธิบายอย่างน้อย 20 ตัวอักษร"),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
})

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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { dispute: true },
    })
    if (!order) {
      return new Response(
        JSON.stringify({ error: "ไม่พบออเดอร์" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    if (order.buyerId !== userId) {
      return new Response(
        JSON.stringify({ error: "เฉพาะผู้ซื้อเท่านั้นที่เปิดข้อพิพาทได้" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    if (order.dispute) {
      return new Response(
        JSON.stringify({ error: "ออเดอร์นี้มีข้อพิพาทอยู่แล้ว" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!["PAID", "SHIPPED", "DELIVERED"].includes(order.status)) {
      return new Response(
        JSON.stringify({ error: "ไม่สามารถเปิดข้อพิพาทสำหรับออเดอร์นี้ได้" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const parsed = disputeSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const { reason, description, evidenceUrls } = parsed.data

    // Create dispute and freeze escrow
    const sellerRespondBy = new Date()
    sellerRespondBy.setHours(sellerRespondBy.getHours() + 48)

    await prisma.$transaction(async (tx) => {
      await tx.dispute.create({
        data: {
          orderId: order.id,
          raisedById: userId,
          reason,
          description,
          sellerRespondBy,
          evidence: evidenceUrls
            ? {
                create: evidenceUrls.map((url) => ({
                  addedById: userId,
                  type: "image",
                  url,
                  side: "buyer",
                })),
              }
            : undefined,
        },
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "DISPUTED",
          statusHistory: {
            create: {
              status: "DISPUTED",
              note: `เปิดข้อพิพาท: ${reason}`,
              createdBy: userId,
            },
          },
        },
      })
    })

    // Freeze escrow
    await freezeEscrow(order.id)

    // Notify seller and admin
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: "DISPUTE_OPENED",
        title: "มีข้อพิพาท!",
        body: `ผู้ซื้อเปิดข้อพิพาทสำหรับออเดอร์ #${order.orderNumber} กรุณาตอบภายใน 48 ชม.`,
        link: `/sell/orders`,
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Dispute error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
