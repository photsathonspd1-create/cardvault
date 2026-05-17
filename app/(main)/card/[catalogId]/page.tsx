// @ts-nocheck
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, ShoppingBag, Star, ExternalLink } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface CardPageProps {
  params: { catalogId: string }
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const card = await prisma.cardCatalog.findUnique({
    where: { id: params.catalogId },
    select: { name: true, nameTh: true, setName: true, series: true, rarity: true },
  })

  if (!card) return { title: "ไม่พบการ์ด" }

  const seriesLabel = SERIES_LABELS[card.series] ?? card.series
  const title = `${card.name} — ${card.setName} | ${seriesLabel}`
  const description = `ราคาตลาด ${card.name} ${card.rarity} จากชุด ${card.setName} — ดูราคาและรายการขายบน CardVault`

  return {
    title,
    description,
    openGraph: { title, description },
  }
}

export default async function CardCatalogPage({ params }: CardPageProps) {
  const card = await prisma.cardCatalog.findUnique({
    where: { id: params.catalogId },
    include: {
      priceHistory: {
        orderBy: { recordedAt: "desc" },
        take: 30,
      },
      listings: {
        where: { status: "ACTIVE" },
        include: {
          images: { take: 1, orderBy: { order: "asc" } },
          seller: { include: { user: { select: { name: true, username: true } } } },
        },
        orderBy: { price: "asc" },
        take: 12,
      },
    },
  })

  if (!card) notFound()

  // Price stats
  const prices = card.listings.map((l) => l.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : null
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null

  return (
    <div className="container px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Card Image */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            <Image
              src={card.imageUrlHi ?? card.imageUrl}
              alt={card.name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority
            />
          </div>
        </div>

        {/* Middle: Card Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple">{SERIES_LABELS[card.series]}</Badge>
              {card.rarity && <Badge variant="gold">{card.rarity}</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{card.name}</h1>
            {card.nameTh && <p className="text-lg text-muted-foreground">{card.nameTh}</p>}
            <p className="text-muted-foreground mt-1">
              {card.setName} • #{card.cardNumber}
            </p>
          </div>

          {/* Card Details */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ซีรีส์</span>
                <span>{SERIES_LABELS[card.series]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ชุด (Set)</span>
                <span>{card.setName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">เลขการ์ด</span>
                <span>{card.cardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ความหายาก</span>
                <span>{card.rarity}</span>
              </div>
              {card.artist && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ศิลปิน</span>
                  <span>{card.artist}</span>
                </div>
              )}
              {card.hp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HP</span>
                  <span>{card.hp}</span>
                </div>
              )}
              {card.types && card.types.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ประเภท</span>
                  <span>{card.types.join(", ")}</span>
                </div>
              )}
              {card.supertype && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ชนิด</span>
                  <span>{card.supertype}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Price */}
          {(card.marketPriceRaw || card.marketPriceExt) && (
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  ราคาตลาด
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {card.marketPriceRaw && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ราคาตลาดไทย</span>
                    <span className="font-bold text-gold">{formatPrice(card.marketPriceRaw)}</span>
                  </div>
                )}
                {card.marketPriceExt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ราคาอ้างอิง (TCGPlayer)</span>
                    <span>{formatPrice(card.marketPriceExt)}</span>
                  </div>
                )}
                {card.priceUpdatedAt && (
                  <p className="text-xs text-muted-foreground">
                    อัพเดทล่าสุด: {card.priceUpdatedAt.toLocaleDateString("th-TH")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">รายการขาย</h2>
            <Badge variant="secondary">{card.listings.length} รายการ</Badge>
          </div>

          {/* Price Summary */}
          {minPrice && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ราคาต่ำสุด</span>
                  <span className="font-bold text-green-400">{formatPrice(minPrice)}</span>
                </div>
                {maxPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ราคาสูงสุด</span>
                    <span>{formatPrice(maxPrice)}</span>
                  </div>
                )}
                {avgPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ราคาเฉลี่ย</span>
                    <span>{formatPrice(avgPrice)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {card.listings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">ยังไม่มีรายการขาย</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {card.listings.map((listing) => (
                <Link key={listing.id} href={`/listing/${listing.id}`}>
                  <Card className="hover:border-purple-500/50 transition-all mb-3">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
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
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {CONDITION_LABELS[listing.condition]}
                            </Badge>
                            {listing.isGraded && (
                              <Badge variant="gold" className="text-[10px]">
                                {listing.gradingCompany} {listing.gradeScore}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            โดย {listing.seller?.user?.name ?? "ผู้ขาย"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gold">{formatPrice(listing.price)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
