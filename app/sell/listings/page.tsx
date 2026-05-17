
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { formatPrice, LISTING_STATUS_LABELS, SERIES_LABELS, getRelativeTime } from "@/lib/utils"
import { Plus, Eye, Edit, Trash2, Pause, Play } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SellerListingsPage() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId },
  })

  if (!sellerProfile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">กรุณาสร้างโปรไฟล์ผู้ขายก่อน</p>
        <Button variant="gold" asChild>
          <Link href="/sell">สร้างโปรไฟล์</Link>
        </Button>
      </div>
    )
  }

  const listings = await prisma.listing.findMany({
    where: { sellerId: sellerProfile.id },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      _count: { select: { orders: true, watchlists: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">รายการขาย</h1>
          <p className="text-muted-foreground">{listings.length} รายการ</p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/sell/new">
            <Plus className="mr-2 h-4 w-4" />
            ลงขายสินค้า
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">ยังไม่มีรายการขาย</p>
            <Button variant="gold" asChild>
              <Link href="/sell/new">ลงขายสินค้าแรกของคุณ</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const imageUrl = listing.images?.[0]?.url ?? "/placeholder-card.png"
            const statusVariant =
              listing.status === "ACTIVE"
                ? "success"
                : listing.status === "PENDING_REVIEW"
                ? "warning"
                : listing.status === "SOLD"
                ? "purple"
                : listing.status === "REJECTED"
                ? "destructive"
                : "secondary"

            return (
              <Card key={listing.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                      <Image
                        src={imageUrl}
                        alt={listing.customName ?? "Card"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium truncate">
                            {listing.customName ?? "Untitled"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {SERIES_LABELS[listing.series] ?? listing.series}
                          </p>
                        </div>
                        <Badge variant={statusVariant}>
                          {LISTING_STATUS_LABELS[listing.status] ?? listing.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-bold text-gold">{formatPrice(listing.price)}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {listing.views}
                        </span>
                        <span className="text-muted-foreground">
                          {listing._count.orders} ออเดอร์
                        </span>
                        <span className="text-muted-foreground">
                          {listing._count.watchlists} สนใจ
                        </span>
                        <span className="text-muted-foreground">
                          {getRelativeTime(listing.createdAt)}
                        </span>
                      </div>
                      {listing.rejectionReason && (
                        <p className="text-sm text-destructive mt-1">
                          เหตุผลที่ถูกปฏิเสธ: {listing.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/listing/${listing.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sell/listings/${listing.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
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
