"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn, formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import { conditionColors, sellerTiers } from "@/lib/design-tokens"

interface ListingCardProps {
  listing: {
    id: string
    customName?: string | null
    price: number
    condition: string
    series: string
    isGraded?: boolean
    gradingCompany?: string | null
    gradeScore?: string | null
    images?: { url: string }[]
    seller?: {
      tier?: string
      user?: { name?: string | null; username?: string | null }
    }
  }
  index?: number
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const imageUrl = listing.images?.[0]?.url ?? "/placeholder-card.png"
  const condition = conditionColors[listing.condition] ?? conditionColors.NM
  const tier = listing.seller?.tier
  const tierStyle = tier ? sellerTiers[tier as keyof typeof sellerTiers] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/listing/${listing.id}`}>
        <div className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10">
          {/* Image */}
          <div className="relative aspect-[5/7] bg-zinc-800 overflow-hidden">
            <Image
              src={imageUrl}
              alt={listing.customName ?? "Card"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
            />

            {/* Seller Tier Badge */}
            {tierStyle && (
              <div
                className={cn(
                  "absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full",
                  tierStyle.bg,
                  tierStyle.text
                )}
              >
                {tierStyle.label}
              </div>
            )}

            {/* Graded Badge */}
            {listing.isGraded && listing.gradingCompany && (
              <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                {listing.gradingCompany} {listing.gradeScore}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 space-y-1">
            <p className="text-[11px] text-zinc-500 truncate">
              {SERIES_LABELS[listing.series] ?? listing.series}
            </p>
            <h3 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
              {listing.customName ?? "Untitled"}
            </h3>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  condition.bg,
                  condition.text
                )}
              >
                {CONDITION_LABELS[listing.condition] ?? listing.condition}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-bold text-amber-400">
                {formatPrice(listing.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
