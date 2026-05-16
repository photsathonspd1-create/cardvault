import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice, ORDER_STATUS_LABELS, ESCROW_STATUS_LABELS, getRelativeTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Shield, Truck, Package, CheckCircle, AlertTriangle, Clock, MapPin } from "lucide-react"
import { OrderConfirmButton } from "@/components/order/order-confirm-button"
import { OrderDisputeButton } from "@/components/order/order-dispute-button"

export const dynamic = "force-dynamic"

interface OrderDetailPageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth()
  const userId = (session?.user as any)?.id
  if (!userId) redirect("/login")

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      listing: { include: { images: { take: 1 } } },
      buyer: { select: { id: true, name: true, username: true } },
      seller: { select: { id: true, name: true, username: true } },
      dispute: true,
      review: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!order) notFound()
  if (order.buyerId !== userId && order.sellerId !== userId) redirect("/")

  const isBuyer = order.buyerId === userId
  const isSeller = order.sellerId === userId

  const statusVariant: Record<string, any> = {
    PENDING_PAYMENT: "secondary",
    PAID: "warning",
    SHIPPED: "purple",
    DELIVERED: "purple",
    COMPLETED: "success",
    DISPUTED: "destructive",
    CANCELLED: "secondary",
    REFUNDED: "secondary",
  }

  return (
    <div className="container px-4 py-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ออเดอร์ #{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">
            สั่งเมื่อ {getRelativeTime(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant[order.status]} className="text-sm">
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Card Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative h-28 w-20 bg-muted rounded-md overflow-hidden shrink-0">
              <Image
                src={order.cardImage || "/placeholder-card.png"}
                alt={order.cardName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{order.cardName}</h3>
              <p className="text-sm text-muted-foreground">สภาพ: {order.condition}</p>
              <p className="text-sm text-muted-foreground">จำนวน: {order.quantity}</p>
              <p className="text-lg font-bold text-gold mt-2">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escrow Status */}
      <Card className="border-purple-600/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold">สถานะ Escrow</h3>
            <Badge variant="outline">{ESCROW_STATUS_LABELS[order.escrowStatus]}</Badge>
          </div>
          {/* Timeline */}
          <div className="space-y-3 ml-8">
            {order.statusHistory.map((h, i) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className={`h-3 w-3 rounded-full mt-1 ${i === order.statusHistory.length - 1 ? "bg-purple-400" : "bg-muted-foreground/30"}`} />
                <div>
                  <p className="text-sm font-medium">{ORDER_STATUS_LABELS[h.status] ?? h.status}</p>
                  {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                  <p className="text-xs text-muted-foreground">{getRelativeTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            ข้อมูลจัดส่ง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ผู้รับ:</span>
            <span>{order.shippingName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">โทร:</span>
            <span>{order.shippingPhone}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-muted-foreground">ที่อยู่:</span>
            <span className="text-right max-w-[60%]">
              {order.shippingAddress} {order.shippingDistrict} {order.shippingProvince} {order.shippingPostcode}
            </span>
          </div>
          {order.trackingNumber && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">ขนส่ง:</span>
                <span>{order.shippingProvider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking:</span>
                <span className="font-mono">{order.trackingNumber}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">สรุปราคา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ราคาสินค้า</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ค่าจัดส่ง</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>รวม</span>
            <span className="text-gold">{formatPrice(order.totalAmount)}</span>
          </div>
          {isSeller && (
            <div className="flex justify-between text-green-400">
              <span>คุณได้รับ (หักค่าธรรมเนียม)</span>
              <span className="font-bold">{formatPrice(order.sellerReceives)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {isBuyer && (order.status === "SHIPPED" || order.status === "DELIVERED") && (
          <>
            <OrderConfirmButton orderId={order.id} />
            <OrderDisputeButton orderId={order.id} />
          </>
        )}
        {isSeller && order.status === "PAID" && (
          <Button variant="gold" asChild>
            <Link href={`/sell/orders`}>
              <Truck className="mr-2 h-4 w-4" />
              กรอกเลข Tracking
            </Link>
          </Button>
        )}
        {order.status === "COMPLETED" && !order.review && (
          <Button variant="outline" asChild>
            <Link href={`/orders/${order.id}/review`}>
              เขียนรีวิว
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href={isBuyer ? "/orders" : "/sell/orders"}>
            กลับ
          </Link>
        </Button>
      </div>

      {/* Dispute Info */}
      {order.dispute && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">ข้อพิพาท</h3>
              <Badge variant="destructive">{order.dispute.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{order.dispute.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
