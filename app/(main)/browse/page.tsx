// @ts-nocheck
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { BrowseContent } from "./browse-content"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface BrowsePageProps {
  searchParams: Promise<{
    series?: string
    condition?: string
    sort?: string
    q?: string
    page?: string
  }>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 20

  // Build filter
  const where: Prisma.ListingWhereInput = { status: "ACTIVE" }
  if (params.series) {
    where.series = params.series as Prisma.EnumCardSeriesFilter<"Listing">
  }
  if (params.condition) {
    where.condition = params.condition as Prisma.EnumConditionFilter<"Listing">
  }
  if (params.q) {
    const matchingCards = await prisma.cardCatalog.findMany({
      where: { name: { contains: params.q, mode: "insensitive" } },
      select: { id: true },
      take: 50,
    })
    const cardIds = matchingCards.map((c) => c.id)

    if (cardIds.length > 0) {
      where.OR = [
        { customName: { contains: params.q, mode: "insensitive" } },
        { cardId: { in: cardIds } },
      ]
    } else {
      where.OR = [
        { customName: { contains: params.q, mode: "insensitive" } },
      ]
    }
  }

  // Sort
  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" }
  if (params.sort === "price_asc") orderBy = { price: "asc" }
  if (params.sort === "price_desc") orderBy = { price: "desc" }
  if (params.sort === "popular") orderBy = { views: "desc" }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        seller: { include: { user: { select: { name: true, username: true } } } },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy,
    }),
    prisma.listing.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <BrowseContent
        listings={listings}
        total={total}
        page={page}
        totalPages={totalPages}
        searchParams={params}
      />
    </Suspense>
  )
}

function BrowseSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 animate-pulse h-96" />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 animate-pulse">
                <div className="aspect-[5/7] bg-zinc-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-1/3" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-5 bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
