// @ts-nocheck
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice, LISTING_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/utils"
import {
  Plus,
  ShoppingBag,
  Package,
  TrendingUp,
  Eye,
  DollarSign,
  Clock,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SellDashboardPage() {
  const session = await auth()
  if (!session?.user) {
    return <div className="text-center py-20"><p>กรุณาเข้าสู่ระบบ</p></div>
  }
  const userId = (session.user as any).id

  // Get or create seller profile
  let sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId },
  })

  if (!sellerProfile) {
    try {
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId,
          displayName: (session.user as any).name ?? "Seller",
        },
      })
    } catch (e) {
      console.error("Failed to create SellerProfile:", e)
      return <div className="text-center py-20"><p>เกิดข้อผิดพลาดในการสร้างโปรไฟล์ผู้ขาย กรุณาลองใหม่</p></div>
    }
  }

  // Get stats
  const [activeListings, pendingOrders, totalViews, recentOrders] = await Promise.all([
    prisma.listing.count({
      where: { sellerId: sellerProfile.id, status: "ACTIVE" },
    }),
    prisma.order.count({
      where: { sellerId: userId, status: "PAID" },
    }),
    prisma.listing.aggregate({
      where: { sellerId: sellerProfile.id },
      _sum: { views: true },
    }),
    prisma.order.findMany({
      where: { sellerId: userId },
      include: {
        listing: { select: { customName: true } },
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ดผู้ขาย</h1>
          <p className="text-muted-foreground">ยินดีต้อนรับ, {sellerProfile.displayName}</p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/sell/new">
            <Plus className="mr-2 h-4 w-4" />
            ลงขายสินค้า
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeListings}</p>
                <p className="text-xs text-muted-foreground">รายการเปิดขาย</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground">ออเดอร์รอส่ง</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(sellerProfile.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">รายได้รวม</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalViews._sum.views ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">ยอดเข้าชม</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seller Tier */}
      <Card className="border-gold/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="gold" className="text-sm px-3 py-1">
                {sellerProfile.tier}
              </Badge>
              <div>
                <p className="font-medium">ระดับผู้ขาย</p>
                <p className="text-sm text-muted-foreground">
                  {sellerProfile.completedOrders} ออเดอร์สำเร็จ • {Number(sellerProfile.rating ?? 0).toFixed(1)} ★
                </p>
              </div>
            </div>
            {!sellerProfile.isKycVerified && (
              <Button variant="outline" size="sm">
                ยืนยันตัวตน (KYC)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">ออเดอร์ล่าสุด</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sell/orders">ดูทั้งหมด</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              ยังไม่มีออเดอร์
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {order.cardName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ผู้ซื้อ: {order.buyer?.name ?? "-"} • {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      order.status === "COMPLETED"
                        ? "success"
                        : order.status === "PAID"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
