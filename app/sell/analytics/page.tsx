// @ts-nocheck
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AnalyticsCharts } from "@/components/shared/analytics-charts"
import { formatPrice } from "@/lib/utils"
import { getTierProgress } from "@/services/tier.service"
import { TrendingUp, Crown } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SellerAnalyticsPage() {
  const session = await auth()
  const userId = (session!.user as Record<string, unknown>).id as string

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
    include: {
      listings: {
        where: { status: "ACTIVE" },
        select: { id: true, customName: true, views: true, soldCount: true },
      },
    },
  })

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">ไม่พบข้อมูลผู้ขาย</p>
      </div>
    )
  }

  // Monthly revenue (last 12 months)
  const orders = await prisma.order.findMany({
    where: {
      sellerId: userId,
      status: "COMPLETED",
      completedAt: { not: null },
    },
    select: {
      sellerReceives: true,
      completedAt: true,
    },
    orderBy: { completedAt: "desc" },
  })

  // Group by month
  const monthlyMap = new Map<string, { revenue: number; orders: number }>()
  for (const order of orders) {
    if (!order.completedAt) continue
    const monthKey = order.completedAt.toISOString().slice(0, 7) // YYYY-MM
    const entry = monthlyMap.get(monthKey) ?? { revenue: 0, orders: 0 }
    entry.revenue += order.sellerReceives
    entry.orders++
    monthlyMap.set(monthKey, entry)
  }

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .slice(0, 12)
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("th-TH", {
        month: "short",
        year: "2-digit",
      }),
      revenue: data.revenue,
      orders: data.orders,
    }))
    .reverse()

  // Top selling cards
  const topCardsRaw = await prisma.order.groupBy({
    by: ["cardName"],
    where: {
      sellerId: userId,
      status: "COMPLETED",
    },
    _sum: { sellerReceives: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  })

  const topCards = topCardsRaw.map((c) => ({
    name: c.cardName,
    soldCount: c._count.id,
    revenue: c._sum.sellerReceives ?? 0,
  }))

  // Stats
  const totalViews = profile.listings.reduce((sum, l) => sum + l.views, 0)
  const totalOrders = profile.completedOrders
  const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0

  // Tier progress
  let tierProgress = null
  try {
    tierProgress = await getTierProgress(profile.id)
  } catch {
    // ignore
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">วิเคราะห์การขาย</h1>
        <p className="text-muted-foreground">แดชบอร์ดสำหรับผู้ขาย — {profile.displayName}</p>
      </div>

      {/* Tier Progress */}
      {tierProgress && tierProgress.nextTier && (
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-gold" />
              ระดับผู้ขาย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="gold">{tierProgress.currentTier}</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">{tierProgress.nextTier}</Badge>
              </div>
              <span className="text-sm font-medium text-gold">
                {tierProgress.percentComplete}%
              </span>
            </div>
            <Progress value={tierProgress.percentComplete} className="h-2" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ยอดขาย: </span>
                <span className={tierProgress.requirements.sales.current >= tierProgress.requirements.sales.needed ? "text-green-400" : ""}>
                  {tierProgress.requirements.sales.current}
                </span>
                <span className="text-muted-foreground"> / {tierProgress.requirements.sales.needed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">คะแนน: </span>
                <span className={tierProgress.requirements.rating.current >= tierProgress.requirements.rating.needed ? "text-green-400" : ""}>
                  {tierProgress.requirements.rating.current.toFixed(1)} ★
                </span>
                <span className="text-muted-foreground"> / {tierProgress.requirements.rating.needed} ★</span>
              </div>
              <div>
                <span className="text-muted-foreground">KYC: </span>
                <span className={tierProgress.requirements.kycVerified ? "text-green-400" : "text-yellow-400"}>
                  {tierProgress.requirements.kycVerified ? "✓ ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">ข้อพิพาทแพ้: </span>
                <span className={tierProgress.requirements.disputesLost === 0 ? "text-green-400" : "text-red-400"}>
                  {tierProgress.requirements.disputesLost}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Charts */}
      <AnalyticsCharts
        monthlyRevenue={monthlyRevenue}
        topCards={topCards}
        totalViews={totalViews}
        totalOrders={totalOrders}
        conversionRate={conversionRate}
      />
    </div>
  )
}
