"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn, getInitials, getRelativeTime } from "@/lib/utils"
import { ListingCard } from "@/components/listing/listing-card"
import {
  Star,
  MessageCircle,
  Flag,
  Shield,
  CheckCircle2,
  Calendar,
  Package,
  TrendingUp,
} from "lucide-react"

interface ProfileClientProps {
  user: {
    id: string
    name: string | null
    username: string | null
    avatar: string | null
    createdAt: Date
  }
  sellerProfile: {
    tier: string
    displayName: string | null
    bio: string | null
    kycStatus: string
    totalSales: number
    successRate: number
    rating: number
    responseRate: number
  } | null
  listings: Record<string, unknown>[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    buyerName: string | null
  }[]
  stats: {
    totalListings: number
    completedOrders: number
    avgRating: number
    reviewCount: number
  }
}

const TIER_STYLES: Record<string, { bg: string; label: string }> = {
  GOLD: { bg: "bg-amber-500", label: "Gold" },
  SILVER: { bg: "bg-zinc-400", label: "Silver" },
  BRONZE: { bg: "bg-orange-700", label: "Bronze" },
}

export function ProfileClient({ user, sellerProfile, listings, reviews, stats }: ProfileClientProps) {
  const [tab, setTab] = useState<"listings" | "reviews" | "about">("listings")

  const displayName = sellerProfile?.displayName ?? user.name ?? "Unknown"
  const tier = sellerProfile?.tier ?? "BRONZE"
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.BRONZE
  const rating = sellerProfile?.rating ?? stats.avgRating
  const joinedDate = new Date(user.createdAt).toLocaleDateString("th-TH", { month: "short", year: "numeric" })
  const avatarInitial = getInitials(displayName)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden mb-6 border border-zinc-800">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-amber-500" />
        <div className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-2xl font-bold text-white border-4 border-amber-500 shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                avatarInitial
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold", tierStyle.bg, tier === "GOLD" ? "text-black" : tier === "SILVER" ? "text-black" : "text-white")}>
                  {tierStyle.label}
                </span>
                {sellerProfile?.kycStatus === "VERIFIED" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>
              {user.username && <p className="text-sm text-zinc-400 mt-1">@{user.username}</p>}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors">
                ติดตาม
              </button>
              <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                แชท
              </button>
              <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors" aria-label="รายงาน">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {sellerProfile?.bio && (
            <p className="text-sm text-zinc-400 mt-4 max-w-lg">{sellerProfile.bio}</p>
          )}

          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-white font-medium">{sellerProfile?.totalSales ?? 0}</span>
              <span className="text-xs text-zinc-500">รายการขาย</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-white font-medium">{sellerProfile?.successRate ?? 0}%</span>
              <span className="text-xs text-zinc-500">สำเร็จ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-400 font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-zinc-500">({stats.reviewCount} รีวิว)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">เข้าร่วม {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
        {[
          { id: "listings" as const, label: `รายการขาย (${listings.length})` },
          { id: "reviews" as const, label: `รีวิว (${reviews.length})` },
          { id: "about" as const, label: "เกี่ยวกับ" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              tab === t.id ? "bg-amber-500/10 text-amber-400" : "text-zinc-400 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {tab === "listings" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.length > 0 ? (
            listings.map((listing, i) => (
              <ListingCard key={String(listing.id)} listing={listing as never} index={i} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">ยังไม่มีรายการขาย</p>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex flex-col sm:flex-row gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-amber-400">{rating.toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-700")} />
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-1">{stats.reviewCount} รีวิว</p>
            </div>
          </div>

          {reviews.length > 0 ? reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  {getInitials(review.buyerName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{review.buyerName ?? "ผู้ใช้"}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={cn("w-3 h-3", j < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700")} />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-[10px] text-zinc-500">{getRelativeTime(review.createdAt)}</span>
              </div>
              {review.comment && <p className="text-sm text-zinc-300">{review.comment}</p>}
            </motion.div>
          )) : (
            <div className="text-center py-10">
              <Star className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">ยังไม่มีรีวิว</p>
            </div>
          )}
        </div>
      )}

      {/* About Tab */}
      {tab === "about" && (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">อัตราการตอบกลับ</p>
              <p className="text-sm font-bold text-white">{sellerProfile?.responseRate ?? 0}%</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">ยอดขายสำเร็จ</p>
              <p className="text-sm font-bold text-white">{stats.completedOrders} รายการ</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">สมาชิกตั้งแต่</p>
              <p className="text-sm font-bold text-white">{joinedDate}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">รายการขายปัจจุบัน</p>
              <p className="text-sm font-bold text-white">{stats.totalListings} รายการ</p>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            {sellerProfile?.kycStatus === "VERIFIED" && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-green-400">ยืนยันตัวตนแล้ว</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
