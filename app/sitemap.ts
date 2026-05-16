import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cardvault.co.th"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  // Dynamic listing pages
  let listingPages: MetadataRoute.Sitemap = []
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    })

    listingPages = listings.map((listing) => ({
      url: `${BASE_URL}/listing/${listing.id}`,
      lastModified: listing.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  } catch {
    // DB might not be available during build
  }

  // Dynamic card catalog pages
  let cardPages: MetadataRoute.Sitemap = []
  try {
    const cards = await prisma.cardCatalog.findMany({
      select: { id: true },
      take: 1000,
    })

    cardPages = cards.map((card) => ({
      url: `${BASE_URL}/card/${card.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch {
    // DB might not be available during build
  }

  return [...staticPages, ...listingPages, ...cardPages]
}
