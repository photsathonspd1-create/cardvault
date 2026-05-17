"use client"

import { useState } from "react"
import Link from "next/link"
import { cn, formatPrice, getRelativeTime } from "@/lib/utils"
import {
  BarChart3,
  Package,
  Scale,
  Users,
  Shield,
  Settings,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react"

const SIDEBAR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "listings", label: "Listings", icon: Package },
  { id: "disputes", label: "Disputes", icon: Scale },
  { id: "users", label: "Users", icon: Users },
  { id: "scammer", label: "Scammer DB", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
]

interface AdminDashboardClientProps {
  metrics: {
    gmvToday: number
    gmvMonth: number
    totalUsers: number
    totalListings: number
    pendingListings: number
    activeOrders: number
    openDisputes: number
    totalSellers: number
  }
  listingsQueue: {
    id: string
    name: string
    seller: string
    tier: string
    price: number
    createdAt: Date
  }[]
  disputes: {
    id: string
    orderId: string
    cardName: string
    amount: number
    reason: string
    createdAt: Date
  }[]
}

const TIER_STYLES: Record<string, { bg: string; label: string }> = {
  GOLD: { bg: "bg-amber-500", label: "Gold" },
  SILVER: { bg: "bg-zinc-400", label: "Silver" },
  BRONZE: { bg: "bg-orange-700", label: "Bronze" },
}

export function AdminDashboardClient({ metrics, listingsQueue, disputes }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-bold text-white">Admin Panel</span>
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
                    ? "bg-red-500/10 text-red-400 border-l-2 border-red-500"
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

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: "GMV วันนี้", value: formatPrice(metrics.gmvToday), icon: DollarSign, color: "text-amber-400" },
                { label: "GMV เดือนนี้", value: formatPrice(metrics.gmvMonth), icon: TrendingUp, color: "text-green-400" },
                { label: "Orders pending", value: String(metrics.activeOrders), icon: Clock, color: "text-orange-400" },
                { label: "Disputes open", value: String(metrics.openDisputes), icon: AlertTriangle, color: "text-red-400" },
                { label: "Total Sellers", value: String(metrics.totalSellers), icon: Users, color: "text-blue-400" },
                { label: "Listings queue", value: String(metrics.pendingListings), icon: Package, color: "text-purple-400" },
              ].map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.label} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                    <Icon className={cn("w-5 h-5 mb-2", m.color)} />
                    <p className="text-xl font-bold text-white">{m.value}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{m.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Listings Queue */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">📋 Listings รอ Approve ({metrics.pendingListings})</h2>
                <button onClick={() => setActiveTab("listings")} className="text-xs text-amber-400 hover:text-amber-300">
                  ดูทั้งหมด →
                </button>
              </div>
              {listingsQueue.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {listingsQueue.slice(0, 5).map((l) => {
                    const tier = TIER_STYLES[l.tier] ?? TIER_STYLES.BRONZE
                    return (
                      <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                        <div className="w-10 h-14 rounded-lg bg-zinc-800 flex items-center justify-center text-xs">🃏</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{l.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{l.seller}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", tier.bg, l.tier === "GOLD" ? "text-black" : "text-white")}>
                              {tier.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-amber-400">{formatPrice(l.price)}</p>
                        <span className="text-[10px] text-zinc-500">{getRelativeTime(l.createdAt)}</span>
                        <div className="flex gap-1">
                          <button className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500/50 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">ไม่มี listings รอ approve 🎉</p>
                </div>
              )}
            </div>

            {/* Disputes */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">⚖️ Disputes ({metrics.openDisputes})</h2>
                <button onClick={() => setActiveTab("disputes")} className="text-xs text-amber-400 hover:text-amber-300">
                  ดูทั้งหมด →
                </button>
              </div>
              {disputes.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {disputes.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{d.cardName}</p>
                        <p className="text-xs text-zinc-500">#{d.orderId.slice(0, 8)} · {d.reason}</p>
                      </div>
                      <p className="text-sm font-bold text-amber-400">{formatPrice(d.amount)}</p>
                      <span className="text-[10px] text-zinc-500">{getRelativeTime(d.createdAt)}</span>
                      <button className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg">
                        พิจารณา
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Scale className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">ไม่มี disputes ค้าง 🎉</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-white">{metrics.totalUsers}</p>
                <p className="text-xs text-zinc-500">Users ทั้งหมด</p>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-white">{metrics.totalListings}</p>
                <p className="text-xs text-zinc-500">Active Listings</p>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-white">{metrics.totalSellers}</p>
                <p className="text-xs text-zinc-500">Sellers</p>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-amber-400">{formatPrice(metrics.gmvMonth)}</p>
                <p className="text-xs text-zinc-500">GMV เดือนนี้</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Listings Queue</h1>
            <Link href="/admin/listings" className="text-sm text-amber-400 hover:text-amber-300">
              ดู listings ทั้งหมด →
            </Link>
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Disputes</h1>
            <Link href="/admin/disputes" className="text-sm text-amber-400 hover:text-amber-300">
              ดู disputes ทั้งหมด →
            </Link>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <Link href="/admin/users" className="text-sm text-amber-400 hover:text-amber-300">
              ดู users ทั้งหมด →
            </Link>
          </div>
        )}

        {activeTab === "scammer" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Scammer DB</h1>
            <Link href="/check" className="text-sm text-amber-400 hover:text-amber-300">
              ดู scammer database →
            </Link>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <p className="text-sm text-zinc-400">ตั้งค่าระบบ — เร็วๆ นี้</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
