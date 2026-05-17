// @ts-nocheck
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, getRelativeTime } from "@/lib/utils"
import { AlertTriangle, MessageCircle, CheckCircle } from "lucide-react"

export const dynamic = "force-dynamic"

const DISPUTE_REASON_LABELS: Record<string, string> = {
  FAKE_CARD: "การ์ดปลอม",
  NOT_AS_DESCRIBED: "ไม่ตรงตามที่โฆษณา",
  NOT_RECEIVED: "ไม่ได้รับสินค้า",
  WRONG_ITEM: "สินค้าผิด",
  DAMAGED_IN_TRANSIT: "เสียหายระหว่างขนส่ง",
  OTHER: "อื่นๆ",
}

const DISPUTE_STATUS_LABELS: Record<string, string> = {
  OPEN: "เปิด",
  SELLER_REPLIED: "ผู้ขายตอบแล้ว",
  UNDER_REVIEW: "ตรวจสอบ",
  RESOLVED_BUYER: "ตัดสินให้ผู้ซื้อ",
  RESOLVED_SELLER: "ตัดสินให้ผู้ขาย",
  RESOLVED_PARTIAL: "คืนบางส่วน",
  ESCALATED: " escalated",
  CLOSED: "ปิด",
}

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    include: {
      order: {
        include: {
          buyer: { select: { name: true } },
          seller: { select: { name: true } },
        },
      },
      raisedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ข้อพิพาท</h1>
        <p className="text-muted-foreground">{disputes.length} ข้อพิพาท</p>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">ไม่มีข้อพิพาท</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            const statusVariant =
              dispute.status === "OPEN"
                ? "destructive"
                : dispute.status === "RESOLVED_BUYER" || dispute.status === "RESOLVED_SELLER"
                ? "success"
                : "warning"

            return (
              <Card key={dispute.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <Badge variant="destructive">
                          {DISPUTE_REASON_LABELS[dispute.reason] ?? dispute.reason}
                        </Badge>
                        <Badge variant={statusVariant}>
                          {DISPUTE_STATUS_LABELS[dispute.status] ?? dispute.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium">ออเดอร์ #{dispute.order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dispute.order.cardName} • {formatPrice(dispute.order.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(dispute.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">ผู้ร้องเรียน:</span>{" "}
                      {dispute.raisedBy?.name ?? "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">ผู้ขาย:</span>{" "}
                      {dispute.order?.seller?.name ?? "-"}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {dispute.description}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      ตอบกลับ
                    </Button>
                    <Button variant="success" size="sm">
                      ตัดสินให้ผู้ซื้อ
                    </Button>
                    <Button variant="purple" size="sm">
                      ตัดสินให้ผู้ขาย
                    </Button>
                    <Button variant="outline" size="sm">
                      คืนบางส่วน
                    </Button>
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
