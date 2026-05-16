import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS, LANGUAGE_LABELS, getRelativeTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import {
  Shield,
  Star,
  Truck,
  Heart,
  Share2,
  Eye,
  Clock,
  Package,
  TrendingUp,
} from "lucide-react"
import { PriceChart } from "@/components/shared/price-chart"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface ListingPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { card: true },
  })

  if (!listing) {
    return { title: "ไม่พบรายการ" }
  }

  const name = listing.customName ?? listing.card?.name ?? "Untitled"
  const price = formatPrice(listing.price)

  return {
    title: `${name} - ${price}`,
    description: `${name} ราคา ${price} สภาพ ${CONDITION_LABELS[listing.condition] ?? listing.condition} ซื้อขายปลอดภัยด้วยระบบ Escrow | CardVault`,
    openGraph: {
      title: `${name} | CardVault`,
      description: `ซื้อ ${name} ราคา ${price} บน CardVault`,
      type: "website",
    },
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      shippingOptions: true,
      seller: {
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
        },
      },
      card: true,
    },
  })

  if (!listing) {
    notFound()
  }

  // Increment view count
  await prisma.listing.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } },
  })

  const mainImage = listing.images[0]?.url ?? "/placeholder-card.png"
  const seller = listing.seller

  return (
    <div className="container px-4 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={listing.customName ?? listing.card?.name ?? "Card"}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {listing.isGraded && (
              <Badge variant="gold" className="absolute top-3 left-3 sm:top-4 sm:left-4">
                {listing.gradingCompany} {listing.gradeScore}
              </Badge>
            )}
          </div>

          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.map((img, i) => (
                <div
                  key={img.id}
                  className={`relative aspect-square bg-muted rounded-md overflow-hidden cursor-pointer border-2 ${
                    i === 0 ? "border-purple-500" : "border-transparent hover:border-purple-500/50"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${listing.customName ?? "Card"} - ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Title & Price */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="purple">{SERIES_LABELS[listing.series] ?? listing.series}</Badge>
              <Badge variant="secondary">{CONDITION_LABELS[listing.condition]}</Badge>
              {listing.language !== "THAI" && (
                <Badge variant="outline">{LANGUAGE_LABELS[listing.language]}</Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {listing.customName ?? listing.card?.name ?? "Untitled"}
            </h1>

            {listing.card && (
              <p className="text-sm sm:text-base text-muted-foreground">
                {listing.card.setName} • #{listing.card.cardNumber} • {listing.card.rarity}
              </p>
            )}
          </div>

          {/* Price */}
          <Card className="border-gold/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gold">
                  {formatPrice(listing.price)}
                </span>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatPrice(listing.originalPrice)}
                  </span>
                )}
              </div>
              {listing.isNegotiable && (
                <p className="text-sm text-green-400 mt-1">💰 ต่อรองได้</p>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="gold" size="lg" className="flex-1" asChild>
                  <Link href={`/checkout/${listing.id}`}>
                    <Package className="mr-2 h-5 w-5" />
                    ซื้อเลย
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Graded Info */}
          {listing.isGraded && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gold" />
                  ข้อมูลการ์ด Graded
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">บริษัท:</span>{" "}
                    <span className="font-medium">{listing.gradingCompany}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">เกรด:</span>{" "}
                    <span className="font-medium text-gold">{listing.gradeScore}</span>
                  </div>
                  {listing.gradeCertNo && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Cert No:</span>{" "}
                      <span className="font-mono text-xs">{listing.gradeCertNo}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {listing.description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">รายละเอียด</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Shipping */}
          {listing.shippingOptions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  ตัวเลือกจัดส่ง
                </h3>
                <div className="space-y-2">
                  {listing.shippingOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                    >
                      <div>
                        <span className="font-medium">{opt.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({opt.estimatedDays})
                        </span>
                      </div>
                      <span className="text-gold font-medium">
                        {formatPrice(opt.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">ผู้ขาย</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                  <AvatarImage src={seller.user.avatar ?? undefined} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-400">
                    {getInitials(seller.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${seller.user.username}`}
                    className="font-medium hover:text-purple-400 transition-colors truncate block"
                  >
                    {seller.displayName}
                  </Link>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    {seller.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        {seller.rating.toFixed(1)} ({seller.ratingCount})
                      </span>
                    )}
                    <span>{seller.completedOrders} ออเดอร์สำเร็จ</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {seller.isKycVerified && (
                      <Badge variant="success" className="text-[10px]">
                        ✓ Verified
                      </Badge>
                    )}
                    <Badge variant="gold" className="text-[10px]">
                      {seller.tier}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <Link href={`/profile/${seller.user.username}`}>
                    ดูโปรไฟล์
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price History Chart */}
          {listing.card && (
            <PriceHistorySection cardId={listing.card.id} />
          )}

          {/* Similar Listings */}
          <SimilarListingsCard listingId={listing.id} series={listing.series} />

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views} ครั้ง
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ลงขาย {getRelativeTime(listing.createdAt)}
            </span>
          </div>

          {/* Escrow Notice */}
          <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-purple-600/10 border border-purple-600/20">
            <Shield className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-purple-400">ระบบ Escrow คุ้มครอง</p>
              <p className="text-muted-foreground">
                เงินจะถูกเก็บในระบบจนกว่าคุณจะยืนยันว่าได้รับสินค้าถูกต้อง
                หากมีปัญหาสามารถเปิดข้อพิพาทได้
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Price History section (server component to fetch data)
async function PriceHistorySection({ cardId }: { cardId: string }) {
  const history = await prisma.priceHistory.findMany({
    where: { cardId },
    orderBy: { recordedAt: "asc" },
    take: 100,
  })

  if (history.length === 0) return null

  const data = history.map((h) => ({
    date: h.recordedAt.toISOString().split("T")[0],
    price: h.price / 100, // Convert satang to baht for display
  }))

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          ประวัติราคา ({history.length} รายการ)
        </h3>
        <PriceChart data={data} />
      </CardContent>
    </Card>
  )
}

// Similar Listings component
async function SimilarListingsCard({ listingId, series }: { listingId: string; series: string }) {
  const similar = await prisma.listing.findMany({
    where: { id: { not: listingId }, status: "ACTIVE", series: series as any },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1 }, seller: { select: { displayName: true, tier: true } } },
  })

  if (similar.length === 0) return null

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">สินค้าที่คล้ายกัน</h3>
        <div className="grid grid-cols-2 gap-3">
          {similar.map((item) => (
            <Link key={item.id} href={`/listing/${item.id}`} className="group">
              <div className="relative aspect-[3/4] bg-muted rounded-md overflow-hidden mb-2">
                <Image
                  src={item.images[0]?.url ?? "/placeholder-card.png"}
                  alt={item.customName ?? "Card"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="50vw"
                />
              </div>
              <p className="text-xs font-medium truncate">{item.customName}</p>
              <p className="text-xs text-gold font-bold">{formatPrice(item.price)}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
