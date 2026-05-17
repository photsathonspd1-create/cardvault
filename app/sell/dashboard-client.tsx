"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn, formatPrice, getRelativeTime, ORDER_STATUS_LABELS } from "@/lib/utils"
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  Plus,
  DollarSign,
  Clock,
} from "lucide-react"

const SIDEBAR_NAV = [
  { id: "overview", label: "ภาพรวม", icon: BarChart3 },
  { id: "listings", label: "รายการขาย", icon: Package },
  { id: "orders", label: "ออเดอร์", icon: ShoppingCart },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "ตั้งค่า", icon: Settings },
]

const TIER_STYLES: Record<string, { bg: string; label: string }> = {
  GOLD: { bg: "bg-amber-500", label: "Gold" },
  SILVER: { bg: "bg-zinc-400", label: "Silver" },
  BRONZE: { bg: "bg-orange-700", label: "Bronze" },
}

interface SellerDashboardClientProps {
  seller: {
    name: string
    tier: string
    displayName: string | null
  }
  metrics: {
    monthlyRevenue: number
    totalRevenue: number
    activeListings: number
    pendingOrders: number
    completedOrders: number
    monthlySales: number
  }
  recentOrders: {
    id: string
    cardName: string
    price: number
    buyerName: string
    status: string
    createdAt: Date
  }[]
}

export function SellerDashboardClient({ seller, metrics, recentOrders }: SellerDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const tierStyle = TIER_STYLES[seller.tier] ?? TIER_STYLES.BRONZE

  const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PAID: { bg: "bg-amber-500/20", text: "text-amber-400" },
    SHIPPED: { bg: "bg-blue-500/20", text: "text-blue-400" },
    COMPLETED: { bg: "bg-green-500/20", text: "text-green-400" },
    DISPUTED: { bg: "bg-red-500/20", text: "text-red-400" },
    CANCELLED: { bg: "bg-zinc-500/20", text: "text-zinc-400" },
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💎</span>
            <span className="text-sm font-bold text-white">Seller Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white">
              {(seller.displayName ?? seller.name)[0]}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{seller.displayName ?? seller.name}</p>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", tierStyle.bg, seller.tier === "GOLD" ? "text-black" : "text-white")}>
                {tierStyle.label}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">ภาพรวม</h1>
              <Link
                href="/sell/new"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                ลงขายใหม่
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "ยอดขายเดือนนี้", value: formatPrice(metrics.monthlyRevenue), sub: `${metrics.monthlySales} รายการ`, icon: DollarSign, color: "text-amber-400" },
                { label: "รายได้สุทธิ", value: formatPrice(metrics.totalRevenue), sub: "รวมทั้งหมด", icon: TrendingUp, color: "text-green-400" },
                { label: "Active Listings", value: String(metrics.activeListings), sub: "รายการที่ลงขาย", icon: Package, color: "text-blue-400" },
                { label: "รอดำเนินการ", value: String(metrics.pendingOrders), sub: "ออเดอร์รอส่ง", icon: Clock, color: "text-orange-400" },
              ].map((metric, i) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={cn("w-5 h-5", metric.color)} />
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-xs text-zinc-400 mt-1">{metric.label}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{metric.sub}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Tier Progress */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold", tierStyle.bg, seller.tier === "GOLD" ? "text-black" : "text-white")}>
                  {tierStyle.label}
                </span>
                {seller.tier !== "GOLD" && (
                  <>
                    <span className="text-sm text-zinc-400">→</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-600 text-zinc-300">
                      {seller.tier === "BRONZE" ? "Silver" : "Gold"}
                    </span>
                  </>
                )}
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (metrics.completedOrders / 50) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                {seller.tier === "GOLD"
                  ? "คุณอยู่ใน Gold tier 🎉"
                  : `อีก ${Math.max(0, 50 - metrics.completedOrders)} sales ถึง ${seller.tier === "BRONZE" ? "Silver" : "Gold"} tier`}
              </p>
            </div>

            {/* Recent Orders */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">ออเดอร์ล่าสุด</h2>
                <button onClick={() => setActiveTab("orders")} className="text-xs text-amber-400 hover:text-amber-300">
                  ดูทั้งหมด →
                </button>
              </div>
              {recentOrders.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {recentOrders.slice(0, 5).map((order) => {
                    const status = ORDER_STATUS_COLORS[order.status] ?? ORDER_STATUS_COLORS.PAID
                    return (
                      <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                        <div className="w-10 h-14 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">🃏</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{order.cardName}</p>
                          <p className="text-xs text-zinc-500">#{order.id.slice(0, 8)} · {order.buyerName}</p>
                        </div>
                        <p className="text-sm font-bold text-amber-400">{formatPrice(order.price)}</p>
                        <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", status.bg, status.text)}>
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">ยังไม่มีออเดอร์</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">รายการขาย</h1>
              <Link href="/sell/new" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors">
                <Plus className="w-4 h-4" /> ลงขายใหม่
              </Link>
            </div>
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">{metrics.activeListings} รายการที่ลงขาย</p>
              <Link href="/sell/listings" className="text-sm text-amber-400 hover:text-amber-300">
                ดูรายการขายทั้งหมด →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">ออเดอร์</h1>
            <Link href="/sell/orders" className="text-sm text-amber-400 hover:text-amber-300">
              ดูออเดอร์ทั้งหมด →
            </Link>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <Link href="/sell/analytics" className="text-sm text-amber-400 hover:text-amber-300">
              ดู Analytics เต็ม →
            </Link>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">ตั้งค่า</h1>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อแสดง</label>
                <input
                  type="text"
                  defaultValue={seller.displayName ?? seller.name}
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button className="px-6 py-2.5 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors">
                บันทึก
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
