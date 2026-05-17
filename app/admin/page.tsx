"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
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

const MOCK_METRICS = [
  { label: "GMV วันนี้", value: "฿125,400", icon: DollarSign, color: "text-amber-400" },
  { label: "GMV เดือนนี้", value: "฿2.1M", icon: TrendingUp, color: "text-green-400" },
  { label: "Orders pending", value: "8", icon: Clock, color: "text-orange-400" },
  { label: "Disputes open", value: "3", icon: AlertTriangle, color: "text-red-400" },
  { label: "New sellers", value: "12", icon: Users, color: "text-blue-400" },
  { label: "Listings queue", value: "15", icon: Package, color: "text-purple-400" },
]

const MOCK_LISTINGS_QUEUE = [
  { name: "Pikachu VMAX", seller: "User123", tier: "Gold", price: "฿15,300", submitted: "2 ชม. ที่แล้ว" },
  { name: "Dark Magician", seller: "YGOShop", tier: "Silver", price: "฿8,900", submitted: "4 ชม. ที่แล้ว" },
  { name: "Luffy Leader", seller: "OPCard", tier: "Bronze", price: "฿12,500", submitted: "6 ชม. ที่แล้ว" },
]

const MOCK_DISPUTES = [
  { order: "ORD-005", card: "Charizard VMAX", amount: "฿28,900", reason: "FAKE_CARD", hours: 12, deadline: "36 ชม." },
  { order: "ORD-008", card: "Blue-Eyes", amount: "฿12,000", reason: "NOT_AS_DESCRIBED", hours: 48, deadline: "24 ชม." },
]

const REASON_COLORS: Record<string, { bg: string; text: string }> = {
  FAKE_CARD: { bg: "bg-red-500/20", text: "text-red-400" },
  NOT_AS_DESCRIBED: { bg: "bg-orange-500/20", text: "text-orange-400" },
  NOT_RECEIVED: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-sm font-bold text-white">AdminVault</span>
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
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_METRICS.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.label} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                    <Icon className={cn("w-5 h-5 mb-2", m.color)} />
                    <p className="text-xl font-bold text-white">{m.value}</p>
                    <p className="text-xs text-zinc-400 mt-1">{m.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Alerts */}
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">⚠️ 3 disputes รอพิจารณา (เกิน 48h)</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-400">📋 15 listings รอ approve</p>
              </div>
            </div>
          </div>
        )}

        {/* Listings Queue */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Listings Queue</h1>

            <div className="flex gap-2">
              {["PENDING_REVIEW", "All"].map((f, i) => (
                <button
                  key={f}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    i === 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {MOCK_LISTINGS_QUEUE.map((l, i) => (
                <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-4">
                  <div className="w-12 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">🃏</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{l.name}</p>
                    <p className="text-xs text-zinc-500">{l.seller} · {l.tier} · {l.submitted}</p>
                  </div>
                  <p className="text-sm font-bold text-amber-400">{l.price}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/30 transition-colors">
                      ✓ Approve
                    </button>
                    <button className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disputes */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Disputes</h1>

            <div className="space-y-3">
              {MOCK_DISPUTES.map((d, i) => {
                const reason = REASON_COLORS[d.reason] ?? REASON_COLORS.FAKE_CARD
                return (
                  <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-zinc-500">#{d.order}</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", reason.bg, reason.text)}>
                        {d.reason.replace(/_/g, " ")}
                      </span>
                      <span className="ml-auto text-xs text-zinc-500">เกิน {d.hours}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{d.card}</p>
                        <p className="text-sm text-amber-400">{d.amount}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-zinc-400">Deadline</p>
                          <p className="text-xs font-bold text-red-400">{d.deadline}</p>
                        </div>
                        <button className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/30 transition-colors">
                          พิจารณา
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 border-b border-zinc-800">
                <span>User</span>
                <span>Role</span>
                <span>Tier</span>
                <span>Sales</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {[
                { name: "CardMasterTH", role: "SELLER", tier: "Gold", sales: "1,250", joined: "ม.ค. 2023" },
                { name: "AdminUser", role: "ADMIN", tier: "—", sales: "—", joined: "ธ.ค. 2022" },
                { name: "NewUser123", role: "BUYER", tier: "—", sales: "—", joined: "พ.ค. 2024" },
              ].map((u, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3 text-sm border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <span className="text-white font-medium">{u.name}</span>
                  <span className="text-zinc-400">{u.role}</span>
                  <span className="text-zinc-400">{u.tier}</span>
                  <span className="text-zinc-400">{u.sales}</span>
                  <span className="text-zinc-500 text-xs">{u.joined}</span>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-zinc-400 hover:text-white" aria-label="ดู"><Eye className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scammer DB */}
        {activeTab === "scammer" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Scammer Database</h1>
            <p className="text-sm text-zinc-400">จัดการฐานข้อมูลมิจฉาชีพ TCG</p>
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
              <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">12,450 รายชื่อในระบบ</p>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Platform Fee (%)</label>
                <input type="number" defaultValue={5} className="w-32 h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Escrow Auto-release (days)</label>
                <input type="number" defaultValue={7} className="w-32 h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50" />
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
