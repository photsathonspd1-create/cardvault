"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn, formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import { conditionColors, sellerTiers } from "@/lib/design-tokens"
import { ListingCard } from "@/components/listing/listing-card"
import {
  Shield,
  Star,
  Eye,
  Heart,
  Share2,
  ChevronRight,
  Truck,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface ListingDetailClientProps {
  listing: any
  similarListings: any[]
  marketAvgPrice: number | null
}

export function ListingDetailClient({ listing, similarListings, marketAvgPrice }: ListingDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const imageUrl = listing.images?.[selectedImage]?.url ?? listing.images?.[0]?.url ?? "/placeholder-card.png"
  const condition = conditionColors[listing.condition] ?? conditionColors.NM
  const tier = listing.seller?.tier
  const tierStyle = tier ? sellerTiers[tier as keyof typeof sellerTiers] : null

  const priceDiff = marketAvgPrice ? ((listing.price - marketAvgPrice) / marketAvgPrice) * 100 : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-300 transition-colors">หน้าแรก</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/browse" className="hover:text-zinc-300 transition-colors">Browse</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/browse?series=${listing.series}`} className="hover:text-zinc-300 transition-colors">
          {SERIES_LABELS[listing.series] ?? listing.series}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300 truncate">{listing.customName ?? listing.card?.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* LEFT — Images */}
        <div className="w-full lg:w-[55%]">
          {/* Main Image */}
          <div
            className="relative aspect-[5/7] rounded-2xl overflow-hidden border border-zinc-800 cursor-pointer bg-zinc-900"
            onClick={() => setShowLightbox(true)}
          >
            <Image
              src={imageUrl}
              alt={listing.customName ?? "Card"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-3 left-3 bg-zinc-900/80 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-zinc-300">
              📷 รูปจริง ถ่ายโดยผู้ขาย
            </div>
          </div>

          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {listing.images.map((img: any, i: number) => (
                <button
                  key={img.id ?? i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-16 h-22 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
                    selectedImage === i ? "border-amber-500" : "border-zinc-800 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div className="w-full lg:w-[45%] lg:sticky lg:top-24 lg:self-start space-y-5">
          {/* Series Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-3 py-1 rounded-full border border-amber-500/30 text-amber-400">
              {SERIES_LABELS[listing.series] ?? listing.series}
            </span>
            {listing.card?.language && (
              <span className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400">
                {listing.card.language === "JAPANESE" ? "🇯🇵 Japanese" :
                 listing.card.language === "THAI" ? "🇹🇭 Thai" :
                 listing.card.language === "ENGLISH" ? "🇺🇸 English" : listing.card.language}
              </span>
            )}
          </div>

          {/* Card Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {listing.customName ?? listing.card?.name ?? "Untitled"}
          </h1>

          {/* Set + Number */}
          {listing.card?.setName && (
            <p className="text-sm text-zinc-400">
              {listing.card.setName}
              {listing.card.number && ` · ${listing.card.number}`}
            </p>
          )}

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold px-3 py-1.5 rounded-lg border", condition.bg, condition.text, condition.border)}>
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </span>
            <div className="flex gap-1">
              {["MINT", "NM", "EX", "GD", "PL", "PR"].map((c) => (
                <span
                  key={c}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded",
                    listing.condition === c
                      ? "bg-amber-500/20 text-amber-400 font-bold"
                      : "text-zinc-600"
                  )}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Graded Info */}
          {listing.isGraded && (
            <div className="bg-zinc-900 rounded-xl p-3 border border-amber-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm">
                {listing.gradingCompany}
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">{listing.gradingCompany} {listing.gradeScore}</p>
                {listing.gradingCertNumber && (
                  <p className="text-xs text-zinc-500">Cert# {listing.gradingCertNumber}</p>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <div className="text-4xl font-bold text-amber-400">
              {formatPrice(listing.price)}
            </div>
            {priceDiff !== null && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg",
                  priceDiff <= 0
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {priceDiff <= 0 ? "🟢" : "🔴"} ราคาตลาด {formatPrice(marketAvgPrice!)} —{" "}
                {priceDiff <= 0 ? "ต่ำกว่า" : "สูงกว่า"}ตลาด {Math.abs(priceDiff).toFixed(1)}%
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-colors">
              ซื้อเลย
            </button>
            <button className="w-full h-12 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              เพิ่ม Watchlist
            </button>
            {listing.isNegotiable && (
              <button className="w-full h-12 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-medium text-sm rounded-xl transition-colors">
                ต่อราคา
              </button>
            )}
          </div>

          {/* Escrow Badge */}
          <div className="bg-zinc-900 rounded-xl p-3 flex items-start gap-3 border border-zinc-800">
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400">
              เงินของคุณปลอดภัยอยู่ใน <span className="text-amber-400 font-medium">Escrow</span> จนกว่าคุณจะยืนยันรับของ
            </p>
          </div>

          {/* Shipping */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              ตัวเลือกจัดส่ง
            </h3>
            <div className="space-y-2">
              {[
                { name: "Kerry Express", price: "฿40", time: "1-2 วัน" },
                { name: "Flash Express", price: "฿35", time: "2-3 วัน" },
                { name: "Thailand Post", price: "฿25", time: "3-5 วัน" },
              ].map((shipping, i) => (
                <div
                  key={shipping.name}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all",
                    i === 0 ? "border-amber-500 bg-amber-500/5" : "border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-white">{shipping.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{shipping.price}</span>
                    <span className="text-[10px] text-zinc-500 ml-2">{shipping.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-sm font-bold text-white border-2 border-amber-500">
                {listing.seller?.user?.name?.[0] ?? "S"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">
                    {listing.seller?.user?.name ?? listing.seller?.user?.username}
                  </p>
                  {tierStyle && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", tierStyle.bg, tierStyle.text)}>
                      {tierStyle.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-amber-400">{listing.seller?.rating?.toFixed(1) ?? "4.5"}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div>
                <p className="text-xs font-bold text-white">{listing.seller?.totalSales ?? 0}</p>
                <p className="text-[10px] text-zinc-500">รายการขาย</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white">{listing.seller?.responseRate ?? 95}%</p>
                <p className="text-[10px] text-zinc-500">ตอบกลับ</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {listing.seller?.createdAt ? new Date(listing.seller.createdAt).toLocaleDateString("th-TH", { month: "short", year: "numeric" }) : "—"}
                </p>
                <p className="text-[10px] text-zinc-500">เข้าร่วม</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/profile/${listing.seller?.user?.username ?? ""}`}
                className="flex-1 h-9 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                ดูโปรไฟล์
              </Link>
              <button className="flex-1 h-9 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
                แชท
              </button>
            </div>
          </div>

          {/* Report */}
          <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            รายงานรายการนี้
          </button>
        </div>
      </div>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">รายการที่คล้ายกัน</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarListings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative w-full max-w-md aspect-[5/7]">
            <Image src={imageUrl} alt="" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
