import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminDashboardClient } from "./admin-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/")

  // Metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [totalUsers, totalListings, pendingListings, activeOrders, openDisputes, totalSellers] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    prisma.sellerProfile.count(),
  ])

  // GMV today
  const gmvToday = await prisma.order.aggregate({
    where: { status: "COMPLETED", completedAt: { gte: today } },
    _sum: { totalAmount: true },
  })

  // GMV this month
  const gmvMonth = await prisma.order.aggregate({
    where: { status: "COMPLETED", completedAt: { gte: monthStart } },
    _sum: { totalAmount: true },
  })

  // Pending listings queue
  const listingsQueue = await prisma.listing.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      seller: { include: { user: { select: { name: true, username: true } } } },
    },
    take: 10,
    orderBy: { createdAt: "asc" },
  })

  // Open disputes
  const disputes = await prisma.dispute.findMany({
    where: { status: { in: ["OPEN", "IN_REVIEW"] } },
    include: {
      order: {
        include: {
          listing: { select: { customName: true, price: true } },
        },
      },
    },
    take: 10,
    orderBy: { createdAt: "asc" },
  })

  return (
    <AdminDashboardClient
      metrics={{
        gmvToday: gmvToday._sum.totalAmount ?? 0,
        gmvMonth: gmvMonth._sum.totalAmount ?? 0,
        totalUsers,
        totalListings,
        pendingListings,
        activeOrders,
        openDisputes,
        totalSellers,
      }}
      listingsQueue={listingsQueue.map((l) => ({
        id: l.id,
        name: l.customName ?? "Untitled",
        seller: l.seller.user.name ?? l.seller.user.username ?? "Unknown",
        tier: l.seller.tier,
        price: l.price,
        createdAt: l.createdAt,
      }))}
      disputes={disputes.map((d) => ({
        id: d.id,
        orderId: d.orderId,
        cardName: d.order.listing.customName ?? "Untitled",
        amount: d.order.listing.price,
        reason: d.reason,
        createdAt: d.createdAt,
      }))}
    />
  )
}
