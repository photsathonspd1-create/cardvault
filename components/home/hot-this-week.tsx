import Image from "next/image"
import Link from "next/link"
import { TrendingUp, Eye, Flame } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export async function HotThisWeek() {
  // Try to get hot cards from PriceHistory (top by % price change)
  let hotItems: { cardName: string; imageUrl: string; price: number; change: number; listingId: string }[] = []

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    // Get price history grouped by card, find cards with biggest price swings
    const priceCards = await prisma.priceHistory.groupBy({
      by: ["cardId"],
      _max: { price: true, recordedAt: true },
      _min: { price: true },
      where: { recordedAt: { gte: sevenDaysAgo } },
      take: 10,
    })

    if (priceCards.length > 0) {
      for (const pc of priceCards) {
        const card = await prisma.cardCatalog.findUnique({
          where: { id: pc.cardId },
          select: { name: true, imageUrl: true },
        })
        if (!card) continue
        const minP = pc._min.price ?? 0
        const maxP = pc._max.price ?? 0
        const change = minP > 0 ? Math.round(((maxP - minP) / minP) * 100) : 0
        const listing = await prisma.listing.findFirst({
          where: { cardId: pc.cardId, status: "ACTIVE" },
          select: { id: true, price: true },
          orderBy: { price: "asc" },
        })
        if (listing) {
          hotItems.push({
            cardName: card.name,
            imageUrl: card.imageUrl,
            price: listing.price,
            change,
            listingId: listing.id,
          })
        }
      }
    }
  } catch {}

  // Fallback: top viewed listings
  if (hotItems.length === 0) {
    const topViewed = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1, orderBy: { order: "asc" } } },
      orderBy: { views: "desc" },
      take: 5,
    })
    hotItems = topViewed.map((item) => ({
      cardName: item.customName ?? "Untitled",
      imageUrl: item.images?.[0]?.url ?? "/placeholder-card.png",
      price: item.price,
      change: 0,
      listingId: item.id,
    }))
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h3 className="text-sm font-bold text-white">กำลัง Hot สัปดาห์นี้</h3>
        <Link href="/browse?sort=popular" className="ml-auto text-xs text-amber-400 hover:text-amber-300">
          ดูทั้งหมด →
        </Link>
      </div>

      {hotItems.length > 0 ? (
        <div className="space-y-2">
          {hotItems.map((item, i) => (
            <Link
              key={item.listingId}
              href={`/listing/${item.listingId}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-xs text-zinc-600 w-4 text-center font-bold">{i + 1}</span>
              <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                <Image
                  src={item.imageUrl}
                  alt={item.cardName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{item.cardName}</p>
                <div className="flex items-center gap-1">
                  {item.change > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-green-400 font-medium">+{item.change}%</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500">ยอดนิยม</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs font-bold text-amber-400">{formatPrice(item.price)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-500">ยังไม่มีข้อมูล</p>
        </div>
      )}
    </div>
  )
}
