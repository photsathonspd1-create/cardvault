// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { holdEscrow, refundEscrow } from "@/services/escrow.service"
import crypto from "crypto"

/**
 * Omise Webhook Handler
 * 
 * Verifies HMAC signature from Omise before processing events.
 * Handles payment.charge.success and payment.charge.failure.
 * 
 * @see https://www.omise.co/security-best-practices
 */

function verifyOmiseSignature(payload: string, signature: string): boolean {
  const secret = process.env.OMISE_WEBHOOK_SECRET
  if (!secret) {
    console.error("OMISE_WEBHOOK_SECRET not configured")
    return false
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  )
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for HMAC verification
    const rawBody = await request.text()
    const signature = request.headers.get("x-omise-signature") ?? ""

    // Verify HMAC signature
    if (!verifyOmiseSignature(rawBody, signature)) {
      console.error("Omise webhook: Invalid signature")
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const event = JSON.parse(rawBody)
    const { type, data } = event

    console.log(`Omise webhook received: ${type}`, { chargeId: data?.id })

    switch (type) {
      case "charge.complete":
      case "charge.success": {
        const charge = data
        const orderId = charge.metadata?.order_id

        if (!orderId) {
          console.error("Omise webhook: No order_id in charge metadata")
          return new Response(
            JSON.stringify({ error: "No order_id in metadata" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          )
        }

        // Verify the order exists and is in correct state
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        })

        if (!order) {
          console.error(`Omise webhook: Order ${orderId} not found`)
          return new Response(
            JSON.stringify({ error: "Order not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          )
        }

        if (order.status !== "PENDING_PAYMENT") {
          console.warn(`Omise webhook: Order ${orderId} already in status ${order.status}`)
          return new Response(
            JSON.stringify({ received: true, skipped: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        }

        // Update order with payment info and hold escrow
        await prisma.order.update({
          where: { id: orderId },
          data: {
            omiseChargeId: charge.id,
            paymentMethod: charge.source?.type ?? "unknown",
          },
        })

        await holdEscrow(orderId)

        console.log(`Omise webhook: Order ${orderId} payment confirmed, escrow held`)
        break
      }

      case "charge.failed":
      case "charge.failure": {
        const charge = data
        const orderId = charge.metadata?.order_id

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date(),
              cancelReason: "การชำระเงินไม่สำเร็จ",
              statusHistory: {
                create: {
                  status: "CANCELLED",
                  note: `การชำระเงินล้มเหลว: ${charge.failure_message ?? "Unknown error"}`,
                },
              },
            },
          })

          console.log(`Omise webhook: Order ${orderId} payment failed`)
        }
        break
      }

      case "refund.create": {
        const refund = data
        const chargeId = refund.charge
        const order = await prisma.order.findFirst({
          where: { omiseChargeId: chargeId },
        })

        if (order) {
          await refundEscrow(order.id, "คืนเงินผ่าน Omise")
          console.log(`Omise webhook: Order ${order.id} refunded`)
        }
        break
      }

      default:
        console.log(`Omise webhook: Unhandled event type: ${type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Omise webhook error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
