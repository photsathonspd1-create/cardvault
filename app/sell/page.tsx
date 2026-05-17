"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  DollarSign,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react"

const SIDEBAR_NAV = [
  { id: "overview", label: "ภาพรวม", icon: BarChart3 },
  { id: "listings", label: "รายการขาย", icon: Package },
  { id: "orders", label: "ออเดอร์", icon: ShoppingCart },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "ตั้งค่า", icon: Settings },
]

const MOCK_METRICS = [
  { label: "ยอดขายเดือนนี้", value: "฿45,800", change: "+12%", icon: DollarSign, color: "text-amber-400" },
  { label: "รายได้สุทธิ", value: "฿43,510", change: "+8%", icon: TrendingUp, color: "text-green-400" },
  { label: "Active Listings", value: "24", change: "+3", icon: Package, color: "text-blue-400" },
  { label: "รอดำเนินการ", value: "3", change: "-2", icon: Clock, color: "text-orange-400" },
]

const MOCK_ORDERS = [
  { id: "ORD-001", card: "Charizard VMAX", price: "฿28,900", buyer: "User123", status: "รอส่ง" },
  { id: "ORD-002", card: "Pikachu V", price: "฿5,500", buyer: "PokemonFan", status: "ส่งแล้ว" },
  { id: "ORD-003", card: "Blue-Eyes", price: "฿12,000", buyer: "YGOPlayer", status: "สำเร็จ" },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "รอส่ง": { bg: "bg-amber-500/20", text: "text-amber-400" },
  "ส่งแล้ว": { bg: "bg-blue-500/20", text: "text-blue-400" },
  "สำเร็จ": { bg: "bg-green-500/20", text: "text-green-400" },
  "ปัญหา": { bg: "bg-red-500/20", text: "text-red-400" },
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

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
              U
            </div>
            <div>
              <p className="text-xs font-medium text-white">Username</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold">Gold</span>
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
        {/* Overview Tab */}
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
              {MOCK_METRICS.map((metric, i) => {
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
                      <span className="text-xs text-green-400">{metric.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-xs text-zinc-400 mt-1">{metric.label}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Tier Progress */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">Gold</span>
                <span className="text-sm text-zinc-400">→</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-600 text-zinc-300">Platinum</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-xs text-zinc-400 mt-2">อีก 35 sales ถึง Platinum tier</p>
            </div>

            {/* Recent Orders */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">ออเดอร์ล่าสุด</h2>
                <button onClick={() => setActiveTab("orders")} className="text-xs text-amber-400 hover:text-amber-300">
                  ดูทั้งหมด →
                </button>
              </div>
              <div className="divide-y divide-zinc-800">
                {MOCK_ORDERS.map((order) => {
                  const status = STATUS_COLORS[order.status] ?? STATUS_COLORS["รอส่ง"]
                  return (
                    <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                      <div className="w-10 h-14 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                        🃏
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{order.card}</p>
                        <p className="text-xs text-zinc-500">#{order.id} · {order.buyer}</p>
                      </div>
                      <p className="text-sm font-bold text-amber-400">{order.price}</p>
                      <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", status.bg, status.text)}>
                        {order.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">รายการขาย</h1>
              <Link
                href="/sell/new"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                ลงขายใหม่
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {["ทั้งหมด", "Active", "รอ Approve", "Paused", "ขายแล้ว"].map((tab, i) => (
                <button
                  key={tab}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    i === 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Empty State */}
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">ยังไม่มีรายการขาย</p>
              <Link
                href="/sell/new"
                className="inline-flex px-6 py-3 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
              >
                ลงขายการ์ดใบแรก
              </Link>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">ออเดอร์</h1>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {["ทั้งหมด", "รอส่ง", "ส่งแล้ว", "สำเร็จ", "มีปัญหา"].map((tab, i) => (
                <button
                  key={tab}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    i === 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {MOCK_ORDERS.map((order) => {
                const status = STATUS_COLORS[order.status] ?? STATUS_COLORS["รอส่ง"]
                return (
                  <div key={order.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-sm">🃏</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{order.card}</p>
                      <p className="text-xs text-zinc-500">#{order.id} · ผู้ซื้อ: {order.buyer}</p>
                    </div>
                    <p className="text-sm font-bold text-amber-400">{order.price}</p>
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", status.bg, status.text)}>
                      {order.status}
                    </span>
                    <button className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                      ดูรายละเอียด
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center">
              <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">Analytics จะพร้อมใช้งานเร็วๆ นี้</p>
              <p className="text-xs text-zinc-500">อัปเกรดเป็น PRO เพื่อเข้าถึงข้อมูลเชิงลึก</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">ตั้งค่า</h1>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อแสดง</label>
                <input
                  type="text"
                  defaultValue="Username"
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">ข้อมูลติดต่อ</label>
                <input
                  type="text"
                  placeholder="LINE ID / เบอร์โทร"
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
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
