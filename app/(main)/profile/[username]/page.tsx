import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, getRelativeTime } from "@/lib/utils"
import { ProfileClient } from "./profile-client"

export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const user = await prisma.user.findFirst({
    where: { username, isActive: true },
    include: {
      sellerProfile: true,
      listings: {
        where: { status: "ACTIVE" },
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          seller: { include: { user: { select: { name: true, username: true } } } },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) notFound()

  const reviews = await prisma.review.findMany({
    where: { sellerId: user.id },
    include: { buyer: { select: { name: true, username: true } } },
    take: 20,
    orderBy: { createdAt: "desc" },
  })

  const totalListings = await prisma.listing.count({
    where: { sellerId: user.id, status: "ACTIVE" },
  })

  const completedOrders = await prisma.order.count({
    where: { sellerId: user.id, status: "COMPLETED" },
  })

  const avgRating = await prisma.review.aggregate({
    where: { sellerId: user.id },
    _avg: { rating: true },
    _count: { id: true },
  })

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }}
      sellerProfile={user.sellerProfile ? {
        tier: user.sellerProfile.tier,
        displayName: user.sellerProfile.displayName,
        bio: user.sellerProfile.bio,
        kycStatus: user.sellerProfile.kycStatus,
        totalSales: user.sellerProfile.totalSales,
        successRate: user.sellerProfile.successRate,
        rating: user.sellerProfile.rating,
        responseRate: user.sellerProfile.responseRate,
      } : null}
      listings={user.listings}
      reviews={reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        buyerName: r.buyer.name,
      }))}
      stats={{
        totalListings,
        completedOrders,
        avgRating: avgRating._avg.rating ?? 0,
        reviewCount: avgRating._count.id,
      }}
    />
  )
}
