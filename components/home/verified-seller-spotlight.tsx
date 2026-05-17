"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const SELLERS = [
  {
    name: "CardMasterTH",
    avatar: "CM",
    tier: "Gold" as const,
    sales: "1,250",
    successRate: "99.8",
    rating: 4.9,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "PokemonTH_Shop",
    avatar: "PT",
    tier: "Gold" as const,
    sales: "890",
    successRate: "99.5",
    rating: 4.8,
    gradient: "from-purple-500 to-blue-500",
  },
  {
    name: "YuGiOhPro",
    avatar: "YG",
    tier: "Silver" as const,
    sales: "456",
    successRate: "98.2",
    rating: 4.7,
    gradient: "from-green-500 to-teal-500",
  },
  {
    name: "OnePieceCards",
    avatar: "OP",
    tier: "Silver" as const,
    sales: "320",
    successRate: "97.8",
    rating: 4.6,
    gradient: "from-red-500 to-pink-500",
  },
]

const tierBadge: Record<string, { bg: string; text: string }> = {
  Gold: { bg: "bg-amber-500", text: "text-black" },
  Silver: { bg: "bg-zinc-400", text: "text-black" },
  Bronze: { bg: "bg-orange-700", text: "text-white" },
}

export function VerifiedSellerSpotlight() {
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
        {SELLERS.map((seller, i) => (
          <motion.div
            key={seller.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Link href={`/profile/${seller.name}`}>
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white border-2 border-amber-500",
                      seller.gradient
                    )}
                  >
                    {seller.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{seller.name}</p>
                    <span
                      className={cn(
                        "inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full",
                        tierBadge[seller.tier].bg,
                        tierBadge[seller.tier].text
                      )}
                    >
                      {seller.tier}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs font-bold text-white">{seller.sales}</p>
                    <p className="text-[10px] text-zinc-500">รายการขาย</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{seller.successRate}%</p>
                    <p className="text-[10px] text-zinc-500">สำเร็จ</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {seller.rating}
                    </p>
                    <p className="text-[10px] text-zinc-500">rating</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
