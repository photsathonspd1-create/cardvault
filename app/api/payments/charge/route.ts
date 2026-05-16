import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPromptPayCharge, createCardCharge, isOmiseConfigured } from "@/lib/omise"
import { z } from "zod"

const chargeSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(["promptpay", "credit_card"]),
  cardToken: z.string().optional(),
})

/**
 * POST /api/payments/charge
 * Create an Omise charge for an order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    if (!isOmiseConfigured()) {
      return Response.json(
        { error: "ระบบชำระเงินยังไม่พร้อมใช้งาน" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const parsed = chargeSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { orderId, paymentMethod, cardToken } = parsed.data

    // Get order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId, buyerId: userId },
    })

    if (!order) {
      return Response.json({ error: "ไม่พบออเดอร์" }, { status: 404 })
    }

    if (order.status !== "PENDING_PAYMENT") {
      return Response.json(
        { error: "ออเดอร์นี้ชำระเงินแล้วหรือหมดอายุ" },
        { status: 400 }
      )
    }

    const description = `CardVault Order #${order.orderNumber} - ${order.cardName}`

    let charge
    if (paymentMethod === "promptpay") {
      charge = await createPromptPayCharge(order.totalAmount, orderId, description)
    } else {
      if (!cardToken) {
        return Response.json(
          { error: "กรุณากรอกข้อมูลบัตรเครดิต" },
          { status: 400 }
        )
      }
      charge = await createCardCharge(order.totalAmount, orderId, cardToken, description)
    }

    // Update order with charge info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        omiseChargeId: charge.id,
        paymentMethod,
      },
    })

    // Return payment info
    if (paymentMethod === "promptpay") {
      return Response.json({
        success: true,
        chargeId: charge.id,
        status: charge.status,
        qrCodeUrl: charge.source?.scannable_code,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
    } else {
      return Response.json({
        success: true,
        chargeId: charge.id,
        status: charge.status,
        authorizeUri: charge.authorize_uri,
      })
    }
  } catch (error) {
    console.error("Payment charge error:", error)
    return Response.json(
      { error: "เกิดข้อผิดพลาดในการชำระเงิน" },
      { status: 500 }
    )
  }
}
