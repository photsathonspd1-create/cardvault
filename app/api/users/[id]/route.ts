// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to find by username or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: params.id },
          { username: params.id },
        ],
      },
      include: {
        sellerProfile: {
          include: {
            _count: { select: { listings: true } },
          },
        },
        _count: {
          select: {
            buyerOrders: true,
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return new Response(
        JSON.stringify({ error: "ไม่พบผู้ใช้" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Get recent reviews
    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id, isHidden: false },
      include: {
        reviewer: { select: { name: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Get active listings
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: user.sellerProfile?.id ?? "",
        status: "ACTIVE",
      },
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    })

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
        },
        sellerProfile: user.sellerProfile,
        reviews,
        listings,
        stats: {
          buyerOrders: user._count.buyerOrders,
          reviewsReceived: user._count.reviewsReceived,
          activeListings: user.sellerProfile?._count.listings ?? 0,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Get user profile error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
