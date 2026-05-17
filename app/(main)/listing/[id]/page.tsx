// @ts-nocheck
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import { ListingDetailClient } from "./listing-detail-client"

export const dynamic = "force-dynamic"

interface ListingPageProps {
  params: { id: string }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: {
        include: {
          user: { select: { name: true, username: true, avatar: true } },
        },
      },
      card: true,
    },
  })

  if (!listing) notFound()

  // Similar listings
  const similarListings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      series: listing.series,
      id: { not: listing.id },
    },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: { include: { user: { select: { name: true, username: true } } } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  })

  // Market price (average of same card)
  const marketAvg = await prisma.listing.aggregate({
    where: {
      status: "ACTIVE",
      series: listing.series,
      cardId: listing.cardId,
    },
    _avg: { price: true },
  })

  return (
    <ListingDetailClient
      listing={listing}
      similarListings={similarListings}
      marketAvgPrice={marketAvg._avg.price}
    />
  )
}
