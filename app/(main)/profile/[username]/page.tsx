import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS, getRelativeTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Star, Shield, Package, ShoppingBag, MessageCircle } from "lucide-react"

export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: { username: string }
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      sellerProfile: {
        include: {
          _count: { select: { listings: true } },
        },
      },
      _count: {
        select: {
          reviewsReceived: true,
        },
      },
    },
  })

  if (!user) notFound()

  const reviews = await prisma.review.findMany({
    where: { revieweeId: user.id, isHidden: false },
    include: {
      reviewer: { select: { name: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const listings = user.sellerProfile
    ? await prisma.listing.findMany({
        where: { sellerId: user.sellerProfile.id, status: "ACTIVE" },
        include: { images: { take: 1, orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
    : []

  const sp = user.sellerProfile

  return (
    <div className="container px-4 py-8 max-w-4xl space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-3xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {sp && (
                  <>
                    <Badge variant="gold">{sp.tier}</Badge>
                    {sp.isKycVerified && <Badge variant="success">✓ Verified</Badge>}
                    {sp.rating > 0 && (
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        {sp.rating.toFixed(1)} ({sp.ratingCount} รีวิว)
                      </span>
                    )}
                  </>
                )}
                <span className="text-xs text-muted-foreground">
                  สมาชิกตั้งแต่ {user.createdAt.toLocaleDateString("th-TH", { year: "numeric", month: "long" })}
                </span>
              </div>
              {sp?.bio && (
                <p className="text-sm text-muted-foreground mt-2">{sp.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {sp && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{sp.totalSales}</p>
              <p className="text-xs text-muted-foreground">ยอดขาย</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{sp.completedOrders}</p>
              <p className="text-xs text-muted-foreground">ออเดอร์สำเร็จ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{sp._count.listings}</p>
              <p className="text-xs text-muted-foreground">รายการขาย</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{user._count.reviewsReceived}</p>
              <p className="text-xs text-muted-foreground">รีวิว</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Listings */}
      {listings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">รายการขาย</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="group overflow-hidden hover:border-purple-500/50 transition-all">
                  <div className="relative aspect-[3/4] bg-muted">
                    <Image
                      src={listing.images?.[0]?.url ?? "/placeholder-card.png"}
                      alt={listing.customName ?? "Card"}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                    {listing.isGraded && (
                      <Badge variant="gold" className="absolute top-2 left-2 text-[10px]">
                        {listing.gradingCompany} {listing.gradeScore}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground truncate">
                      {SERIES_LABELS[listing.series]}
                    </p>
                    <h3 className="font-medium text-sm truncate group-hover:text-purple-400">
                      {listing.customName ?? "Untitled"}
                    </h3>
                    <p className="text-lg font-bold text-gold mt-1">
                      {formatPrice(listing.price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">รีวิว ({user._count.reviewsReceived})</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer.avatar ?? undefined} />
                      <AvatarFallback className="bg-muted text-xs">
                        {getInitials(review.reviewer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.reviewer.name}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? "fill-gold text-gold" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                      )}
                      {review.sellerReply && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <span className="text-xs text-muted-foreground">ผู้ขายตอบ:</span>
                          <p>{review.sellerReply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
