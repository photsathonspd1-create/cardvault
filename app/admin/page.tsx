// @ts-nocheck
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import {
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalListings,
    pendingListings,
    totalOrders,
    totalRevenue,
    openDisputes,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ดแอดมิน</h1>
        <p className="text-muted-foreground">ภาพรวมระบบ CardVault</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">ผู้ใช้</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalListings}</p>
            <p className="text-xs text-muted-foreground">รายการเปิดขาย</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">ออเดอร์ทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatPrice(totalRevenue._sum.totalAmount ?? 0)}</p>
            <p className="text-xs text-muted-foreground">รายได้รวม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{pendingListings}</p>
            <p className="text-xs text-muted-foreground">รอตรวจสอบ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{openDisputes}</p>
            <p className="text-xs text-muted-foreground">ข้อพิพาท</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ออเดอร์ล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{order.cardName}</p>
                  <p className="text-xs text-muted-foreground">
                    ผู้ซื้อ: {order.buyer?.name ?? "-"} • ผู้ขาย: {order.seller?.name ?? "-"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gold">{formatPrice(order.totalAmount)}</p>
                  <Badge variant="secondary" className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
