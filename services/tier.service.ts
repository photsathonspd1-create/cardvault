// @ts-nocheck
/**
 * Seller Tier Auto-upgrade Service
 *
 * Automatically upgrades seller tier based on sales milestones.
 * Called after each successful escrow release.
 *
 * Tier conditions:
 *   Bronze → Silver:     10+ sales, rating ≥ 4.5, 0 disputes lost
 *   Silver → Gold:       50+ sales, rating ≥ 4.7, KYC verified
 *   Gold → Verified Pro: 200+ sales, rating ≥ 4.8, needs manual approval
 */

import { prisma } from "@/lib/prisma"
import { SellerTier } from "@prisma/client"

interface TierCheckResult {
  upgraded: boolean
  previousTier: SellerTier
  newTier: SellerTier
  requiresApproval: boolean
}

/**
 * Check and auto-upgrade seller tier after a successful sale.
 * Silently no-ops if no upgrade is due.
 */
export async function checkAndUpgradeTier(
  sellerProfileId: string
): Promise<TierCheckResult> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
  })

  if (!profile) {
    throw new Error("SellerProfile not found")
  }

  const result: TierCheckResult = {
    upgraded: false,
    previousTier: profile.tier,
    newTier: profile.tier,
    requiresApproval: false,
  }

  // ─── Bronze → Silver ───────────────────────────
  if (profile.tier === SellerTier.BRONZE) {
    if (
      profile.totalSales >= 10 &&
      profile.rating >= 4.5 &&
      profile.disputesLost === 0
    ) {
      await prisma.sellerProfile.update({
        where: { id: sellerProfileId },
        data: { tier: SellerTier.SILVER },
      })
      result.upgraded = true
      result.newTier = SellerTier.SILVER
      return result
    }
  }

  // ─── Silver → Gold ─────────────────────────────
  if (profile.tier === SellerTier.SILVER) {
    if (
      profile.totalSales >= 50 &&
      profile.rating >= 4.7 &&
      profile.isKycVerified
    ) {
      await prisma.sellerProfile.update({
        where: { id: sellerProfileId },
        data: { tier: SellerTier.GOLD },
      })
      result.upgraded = true
      result.newTier = SellerTier.GOLD
      return result
    }
  }

  // ─── Gold → Verified Pro ───────────────────────
  if (profile.tier === SellerTier.GOLD) {
    if (profile.totalSales >= 200 && profile.rating >= 4.8) {
      // Requires manual approval — flag it, don't auto-upgrade
      result.requiresApproval = true
      return result
    }
  }

  return result
}

/**
 * Get tier progress info for display (analytics page, seller dashboard)
 */
export async function getTierProgress(sellerProfileId: string): Promise<{
  currentTier: SellerTier
  nextTier: SellerTier | null
  requirements: {
    sales: { current: number; needed: number }
    rating: { current: number; needed: number }
    kycVerified: boolean
    disputesLost: number
  }
  percentComplete: number
}> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
  })

  if (!profile) {
    throw new Error("SellerProfile not found")
  }

  const tiers = [
    SellerTier.BRONZE,
    SellerTier.SILVER,
    SellerTier.GOLD,
    SellerTier.VERIFIED_PRO,
  ]
  const currentIndex = tiers.indexOf(profile.tier)

  // Already at max tier
  if (currentIndex >= tiers.length - 1) {
    return {
      currentTier: profile.tier,
      nextTier: null,
      requirements: {
        sales: { current: profile.totalSales, needed: 0 },
        rating: { current: profile.rating, needed: 0 },
        kycVerified: profile.isKycVerified,
        disputesLost: profile.disputesLost,
      },
      percentComplete: 100,
    }
  }

  const nextTier = tiers[currentIndex + 1]

  // Requirements for each tier
  const tierRequirements: Record<
    string,
    { sales: number; rating: number; kyc: boolean }
  > = {
    [SellerTier.SILVER]: { sales: 10, rating: 4.5, kyc: false },
    [SellerTier.GOLD]: { sales: 50, rating: 4.7, kyc: true },
    [SellerTier.VERIFIED_PRO]: { sales: 200, rating: 4.8, kyc: true },
  }

  const req = tierRequirements[nextTier] ?? { sales: 0, rating: 0, kyc: false }

  // Calculate percent complete (weighted: sales 50%, rating 30%, kyc 20%)
  const salesProgress = Math.min(profile.totalSales / req.sales, 1) * 50
  const ratingProgress =
    req.rating > 0 ? Math.min(profile.rating / req.rating, 1) * 30 : 30
  const kycProgress = !req.kyc || profile.isKycVerified ? 20 : 0
  const disputesPenalty =
    profile.disputesLost > 0 && nextTier === SellerTier.SILVER ? 50 : 0

  const percentComplete = Math.max(
    0,
    Math.min(100, Math.round(salesProgress + ratingProgress + kycProgress - disputesPenalty))
  )

  return {
    currentTier: profile.tier,
    nextTier,
    requirements: {
      sales: { current: profile.totalSales, needed: req.sales },
      rating: { current: profile.rating, needed: req.rating },
      kycVerified: profile.isKycVerified,
      disputesLost: profile.disputesLost,
    },
    percentComplete,
  }
}
