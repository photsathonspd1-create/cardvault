import Link from "next/link"
import { Star, ShieldCheck } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

const tierBadge: Record<string, { bg: string; text: string }> = {
  VERIFIED_PRO: { bg: "bg-amber-500", text: "text-black" },
  GOLD: { bg: "bg-amber-500", text: "text-black" },
  SILVER: { bg: "bg-zinc-400", text: "text-black" },
  BRONZE: { bg: "bg-orange-700", text: "text-white" },
}

const gradients = [
  "from-amber-500 to-orange-500",
  "from-purple-500 to-blue-500",
  "from-green-500 to-teal-500",
  "from-red-500 to-pink-500",
]

export async function VerifiedSellerSpotlight() {
  const sellers = await prisma.sellerProfile.findMany({
    where: {
      isKycVerified: true,
      tier: { in: ["GOLD", "VERIFIED_PRO", "SILVER"] },
    },
    include: {
      user: { select: { name: true, username: true, avatar: true } },
    },
    orderBy: { totalSales: "desc" },
    take: 4,
  })

  if (sellers.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-2 mb-8">
          <Star className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Verified Seller Spotlight</h2>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center">
          <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">ยังไม่มี Verified Seller</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Verified Seller Spotlight</h2>
        </div>
        <Link href="/browse?sort=sellers" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          ดูทั้งหมด →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sellers.map((seller, i) => {
          const initials = (seller.user.name as string)
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
          const tier = seller.tier
          const badge = tierBadge[tier] ?? tierBadge.BRONZE

          return (
            <Link
              key={seller.id}
              href={`/profile/${seller.user.username}`}
              className="block"
            >
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white border-2 border-amber-500",
                      gradients[i % gradients.length]
                    )}
                  >
                    {seller.user.avatar ? (
                      <img src={seller.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-[120px]">{seller.user.name}</p>
                    <span
                      className={cn(
                        "inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full",
                        badge.bg,
                        badge.text
                      )}
                    >
                      {tier === "VERIFIED_PRO" ? "Pro" : tier.charAt(0) + tier.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs font-bold text-white">{seller.totalSales}</p>
                    <p className="text-[10px] text-zinc-500">รายการขาย</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {seller.completedOrders > 0
                        ? Math.round((seller.completedOrders / Math.max(seller.completedOrders + seller.cancelledOrders, 1)) * 100)
                        : 0}%
                    </p>
                    <p className="text-[10px] text-zinc-500">สำเร็จ</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {seller.rating.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-zinc-500">rating</p>
                  </div>
                </div>
                {/* Star rating visual */}
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={cn(
                        "w-3 h-3",
                        si < Math.round(seller.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-zinc-700 text-zinc-700"
                      )}
                    />
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
