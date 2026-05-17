import Image from "next/image"
import Link from "next/link"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatPrice, cn } from "@/lib/utils"

interface SpotlightItem {
  id: string
  cardName: string
  imageUrl: string
  price: number
  priceChange: number // % change
  condition: string
  sellerTier: string
  listingId: string
}

const tierColors: Record<string, { bg: string; border: string; glow: string }> = {
  VERIFIED_PRO: { bg: "bg-amber-500", border: "border-amber-500", glow: "shadow-amber-500/30" },
  GOLD: { bg: "bg-amber-500", border: "border-amber-500", glow: "shadow-amber-500/30" },
  SILVER: { bg: "bg-zinc-400", border: "border-zinc-400", glow: "shadow-zinc-400/30" },
  BRONZE: { bg: "bg-orange-700", border: "border-orange-700", glow: "shadow-orange-700/30" },
}

export async function CardSpotlight() {
  let items: SpotlightItem[] = []

  try {
    // Get listings with price history to calculate change
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        seller: {
          select: {
            tier: true,
            displayName: true,
          },
        },
        card: {
          include: {
            priceHistory: {
              orderBy: { recordedAt: "desc" },
              take: 2,
            },
          },
        },
      },
      orderBy: { views: "desc" },
      take: 6,
    })

    items = listings.map((l) => {
      let priceChange = 0
      if (l.card?.priceHistory && l.card.priceHistory.length >= 2) {
        const latest = l.card.priceHistory[0].price
        const prev = l.card.priceHistory[1].price
        if (prev > 0) priceChange = Math.round(((latest - prev) / prev) * 100 * 100) / 100
      }

      return {
        id: l.id,
        cardName: l.customName ?? l.card?.name ?? "Untitled",
        imageUrl: l.images?.[0]?.url ?? l.card?.imageUrl ?? "/placeholder-card.png",
        price: l.price,
        priceChange,
        condition: l.condition,
        sellerTier: l.seller?.tier ?? "BRONZE",
        listingId: l.id,
      }
    })
  } catch {}

  // Mock fallback if no data
  if (items.length === 0) {
    items = [
      { id: "1", cardName: "Charizard VMAX (Gold)", imageUrl: "https://images.pokemontcg.io/swsh4/20_hires.png", price: 1250000, priceChange: 28.45, condition: "MINT", sellerTier: "GOLD", listingId: "mock1" },
      { id: "2", cardName: "Pikachu V Full Art", imageUrl: "https://images.pokemontcg.io/swsh12/44_hires.png", price: 480000, priceChange: 15.2, condition: "NEAR_MINT", sellerTier: "SILVER", listingId: "mock2" },
      { id: "3", cardName: "Blue-Eyes White Dragon", imageUrl: "https://images.ygoprodeck.com/images/cards/46986414.jpg", price: 890000, priceChange: -5.3, condition: "MINT", sellerTier: "GOLD", listingId: "mock3" },
      { id: "4", cardName: "Monkey D. Luffy SEC", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-060.png", price: 320000, priceChange: 42.1, condition: "EXCELLENT", sellerTier: "VERIFIED_PRO", listingId: "mock4" },
    ]
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h2 className="text-2xl font-bold text-white">สปอตไลท์</h2>
          <span className="text-xs text-zinc-500 ml-2">การ์ดแนะนำจาก Verified Sellers</span>
        </div>
        <Link href="/browse?sort=featured" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          ดูทั้งหมด →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item, i) => {
          const tier = tierColors[item.sellerTier] ?? tierColors.BRONZE
          const isUp = item.priceChange > 0
          const isDown = item.priceChange < 0

          return (
            <Link key={item.id} href={`/listing/${item.listingId}`}>
              <div className={cn(
                "group relative bg-zinc-900 rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                tier.border,
                `hover:${tier.glow}`
              )}>
                {/* Image */}
                <div className="relative aspect-[3/4] bg-zinc-800 overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.cardName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 16vw"
                    loading="lazy"
                  />
                  {/* Seller tier badge */}
                  <div className={cn("absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-black", tier.bg)}>
                    {item.sellerTier === "VERIFIED_PRO" ? "Pro" : item.sellerTier.charAt(0) + item.sellerTier.slice(1).toLowerCase()}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                    {item.cardName}
                  </h3>
                  <p className="text-sm font-bold text-amber-400">{formatPrice(item.price)}</p>
                  {/* Price change */}
                  {item.priceChange !== 0 && (
                    <div className={cn("flex items-center gap-1 text-[11px] font-medium",
                      isUp ? "text-green-400" : isDown ? "text-red-400" : "text-zinc-500"
                    )}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : null}
                      {isUp ? "+" : ""}{item.priceChange}%
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
