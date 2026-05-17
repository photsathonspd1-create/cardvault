"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
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

const MOCK_PROFILE = {
  name: "CardMasterTH",
  username: "cardmasterth",
  avatar: "CM",
  tier: "Gold",
  bio: "ผู้เชี่ยวชาญการ์ด Pokemon TCG มากกว่า 10 ปี รับประกันของแท้ทุกใบ",
  sales: "1,250",
  successRate: "99.8",
  rating: 4.9,
  reviewCount: 320,
  joined: "ม.ค. 2023",
  verified: true,
  gradient: "from-amber-500 to-orange-500",
}

const MOCK_REVIEWS = [
  { user: "PokemonFan", avatar: "PF", rating: 5, comment: "การ์ดสภาพดีมาก ตรงตามที่ลงขาย ส่งไว แพ็คดี", date: "2 วันที่แล้ว" },
  { user: "YGOPlayer", avatar: "YG", rating: 5, comment: "แนะนำเลยครับ ผู้ขายไว้ใจได้", date: "1 สัปดาห์ที่แล้ว" },
  { user: "CardNewbie", avatar: "CN", rating: 4, comment: "ดีครับ แต่ packaging ควรปรับปรุงนิดนึง", date: "2 สัปดาห์ที่แล้ว" },
]

export default function ProfilePage() {
  const [tab, setTab] = useState<"listings" | "reviews" | "about">("listings")

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden mb-6 border border-zinc-800">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-purple-600 to-amber-500" />

        <div className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div
              className={cn(
                "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl font-bold text-white border-4 border-amber-500 shadow-lg",
                MOCK_PROFILE.gradient
              )}
            >
              {MOCK_PROFILE.avatar}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{MOCK_PROFILE.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                  {MOCK_PROFILE.tier}
                </span>
                {MOCK_PROFILE.verified && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <p className="text-sm text-zinc-400 mt-1">@{MOCK_PROFILE.username}</p>
            </div>

            {/* Actions */}
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

          {/* Bio */}
          <p className="text-sm text-zinc-400 mt-4 max-w-lg">{MOCK_PROFILE.bio}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-white font-medium">{MOCK_PROFILE.sales}</span>
              <span className="text-xs text-zinc-500">รายการขาย</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-white font-medium">{MOCK_PROFILE.successRate}%</span>
              <span className="text-xs text-zinc-500">สำเร็จ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-400 font-medium">{MOCK_PROFILE.rating}</span>
              <span className="text-xs text-zinc-500">({MOCK_PROFILE.reviewCount} รีวิว)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">เข้าร่วม {MOCK_PROFILE.joined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
        {[
          { id: "listings" as const, label: "รายการขาย" },
          { id: "reviews" as const, label: "รีวิว" },
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 animate-pulse">
              <div className="aspect-[5/7] bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div className="space-y-6">
          {/* Rating Summary */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex flex-col sm:flex-row gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-amber-400">{MOCK_PROFILE.rating}</p>
              <div className="flex gap-0.5 justify-center mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < Math.round(MOCK_PROFILE.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-700")} />
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-1">{MOCK_PROFILE.reviewCount} รีวิว</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = star === 5 ? 75 : star === 4 ? 18 : star === 3 ? 5 : star === 2 ? 1 : 1
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-3">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500 w-8">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review Cards */}
          {MOCK_REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{review.user}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={cn("w-3 h-3", j < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700")} />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-[10px] text-zinc-500">{review.date}</span>
              </div>
              <p className="text-sm text-zinc-300">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* About Tab */}
      {tab === "about" && (
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">อัตราการตอบกลับ</p>
              <p className="text-sm font-bold text-white">98%</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">เวลาจัดส่งเฉลี่ย</p>
              <p className="text-sm font-bold text-white">1.5 วัน</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">สมาชิกตั้งแต่</p>
              <p className="text-sm font-bold text-white">{MOCK_PROFILE.joined}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">ยอดขายรวม</p>
              <p className="text-sm font-bold text-white">{MOCK_PROFILE.sales} รายการ</p>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-green-400">ยืนยันตัวตนแล้ว</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span className="text-green-400">ยืนยันเบอร์โทรแล้ว</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
