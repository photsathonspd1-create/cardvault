import Image from "next/image"
import Link from "next/link"
import { TrendingUp, TrendingDown, Flame } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatPrice, cn } from "@/lib/utils"

interface HotItem {
  cardName: string
  imageUrl: string
  price: number
  change: number
  listingId: string
}

export async function HotThisWeek() {
  let priceUp: HotItem[] = []
  let priceDown: HotItem[] = []

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Get cards with price history
    const priceCards = await prisma.priceHistory.groupBy({
      by: ["cardId"],
      _max: { price: true, recordedAt: true },
      _min: { price: true },
      where: { recordedAt: { gte: sevenDaysAgo } },
      take: 20,
    })

    for (const pc of priceCards) {
      const card = await prisma.cardCatalog.findUnique({
        where: { id: pc.cardId },
        select: { name: true, imageUrl: true },
      })
      if (!card) continue

      const minP = pc._min.price ?? 0
      const maxP = pc._max.price ?? 0
      const change = minP > 0 ? Math.round(((maxP - minP) / minP) * 100 * 100) / 100 : 0

      const listing = await prisma.listing.findFirst({
        where: { cardId: pc.cardId, status: "ACTIVE" },
        select: { id: true, price: true },
        orderBy: { price: "asc" },
      })

      if (listing) {
        const item: HotItem = {
          cardName: card.name,
          imageUrl: card.imageUrl,
          price: listing.price,
          change,
          listingId: listing.id,
        }
        if (change > 0) priceUp.push(item)
        else if (change < 0) priceDown.push(item)
      }
    }

    // Sort
    priceUp.sort((a, b) => b.change - a.change)
    priceDown.sort((a, b) => a.change - b.change)
  } catch {}

  // Fallback: top viewed listings
  if (priceUp.length === 0 && priceDown.length === 0) {
    const topViewed = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1, orderBy: { order: "asc" } } },
      orderBy: { views: "desc" },
      take: 5,
    })
    priceUp = topViewed.map((item) => ({
      cardName: item.customName ?? "Untitled",
      imageUrl: item.images?.[0]?.url ?? "/placeholder-card.png",
      price: item.price,
      change: 0,
      listingId: item.id,
    }))
  }

  const hasDown = priceDown.length > 0

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h3 className="text-sm font-bold text-white">ดัชนี Hot</h3>
        <span className="text-[10px] text-zinc-500 ml-1">7 วันล่าสุด</span>
      </div>

      {/* Price Up Section */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[11px] font-semibold text-green-400">ราคาขึ้น</span>
        </div>
        {priceUp.length > 0 ? (
          <div className="space-y-1.5">
            {priceUp.slice(0, 4).map((item, i) => (
              <Link
                key={item.listingId + "-up-" + i}
                href={`/listing/${item.listingId}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-xs text-zinc-600 w-4 text-center font-bold">{i + 1}</span>
                <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                  <Image src={item.imageUrl} alt={item.cardName} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{item.cardName}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-[11px] text-green-400 font-bold">+{item.change}%</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-amber-400">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-600 py-2">ยังไม่มีข้อมูล</p>
        )}
      </div>

      {/* Price Down Section */}
      {hasDown && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px] font-semibold text-red-400">ราคาลง</span>
          </div>
          <div className="space-y-1.5">
            {priceDown.slice(0, 3).map((item, i) => (
              <Link
                key={item.listingId + "-down-" + i}
                href={`/listing/${item.listingId}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-xs text-zinc-600 w-4 text-center font-bold">{i + 1}</span>
                <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                  <Image src={item.imageUrl} alt={item.cardName} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{item.cardName}</p>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    <span className="text-[11px] text-red-400 font-bold">{item.change}%</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-amber-400">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link href="/browse?sort=hot" className="block mt-3 text-center text-xs text-amber-400 hover:text-amber-300 transition-colors">
        ดูทั้งหมด →
      </Link>
    </div>
  )
}
