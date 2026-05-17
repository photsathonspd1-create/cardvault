import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ListingDetailClient } from "./listing-detail-client"

export const dynamic = "force-dynamic"

interface ListingPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params

  const listing = await prisma.listing.findUnique({
    where: { id },
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
