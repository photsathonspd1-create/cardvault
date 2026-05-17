// @ts-nocheck
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { formatPrice, SERIES_LABELS, LISTING_STATUS_LABELS, getRelativeTime } from "@/lib/utils"
import { CheckCircle, XCircle, Eye } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminListingsPage() {
  const pendingListings = await prisma.listing.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const allListings = await prisma.listing.findMany({
    take: 20,
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">จัดการรายการขาย</h1>
        <p className="text-muted-foreground">{pendingListings.length} รายการรอตรวจสอบ</p>
      </div>

      {/* Pending Review */}
      {pendingListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">รอตรวจสอบ</h2>
          {pendingListings.map((listing) => (
            <Card key={listing.id} className="border-gold/20">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                    <Image
                      src={listing.images?.[0]?.url ?? "/placeholder-card.png"}
                      alt={listing.customName ?? "Card"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{listing.customName ?? "Untitled"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {SERIES_LABELS[listing.series]} • {listing.condition} • โดย {listing.seller?.user?.name ?? "ผู้ขาย"}
                    </p>
                    <p className="text-gold font-bold mt-1">{formatPrice(listing.price)}</p>
                    {listing.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <form action="/api/listings/approve" method="POST">
                      <input type="hidden" name="listingId" value={listing.id} />
                      <Button variant="success" size="sm" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        อนุมัติ
                      </Button>
                    </form>
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      ดู
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">รายการทั้งหมด</h2>
        <div className="space-y-3">
          {allListings.map((listing) => {
            const statusVariant =
              listing.status === "ACTIVE"
                ? "success"
                : listing.status === "PENDING_REVIEW"
                ? "warning"
                : listing.status === "REJECTED"
                ? "destructive"
                : "secondary"

            return (
              <Card key={listing.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-12 bg-muted rounded overflow-hidden shrink-0">
                      <Image
                        src={listing.images?.[0]?.url ?? "/placeholder-card.png"}
                        alt={listing.customName ?? "Card"}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{listing.customName ?? "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing.seller?.user?.name ?? "ผู้ขาย"} • {getRelativeTime(listing.createdAt)}
                      </p>
                    </div>
                    <span className="font-medium text-gold text-sm">{formatPrice(listing.price)}</span>
                    <Badge variant={statusVariant} className="text-xs">
                      {LISTING_STATUS_LABELS[listing.status] ?? listing.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
