// @ts-nocheck
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { formatPrice, ORDER_STATUS_LABELS, ESCROW_STATUS_LABELS, getRelativeTime } from "@/lib/utils"
import { Package, Truck, CheckCircle, AlertTriangle, ExternalLink, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const session = await auth()
  const userId = (session?.user as any)?.id

  const orders = await prisma.order.findMany({
    where: { buyerId: userId },
    include: {
      listing: { select: { id: true, customName: true, images: { take: 1 } } },
      seller: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ออเดอร์ของฉัน</h1>
        <p className="text-muted-foreground">{orders.length} ออเดอร์</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">ยังไม่มีออเดอร์</p>
            <Button variant="gold" asChild>
              <Link href="/browse">ค้นหาการ์ด</Link>
            </Button>
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
                : order.status === "PENDING_PAYMENT"
                ? "secondary"
                : "secondary"

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                      <Image
                        src={order.cardImage || "/placeholder-card.png"}
                        alt={order.cardName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            #{order.orderNumber}
                          </p>
                          <h3 className="font-medium">{order.cardName}</h3>
                          <p className="text-sm text-muted-foreground">
                            ผู้ขาย: {order.seller.name} • {getRelativeTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusVariant}>
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                          <p className="text-lg font-bold text-gold mt-1">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Escrow Status */}
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-muted-foreground">Escrow:</span>
                        <Badge variant="outline" className="text-xs">
                          {ESCROW_STATUS_LABELS[order.escrowStatus] ?? order.escrowStatus}
                        </Badge>
                      </div>

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div className="mt-2 p-2 bg-purple-600/10 rounded-lg text-sm">
                          <Truck className="h-4 w-4 inline mr-1 text-purple-400" />
                          <span className="text-muted-foreground">Tracking:</span>{" "}
                          <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {order.status === "PENDING_PAYMENT" && (
                          <Button variant="gold" size="sm" asChild>
                            <Link href={`/checkout/${order.listingId}`}>
                              ชำระเงิน
                            </Link>
                          </Button>
                        )}
                        {(order.status === "DELIVERED" || order.status === "SHIPPED") && (
                          <Button variant="success" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            ยืนยันรับสินค้า
                          </Button>
                        )}
                        {order.status === "COMPLETED" && (
                          <Button variant="outline" size="sm">
                            ให้คะแนน
                          </Button>
                        )}
                        {(order.status === "PAID" || order.status === "SHIPPED") && (
                          <Button variant="destructive" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            เปิดข้อพิพาท
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
