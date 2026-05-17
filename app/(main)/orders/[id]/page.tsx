"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Shield,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  MessageCircle,
} from "lucide-react"

const TIMELINE_STEPS = [
  { label: "จ่ายแล้ว", done: true },
  { label: "รอส่ง", done: true, active: true },
  { label: "ระหว่างส่ง", done: false },
  { label: "รอยืนยัน", done: false },
  { label: "สำเร็จ", done: false },
]

const ORDER_LOG = [
  { time: "17 พ.ค. 2567 10:30", desc: "จ่ายเงินสำเร็จ — PromptPay", icon: "💳" },
  { time: "17 พ.ค. 2567 10:35", desc: "ผู้ขายยืนยันออเดอร์", icon: "✅" },
]

export default function OrderDetailPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-300">หน้าแรก</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/orders" className="hover:text-zinc-300">ออเดอร์</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">#ORD-001</span>
      </nav>

      {/* Status Timeline */}
      <div className="bg-zinc-900 rounded-2xl p-6 mb-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6 overflow-x-auto scrollbar-hide">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    step.done && !step.active ? "bg-green-500 text-white" :
                    step.active ? "bg-amber-500 text-black" :
                    "bg-zinc-800 text-zinc-500"
                  )}
                >
                  {step.done && !step.active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-[10px] whitespace-nowrap", step.active ? "text-amber-400 font-bold" : step.done ? "text-green-400" : "text-zinc-600")}>
                  {step.label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={cn("w-8 md:w-16 h-0.5 mx-1 mb-5", step.done ? "bg-green-500" : "bg-zinc-800")} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Highlight */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">รอผู้ขายจัดส่ง</p>
            <p className="text-xs text-zinc-400">ผู้ขายมีเวลา 48 ชั่วโมงในการส่งของ</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-amber-400">38:24:11</p>
            <p className="text-[10px] text-zinc-500">เหลือ</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left — Order Info */}
        <div className="flex-1 space-y-6">
          {/* Card Info */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex gap-4">
            <div className="w-20 h-28 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl shrink-0">🃏</div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500">Pokemon TCG</p>
              <h2 className="text-lg font-bold text-white">Charizard VMAX</h2>
              <p className="text-xs text-zinc-400">Shining Fates · SV107/SV122</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">NM</span>
                <span className="text-lg font-bold text-amber-400">฿28,900</span>
              </div>
            </div>
          </div>

          {/* Escrow Status */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-amber-500/30 flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">🔒 HOLDING</p>
              <p className="text-xs text-zinc-400">เงิน ฿28,900 ถูกเก็บไว้อย่างปลอดภัย</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-colors">
              ยืนยันรับของแล้ว
            </button>
            <button className="w-full h-10 text-sm text-red-400 hover:text-red-300 flex items-center justify-center gap-1 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              มีปัญหา? แจ้งข้อพิพาท
            </button>
          </div>
        </div>

        {/* Right — Seller + Timeline */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Seller Card */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-sm font-bold text-white border-2 border-amber-500">
                C
              </div>
              <div>
                <p className="text-sm font-bold text-white">CardMasterTH</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold">Gold</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div>
                <p className="text-xs font-bold text-white">1,250</p>
                <p className="text-[10px] text-zinc-500">รายการ</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white">99.8%</p>
                <p className="text-[10px] text-zinc-500">สำเร็จ</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400">4.9</p>
                <p className="text-[10px] text-zinc-500">rating</p>
              </div>
            </div>
            <button className="w-full h-9 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              แชทกับผู้ขาย
            </button>
          </div>

          {/* Order Timeline */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h3 className="text-sm font-bold text-white mb-3">Timeline</h3>
            <div className="space-y-3">
              {ORDER_LOG.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-sm">{log.icon}</span>
                  <div>
                    <p className="text-xs text-zinc-400">{log.time}</p>
                    <p className="text-sm text-white">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-release countdown */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-1">Escrow จะปล่อยอัตโนมัติใน</p>
            <p className="text-lg font-bold text-amber-400">5 วัน 12 ชั่วโมง</p>
          </div>
        </div>
      </div>
    </div>
  )
}
