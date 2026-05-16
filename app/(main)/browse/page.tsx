import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS, LANGUAGE_LABELS } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { Search, SlidersHorizontal, Star, Eye } from "lucide-react"
import { CardSeries, Condition, ListingStatus } from "@prisma/client"

interface BrowsePageProps {
  searchParams: {
    series?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
    graded?: string
    sort?: string
    page?: string
    q?: string
  }
}

const ITEMS_PER_PAGE = 20

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const {
    series,
    condition,
    minPrice,
    maxPrice,
    graded,
    sort = "newest",
    page = "1",
    q,
  } = searchParams

  const currentPage = Math.max(1, parseInt(page))

  // Build where clause
  const where: any = {
    status: ListingStatus.ACTIVE,
  }

  if (series && series !== "ALL") {
    where.series = series as CardSeries
  }

  if (condition && condition !== "ALL") {
    where.condition = condition as Condition
  }

  if (minPrice) {
    where.price = { ...where.price, gte: parseInt(minPrice) * 100 }
  }

  if (maxPrice) {
    where.price = { ...where.price, lte: parseInt(maxPrice) * 100 }
  }

  if (graded === "true") {
    where.isGraded = true
  }

  if (q) {
    where.OR = [
      { customName: { contains: q, mode: "insensitive" } },
      { card: { name: { contains: q, mode: "insensitive" } } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" }
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" }
      break
    case "price_desc":
      orderBy = { price: "desc" }
      break
    case "popular":
      orderBy = { views: "desc" }
      break
    case "oldest":
      orderBy = { createdAt: "asc" }
      break
  }

  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        seller: {
          include: {
            user: { select: { name: true, username: true } },
          },
        },
      },
      orderBy,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.listing.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="container px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {series && series !== "ALL"
            ? `ค้นหา ${SERIES_LABELS[series] ?? series}`
            : q
            ? `ผลการค้นหา "${q}"`
            : "ค้นหาการ์ดทั้งหมด"}
        </h1>
        <p className="text-muted-foreground">
          {totalCount.toLocaleString()} รายการ
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <form className="flex gap-2" action="/browse" method="GET">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="ค้นหาชื่อการ์ด..."
              defaultValue={q}
              className="pl-10"
            />
          </div>
          {series && <input type="hidden" name="series" value={series} />}
          <Button type="submit" variant="purple">
            ค้นหา
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Select name="series" defaultValue={series ?? "ALL"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ซีรีส์" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกซีรีส์</SelectItem>
              {Object.entries(SERIES_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="condition" defaultValue={condition ?? "ALL"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="สภาพ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกสภาพ</SelectItem>
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="sort" defaultValue={sort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
              <SelectItem value="oldest">เก่าสุด</SelectItem>
              <SelectItem value="price_asc">ราคาต่ำ → สูง</SelectItem>
              <SelectItem value="price_desc">ราคาสูง → ต่ำ</SelectItem>
              <SelectItem value="popular">ยอดนิยม</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">ไม่พบรายการที่ค้นหา</p>
          <Button variant="outline" asChild>
            <Link href="/browse">ล้างตัวกรอง</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {currentPage > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/browse?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(searchParams).filter(([_, v]) => v)
                      ),
                      page: String(currentPage - 1),
                    }).toString()}`}
                  >
                    ก่อนหน้า
                  </Link>
                </Button>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "purple" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/browse?${new URLSearchParams({
                        ...Object.fromEntries(
                          Object.entries(searchParams).filter(([_, v]) => v)
                        ),
                        page: String(pageNum),
                      }).toString()}`}
                    >
                      {pageNum}
                    </Link>
                  </Button>
                )
              })}

              {currentPage < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/browse?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(searchParams).filter(([_, v]) => v)
                      ),
                      page: String(currentPage + 1),
                    }).toString()}`}
                  >
                    ถัดไป
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const imageUrl = listing.images?.[0]?.url ?? "/placeholder-card.png"

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 h-full">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <Image
            src={imageUrl}
            alt={listing.customName ?? listing.card?.name ?? "Card"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
          {listing.isGraded && (
            <Badge variant="gold" className="absolute top-2 left-2 text-[10px]">
              {listing.gradingCompany} {listing.gradeScore}
            </Badge>
          )}
          {listing.isFeatured && (
            <Badge variant="purple" className="absolute top-2 right-2 text-[10px]">
              ⭐ แนะนำ
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white/80 bg-black/50 rounded px-1.5 py-0.5">
            <Eye className="h-3 w-3" />
            {listing.views}
          </div>
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground truncate">
            {SERIES_LABELS[listing.series] ?? listing.series}
            {listing.language !== "THAI" && ` • ${LANGUAGE_LABELS[listing.language] ?? listing.language}`}
          </p>
          <h3 className="font-medium text-sm truncate group-hover:text-purple-400 transition-colors">
            {listing.customName ?? listing.card?.name ?? "Untitled"}
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-gold">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            โดย {listing.seller.user.name}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
