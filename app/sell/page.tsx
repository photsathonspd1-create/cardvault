import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SellerDashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function SellerDashboard() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id

  if (!userId) redirect("/login")

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId },
  })

  if (!sellerProfile) redirect("/sell/new")

  // Active listings count
  const activeListings = await prisma.listing.count({
    where: { sellerId: userId, status: "ACTIVE" },
  })

  // Pending orders
  const pendingOrders = await prisma.order.count({
    where: { sellerId: userId, status: "PAID" },
  })

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    where: { sellerId: userId },
    include: {
      listing: { select: { customName: true, price: true, images: { take: 1 } } },
      buyer: { select: { name: true, username: true } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  })

  // Monthly revenue
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const monthlyRevenue = await prisma.order.aggregate({
    where: {
      sellerId: userId,
      status: "COMPLETED",
      completedAt: { gte: monthStart },
    },
    _sum: { sellerReceives: true },
    _count: { id: true },
  })

  // Total revenue
  const totalRevenue = await prisma.order.aggregate({
    where: { sellerId: userId, status: "COMPLETED" },
    _sum: { sellerReceives: true },
  })

  // Completed orders
  const completedOrders = await prisma.order.count({
    where: { sellerId: userId, status: "COMPLETED" },
  })

  return (
    <SellerDashboardClient
      seller={{
        name: session?.user?.name ?? "Seller",
        tier: sellerProfile.tier,
        displayName: sellerProfile.displayName,
      }}
      metrics={{
        monthlyRevenue: monthlyRevenue._sum.sellerReceives ?? 0,
        totalRevenue: totalRevenue._sum.sellerReceives ?? 0,
        activeListings,
        pendingOrders,
        completedOrders,
        monthlySales: monthlyRevenue._count.id,
      }}
      recentOrders={recentOrders.map((o) => ({
        id: o.id,
        cardName: o.listing.customName ?? "Untitled",
        price: o.listing.price,
        buyerName: o.buyer.name ?? o.buyer.username ?? "Unknown",
        status: o.status,
        createdAt: o.createdAt,
      }))}
    />
  )
}
