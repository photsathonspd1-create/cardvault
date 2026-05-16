// @ts-nocheck
import { prisma } from "@/lib/prisma"
import { EscrowStatus, OrderStatus } from "@prisma/client"
import { checkAndUpgradeTier } from "@/services/tier.service"

/**
 * Escrow System
 * 
 * Flow:
 * 1. Buyer pays → funds held in escrow (HOLDING)
 * 2. Seller ships → order marked SHIPPED
 * 3. Buyer confirms receipt → funds released to seller (RELEASED)
 * 4. Auto-release after 7 days if buyer doesn't respond
 * 5. Dispute freezes escrow (FROZEN)
 */

const AUTO_RELEASE_DAYS = 7
const PLATFORM_FEE_PERCENT = 5 // 5% platform fee

export function calculatePlatformFee(subtotal: number): number {
  return Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100))
}

export function calculateSellerReceives(subtotal: number, shippingFee: number): number {
  const platformFee = calculatePlatformFee(subtotal)
  return subtotal + shippingFee - platformFee
}

/**
 * Hold funds in escrow when buyer pays
 */
export async function holdEscrow(orderId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      escrowStatus: EscrowStatus.HOLDING,
      paidAt: new Date(),
      status: OrderStatus.PAID,
      statusHistory: {
        create: {
          status: "PAID",
          note: "ชำระเงินเรียบร้อย เงินอยู่ในระบบ Escrow",
        },
      },
    },
  })
}

/**
 * Release funds to seller (after buyer confirms or auto-release)
 */
export async function releaseEscrow(orderId: string, releasedBy: "buyer" | "system"): Promise<void> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { seller: { include: { sellerProfile: true } } },
  })

  if (order.escrowStatus !== EscrowStatus.HOLDING) {
    throw new Error(`Cannot release escrow: current status is ${order.escrowStatus}`)
  }

  await prisma.$transaction(async (tx) => {
    // Update order
    await tx.order.update({
      where: { id: orderId },
      data: {
        escrowStatus: EscrowStatus.RELEASED,
        releasedAt: new Date(),
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
        confirmedAt: new Date(),
        statusHistory: {
          create: {
            status: "COMPLETED",
            note: releasedBy === "buyer"
              ? "ผู้ซื้อยืนยันรับสินค้า เงินถูกปล่อยให้ผู้ขาย"
              : "ปล่อยเงินอัตโนมัติ (ผู้ซื้อไม่คัดค้านภายใน 7 วัน)",
          },
        },
      },
    })

    // Update seller stats
    if (order.seller.sellerProfile) {
      await tx.sellerProfile.update({
        where: { id: order.seller.sellerProfile.id },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: order.sellerReceives },
          completedOrders: { increment: 1 },
        },
      })
    }
  })

  // Check tier auto-upgrade after successful sale
  if (order.seller.sellerProfile) {
    try {
      await checkAndUpgradeTier(order.seller.sellerProfile.id)
    } catch {
      // Don't fail escrow release if tier check fails
    }
  }
}

/**
 * Refund escrow to buyer (dispute resolution or cancellation)
 */
export async function refundEscrow(orderId: string, reason: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      escrowStatus: EscrowStatus.REFUNDED,
      status: OrderStatus.REFUNDED,
      cancelReason: reason,
      statusHistory: {
        create: {
          status: "REFUNDED",
          note: `คืนเงิน: ${reason}`,
        },
      },
    },
  })
}

/**
 * Freeze escrow (when dispute is raised)
 */
export async function freezeEscrow(orderId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      escrowStatus: EscrowStatus.FROZEN,
      status: OrderStatus.DISPUTED,
      statusHistory: {
        create: {
          status: "DISPUTED",
          note: "มีข้อพิพาท เงินถูกอายัดไว้",
        },
      },
    },
  })
}

/**
 * Auto-release escrow for orders where buyer hasn't responded
 * Called by cron job daily at 3:00 AM
 */
export async function autoReleaseEscrow(): Promise<{
  released: number
  errors: string[]
}> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - AUTO_RELEASE_DAYS)

  // Find orders that:
  // 1. Are in HOLDING escrow status
  // 2. Were delivered/shipped more than 7 days ago
  // 3. No dispute raised
  const eligibleOrders = await prisma.order.findMany({
    where: {
      escrowStatus: EscrowStatus.HOLDING,
      status: {
        in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED],
      },
      shippedAt: {
        lte: cutoffDate,
      },
      dispute: null, // No dispute
    },
    include: {
      seller: { include: { sellerProfile: true } },
    },
  })

  const errors: string[] = []
  let releasedCount = 0

  for (const order of eligibleOrders) {
    try {
      await releaseEscrow(order.id, "system")
      releasedCount++
    } catch (error) {
      errors.push(`Order ${order.orderNumber}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return { released: releasedCount, errors }
}
