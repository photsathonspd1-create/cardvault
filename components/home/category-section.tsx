"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface CategoryCount {
  POKEMON: number
  YUGIOH: number
  MTG: number
  ONE_PIECE: number
}

const CATEGORIES = [
  {
    series: "POKEMON" as const,
    name: "Pokemon",
    image: "https://images.pokemontcg.io/swsh4/20_hires.png",
    logo: "🃏",
  },
  {
    series: "YUGIOH" as const,
    name: "Yu-Gi-Oh!",
    image: "https://images.ygoprodeck.com/images/cards/46986414.jpg",
    logo: "⚔️",
  },
  {
    series: "MTG" as const,
    name: "Magic: The Gathering",
    image: "https://cards.scryfall.io/large/front/b/0/b0faa7f2.jpg",
    logo: "🧙",
  },
  {
    series: "ONE_PIECE" as const,
    name: "One Piece",
    image: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-060.png",
    logo: "🏴‍☠️",
  },
]

export function CategorySection({ categoryCounts }: { categoryCounts?: CategoryCount }) {
  const counts = categoryCounts ?? { POKEMON: 0, YUGIOH: 0, MTG: 0, ONE_PIECE: 0 }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">เลือกซีรีส์</h2>
        <Link href="/browse" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          ดูทั้งหมด →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.series}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link href={`/browse?series=${cat.series}`}>
              <div className="group relative aspect-[3/2] rounded-2xl overflow-hidden cursor-pointer border border-transparent hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
                {/* Background Image */}
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm md:text-base">{cat.name}</h3>
                  <p className="text-amber-400 text-xs mt-0.5">{counts[cat.series]} รายการ</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
