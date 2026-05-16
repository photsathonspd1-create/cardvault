// @ts-nocheck
/**
 * Notification Service
 *
 * Sends email notifications for important events via Resend.
 * Also creates in-app Notification records.
 *
 * Events:
 *   ORDER_PAID       → ผู้ซื้อ + ผู้ขาย
 *   ORDER_SHIPPED    → ผู้ซื้อ
 *   ORDER_COMPLETED  → ผู้ซื้อ + ผู้ขาย
 *   DISPUTE_OPENED   → ผู้ซื้อ + ผู้ขาย
 */

import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import {
  sendEmail,
  orderPaidTemplate,
  orderShippedTemplate,
  orderCompletedTemplate,
  disputeOpenedTemplate,
} from "@/lib/resend"

// ─── In-App Notification Helper ────────────────────────────────────

async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  await prisma.notification.create({
    data: { userId, type, title, body, link },
  })
}

// ─── ORDER_PAID ────────────────────────────────────────────────────

export async function sendOrderPaidEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      listing: { select: { customName: true } },
    },
  })

  if (!order) return

  const cardName = order.cardName ?? order.listing?.customName ?? "สินค้า"
  const totalFormatted = formatPrice(order.totalAmount)

  // Email to buyer
  try {
    await sendEmail({
      to: order.buyer.email,
      subject: `✅ ยืนยันการชำระเงิน ออเดอร์ #${order.orderNumber}`,
      html: orderPaidTemplate({
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        cardName,
        totalAmount: totalFormatted,
        sellerName: order.seller.name,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send order-paid email to buyer:", err)
  }

  // Email to seller
  try {
    await sendEmail({
      to: order.seller.email,
      subject: `💰 มีคำสั่งซื้อใหม่ ออเดอร์ #${order.orderNumber}`,
      html: orderPaidTemplate({
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        cardName,
        totalAmount: totalFormatted,
        sellerName: order.seller.name,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send order-paid email to seller:", err)
  }

  // In-app notifications
  await Promise.all([
    createNotification(
      order.buyerId,
      "ORDER_PAID",
      "ชำระเงินสำเร็จ",
      `ออเดอร์ #${order.orderNumber} ชำระเงินเรียบร้อย เงินอยู่ในระบบ Escrow`,
      `/orders/${order.id}`
    ),
    createNotification(
      order.sellerId,
      "ORDER_PAID",
      "มีคำสั่งซื้อใหม่",
      `ออเดอร์ #${order.orderNumber} — ${cardName} — ${totalFormatted}`,
      `/sell/orders`
    ),
  ])
}

// ─── ORDER_SHIPPED ─────────────────────────────────────────────────

export async function sendOrderShippedEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { name: true, email: true } },
      listing: { select: { customName: true } },
    },
  })

  if (!order) return

  const cardName = order.cardName ?? order.listing?.customName ?? "สินค้า"

  // Email to buyer
  try {
    await sendEmail({
      to: order.buyer.email,
      subject: `📦 สินค้าถูกจัดส่งแล้ว ออเดอร์ #${order.orderNumber}`,
      html: orderShippedTemplate({
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        cardName,
        trackingNumber: order.trackingNumber ?? "-",
        shippingProvider: order.shippingProvider ?? "ไม่ระบุ",
        sellerName: order.seller.name,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send order-shipped email:", err)
  }

  // In-app notification
  await createNotification(
    order.buyerId,
    "ORDER_SHIPPED",
    "สินค้าถูกจัดส่งแล้ว",
    `ออเดอร์ #${order.orderNumber} — เลข Tracking: ${order.trackingNumber ?? "-"}`,
    `/orders/${order.id}`
  )
}

// ─── ORDER_COMPLETED ───────────────────────────────────────────────

export async function sendOrderCompletedEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      listing: { select: { customName: true } },
    },
  })

  if (!order) return

  const cardName = order.cardName ?? order.listing?.customName ?? "สินค้า"

  // Email to buyer
  try {
    await sendEmail({
      to: order.buyer.email,
      subject: `🎉 ออเดอร์สำเร็จ #${order.orderNumber}`,
      html: orderCompletedTemplate({
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        cardName,
        sellerName: order.seller.name,
        isSeller: false,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send order-completed email to buyer:", err)
  }

  // Email to seller
  try {
    await sendEmail({
      to: order.seller.email,
      subject: `💰 ออเดอร์สำเร็จ — เงินถูกปล่อยแล้ว #${order.orderNumber}`,
      html: orderCompletedTemplate({
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        cardName,
        sellerName: order.seller.name,
        isSeller: true,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send order-completed email to seller:", err)
  }

  // In-app notifications
  await Promise.all([
    createNotification(
      order.buyerId,
      "ORDER_COMPLETED",
      "ออเดอร์สำเร็จ",
      `ออเดอร์ #${order.orderNumber} เสร็จสมบูรณ์ — อย่าลืมให้รีวิว!`,
      `/orders/${order.id}`
    ),
    createNotification(
      order.sellerId,
      "ORDER_COMPLETED",
      "เงินถูกปล่อยแล้ว",
      `ออเดอร์ #${order.orderNumber} — เงินเข้าบัญชีเรียบร้อย`,
      `/sell/orders`
    ),
  ])
}

// ─── DISPUTE_OPENED ────────────────────────────────────────────────

export async function sendDisputeOpenedEmail(
  disputeId: string
): Promise<void> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      raisedBy: { select: { id: true, name: true, email: true } },
      order: {
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
          listing: { select: { customName: true } },
        },
      },
    },
  })

  if (!dispute) return

  const { order } = dispute
  const cardName = order.cardName ?? order.listing?.customName ?? "สินค้า"

  const DISPUTE_REASON_LABELS: Record<string, string> = {
    FAKE_CARD: "การ์ดปลอม",
    NOT_AS_DESCRIBED: "ไม่ตรงตามคำอธิบาย",
    NOT_RECEIVED: "ไม่ได้รับสินค้า",
    WRONG_ITEM: "สินค้าผิด",
    DAMAGED_IN_TRANSIT: "เสียหายระหว่างขนส่ง",
    OTHER: "อื่นๆ",
  }

  const reasonLabel = DISPUTE_REASON_LABELS[dispute.reason] ?? dispute.reason

  // Email to buyer
  try {
    await sendEmail({
      to: order.buyer.email,
      subject: `📋 ข้อพิพาทถูกเปิดแล้ว ออเดอร์ #${order.orderNumber}`,
      html: disputeOpenedTemplate({
        recipientName: order.buyer.name,
        orderNumber: order.orderNumber,
        cardName,
        reason: reasonLabel,
        description: dispute.description,
        isSeller: false,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send dispute email to buyer:", err)
  }

  // Email to seller
  try {
    await sendEmail({
      to: order.seller.email,
      subject: `⚠️ มีข้อพิพาท ออเดอร์ #${order.orderNumber}`,
      html: disputeOpenedTemplate({
        recipientName: order.seller.name,
        orderNumber: order.orderNumber,
        cardName,
        reason: reasonLabel,
        description: dispute.description,
        isSeller: true,
      }),
    })
  } catch (err) {
    console.error("[notification] Failed to send dispute email to seller:", err)
  }

  // In-app notifications
  await Promise.all([
    createNotification(
      order.buyerId,
      "DISPUTE_OPENED",
      "ข้อพิพาทถูกเปิดแล้ว",
      `ออเดอร์ #${order.orderNumber} — ${reasonLabel}`,
      `/orders/${order.id}`
    ),
    createNotification(
      order.sellerId,
      "DISPUTE_OPENED",
      "มีข้อพิพาท",
      `ออเดอร์ #${order.orderNumber} — ${reasonLabel} — กรุณาตอบกลับภายใน 48 ชม.`,
      `/sell/orders`
    ),
  ])
}
