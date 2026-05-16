import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, ORDER_STATUS_LABELS, getRelativeTime } from "@/lib/utils"
import { Package, Truck, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"

export default async function SellerOrdersPage() {
  const session = await auth()
  const userId = (session!.user as any).id

  const orders = await prisma.order.findMany({
    where: { sellerId: userId },
    include: {
      listing: { select: { customName: true, images: { take: 1 } } },
      buyer: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ออเดอร์</h1>
        <p className="text-muted-foreground">{orders.length} ออเดอร์</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">ยังไม่มีออเดอร์</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusVariant =
              order.status === "COMPLETED"
                ? "success"
                : order.status === "PAID"
                ? "warning"
                : order.status === "SHIPPED"
                ? "purple"
                : order.status === "DISPUTED"
                ? "destructive"
                : "secondary"

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        ออเดอร์ #{order.orderNumber}
                      </p>
                      <h3 className="font-medium">{order.cardName}</h3>
                      <p className="text-sm text-muted-foreground">
                        ผู้ซื้อ: {order.buyer.name} • {getRelativeTime(order.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusVariant}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-muted-foreground">ราคา</p>
                      <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">คุณได้รับ</p>
                      <p className="font-medium text-green-400">{formatPrice(order.sellerReceives)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Escrow</p>
                      <Badge
                        variant={
                          order.escrowStatus === "RELEASED"
                            ? "success"
                            : order.escrowStatus === "HOLDING"
                            ? "warning"
                            : order.escrowStatus === "FROZEN"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {order.escrowStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Shipping info */}
                  {order.status === "PAID" && (
                    <div className="mt-3 p-3 bg-gold/10 rounded-lg border border-gold/20">
                      <p className="text-sm font-medium text-gold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        รอจัดส่ง — ส่งภายใน 3 วัน
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ส่งถึง: {order.shippingName}, {order.shippingAddress}
                      </p>
                      <Button variant="gold" size="sm" className="mt-2">
                        บันทึกเลข Tracking
                      </Button>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div className="mt-3 p-3 bg-purple-600/10 rounded-lg">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Tracking:</span>{" "}
                        <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingProvider} • ส่งเมื่อ {order.shippedAt?.toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
