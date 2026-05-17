
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import { Search, ArrowRight, ShieldCheck, Sparkles, RotateCcw } from "lucide-react"
import { HeroCards } from "@/components/home/hero-cards"
import { StatsCounter } from "@/components/home/stats-counter"
import { ScammerCheckBar } from "@/components/home/scammer-check-bar"
import { CategorySection } from "@/components/home/category-section"
import { HotThisWeek } from "@/components/home/hot-this-week"
import { VerifiedSellerSpotlight } from "@/components/home/verified-seller-spotlight"
import { ListingCard } from "@/components/listing/listing-card"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const recentListings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: { include: { user: { select: { name: true, username: true } } } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  })

  const totalListings = await prisma.listing.count({ where: { status: "ACTIVE" } })
  const totalUsers = await prisma.user.count()
  const totalOrders = await prisma.order.count({ where: { status: "COMPLETED" } })

  // Category counts
  const categoryCountsRaw = await prisma.cardCatalog.groupBy({
    by: ["series"],
    _count: { id: true },
  })
  const categoryCounts = { POKEMON: 0, YUGIOH: 0, MTG: 0, ONE_PIECE: 0 }
  for (const row of categoryCountsRaw) {
    if (row.series in categoryCounts) {
      ;(categoryCounts as Record<string, number>)[row.series] = row._count.id
    }
  }

  // Scammer report count
  let scammerCount = 0
  try {
    scammerCount = await (prisma as any).scammerReport.count()
  } catch { scammerCount = 0 }

  return (
    <div className="bg-zinc-950">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden hero-gradient">
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* LEFT — Text */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <Badge className="text-xs px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full w-fit">
                🇹🇭 Marketplace การ์ด TCG อันดับ 1 ของไทย
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                <span className="text-gradient">ซื้อ-ขายการ์ด TCG</span>
                <br />
                <span className="text-white">ปลอดภัย ไว้ใจได้</span>
              </h1>

              <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0">
                ระบบ Escrow คุ้มครองทุกธุรกรรม
              </p>

              {/* Search Bar */}
              <form
                action="/browse"
                method="get"
                className="flex max-w-xl mx-auto lg:mx-0"
                onSubmit={(e) => {
                  const input = e.currentTarget.querySelector("input[name=q]") as HTMLInputElement
                  if (!input?.value.trim()) e.preventDefault()
                }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    name="q"
                    type="text"
                    placeholder="ค้นหาการ์ด, ซีรีส์, ผู้ขาย..."
                    className="w-full h-[52px] pl-12 pr-4 bg-zinc-800 border border-zinc-700 rounded-l-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="h-[52px] px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-r-xl transition-colors"
                >
                  ค้นหา
                </button>
              </form>

              {/* Trending Pills */}
              <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                <span className="text-xs text-zinc-500">กำลังค้นหา:</span>
                {["Charizard VMAX", "Blue-Eyes", "Luffy", "Mewtwo", "Pikachu V"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/browse?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: "🔒", label: "Escrow", desc: "คุ้มครองทุกการซื้อขาย" },
                  { icon: "✅", label: "Verified Seller", desc: "ผู้ขายยืนยันตัวตน" },
                  { icon: "🔄", label: "คืนเงิน 7 วัน", desc: "หากไม่ได้รับการ์ด" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-xl text-xs"
                  >
                    <span>{badge.icon}</span>
                    <div>
                      <span className="text-white font-medium">{badge.label}</span>
                      <span className="text-zinc-500 ml-1 hidden sm:inline">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4 max-w-md mx-auto lg:mx-0">
                <StatsCounter
                  end={totalListings}
                  suffix="+"
                  label="รายการการ์ด"
                  icon={<Sparkles className="w-5 h-5" />}
                />
                <StatsCounter
                  end={totalUsers}
                  suffix="+"
                  label="สมาชิกทั้งหมด"
                  icon={<ShieldCheck className="w-5 h-5" />}
                />
                <StatsCounter
                  end={totalOrders > 0 ? Math.min(99, Math.round((totalOrders / Math.max(totalOrders, 1)) * 100)) : 0}
                  suffix="%"
                  label="Dispute Resolved"
                  icon={<RotateCcw className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* RIGHT — Floating Cards */}
            <div className="flex-1 w-full max-w-lg">
              <HeroCards />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCAMMER CHECK BAR ===== */}
      <ScammerCheckBar scammerCount={scammerCount} />

      {/* ===== CATEGORY SECTION ===== */}
      <CategorySection categoryCounts={categoryCounts} />

      {/* ===== LISTINGS + HOT SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT — Recent Listings */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-xl font-bold text-white">ลงขายล่าสุด</h2>
                <p className="text-xs text-zinc-400">รายการใหม่จาก Verified Sellers</p>
              </div>
              <Link href="/browse" className="ml-auto text-sm text-amber-400 hover:text-amber-300 transition-colors">
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentListings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </div>

          {/* RIGHT — Hot This Week */}
          <div className="w-full lg:w-80 shrink-0">
            <HotThisWeek />
          </div>
        </div>
      </section>

      {/* ===== VERIFIED SELLER SPOTLIGHT ===== */}
      <VerifiedSellerSpotlight />

      {/* ===== STATS FOOTER BAR ===== */}
      <section className="w-full bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatsCounter
              end={totalListings}
              suffix="+"
              label="การ์ดทั้งหมดในระบบ"
              icon={<span className="text-xl">🃏</span>}
            />
            <StatsCounter
              end={totalOrders}
              suffix="+"
              label="ซื้อขายสำเร็จ"
              icon={<span className="text-xl">✅</span>}
            />
            <StatsCounter
              end={totalUsers}
              suffix="+"
              label="สมาชิกไว้วางใจ"
              icon={<span className="text-xl">👥</span>}
            />
            <StatsCounter
              end={totalListings}
              suffix="+"
              label="รายการขาย"
              icon={<span className="text-xl">💰</span>}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
