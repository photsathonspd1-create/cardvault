"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const MOCK_RECENT_REPORTS = [
  { name: "card_scammer_01", method: "ไม่ส่งของ", reports: 15, lastReported: "2 วันที่แล้ว" },
  { name: "fakepokemon_th", method: "การ์ดปลอม", reports: 8, lastReported: "5 วันที่แล้ว" },
  { name: "LineID: cheap_ygo", method: "โอนแล้วบล็อก", reports: 23, lastReported: "1 สัปดาห์ที่แล้ว" },
  { name: "fb.com/fakeseller", method: "ส่งของผิด", reports: 6, lastReported: "2 สัปดาห์ที่แล้ว" },
]

export default function ScammerCheckPage() {
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState(false)
  const [found, setFound] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) return
    setSearched(true)
    setFound(query.toLowerCase().includes("scam") || query.toLowerCase().includes("fake"))
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="bg-red-950/20 border-b border-red-900/30 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            ตรวจสอบมิจฉาชีพ TCG
          </h1>
          <p className="text-sm text-zinc-400 mb-8">
            ฐานข้อมูลผู้โกงในวงการการ์ดไทย อัพเดทโดยชุมชน
          </p>

          {/* Search Bar */}
          <div className="flex max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ชื่อ LINE ID / Facebook URL / เบอร์โทร / ชื่อจริง"
              className="flex-1 h-12 px-4 bg-zinc-900 border border-zinc-700 rounded-l-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
            />
            <button
              onClick={handleSearch}
              className="h-12 px-6 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-r-xl transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              ตรวจสอบ
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">12,450</p>
              <p className="text-[10px] text-zinc-500">รายชื่อ</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">3,240</p>
              <p className="text-[10px] text-zinc-500">รายงาน</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">วันนี้</p>
              <p className="text-[10px] text-zinc-500">อัพเดทล่าสุด</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Search Results */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {found ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h2 className="text-lg font-bold text-red-400">⚠️ พบในฐานข้อมูล — ระวัง!</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">ชื่อ/LINE:</span>
                    <span className="text-white font-medium">{query}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">จำนวนรายงาน:</span>
                    <span className="text-red-400 font-bold">15 ครั้ง</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">รายงานล่าสุด:</span>
                    <span className="text-white">2 วันที่แล้ว</span>
                  </div>
                  <div className="pt-3 border-t border-red-500/20">
                    <p className="text-sm text-zinc-300 mb-2">วิธีโกง: ไม่ส่งของหลังรับเงิน</p>
                    <p className="text-xs text-zinc-500">ผู้เสียหายรายงานว่ารับเงินแล้วบล็อกทันที</p>
                  </div>
                </div>
                <button className="mt-4 text-sm text-red-400 hover:text-red-300 underline">
                  รายงานเพิ่มเติม
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h2 className="text-lg font-bold text-green-400">✅ ไม่พบในฐานข้อมูล</h2>
                </div>
                <p className="text-sm text-zinc-400">
                  ไม่พบบุคคลนี้ในระบบ — แต่ควรระวังเสมอ ตรวจสอบให้ดีก่อนโอนเงิน
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Report Form */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-bold text-white">รายงานมิจฉาชีพ</span>
            </div>
            {showReportForm ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>

          {showReportForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="px-4 pb-4 space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อ / LINE / Facebook ของมิจฉาชีพ *</label>
                <input
                  type="text"
                  placeholder="เช่น LineID: scammer123"
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">รายละเอียด *</label>
                <textarea
                  placeholder="อธิบายวิธีการโกง จำนวนเงิน ฯลฯ"
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">หลักฐาน</label>
                <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-red-500/30 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">อัปโหลดรูปภาพ / screenshot</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อผู้รายงาน (optional)</label>
                <input
                  type="text"
                  placeholder="ไม่บังคับ"
                  className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
                />
              </div>
              <button className="w-full h-12 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-xl transition-colors">
                ส่งรายงาน
              </button>
            </motion.div>
          )}
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">รายงานล่าสุด</h2>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 border-b border-zinc-800">
              <span>ชื่อ</span>
              <span>วิธีโกง</span>
              <span>รายงาน</span>
              <span>วันที่</span>
            </div>
            {MOCK_RECENT_REPORTS.map((report, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-4 px-4 py-3 text-sm border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors"
              >
                <span className="text-white font-medium truncate">{report.name}</span>
                <span className="text-zinc-400 truncate">{report.method}</span>
                <span className="text-red-400 font-bold">{report.reports}</span>
                <span className="text-zinc-500 text-xs">{report.lastReported}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
