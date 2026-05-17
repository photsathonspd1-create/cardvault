"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn, getRelativeTime } from "@/lib/utils"
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface ScammerCheckClientProps {
  recentReports: {
    id: string
    scammerName: string
    scamMethod: string | null
    reportCount: number
    createdAt: Date
  }[]
  totalReports: number
}

export function ScammerCheckClient({ recentReports, totalReports }: ScammerCheckClientProps) {
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState(false)
  const [found, setFound] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) return
    setSearched(true)
    const q = query.toLowerCase()
    const match = recentReports.some(
      (r) =>
        r.scammerName.toLowerCase().includes(q) ||
        (r.scamMethod?.toLowerCase().includes(q) ?? false)
    )
    setFound(match)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="bg-red-950/20 border-b border-red-900/30 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">ตรวจสอบมิจฉาชีพ TCG</h1>
            <p className="text-zinc-400 max-w-md mx-auto">
              ฐานข้อมูลผู้โกงในวงการการ์ดไทย อัพเดทโดยชุมชน
            </p>

            {/* Search Bar */}
            <div className="flex max-w-xl mx-auto mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSearched(false)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="ชื่อ LINE ID / Facebook URL / เบอร์โทร / ชื่อจริง"
                  className="w-full h-[52px] pl-12 pr-4 bg-zinc-900 border border-zinc-700 rounded-l-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
                />
              </div>
              <button
                onClick={handleSearch}
                className="h-[52px] px-6 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-r-xl transition-colors"
              >
                ตรวจสอบ
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm">
              <span className="text-zinc-400">
                <span className="text-white font-bold">{totalReports.toLocaleString()}</span> รายชื่อ
              </span>
              <span className="text-green-400 text-xs">อัพเดทวันนี้ ✅</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Result */}
      {searched && (
        <section className="max-w-3xl mx-auto px-4 py-8">
          {found ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/30 border border-red-500/50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h2 className="text-lg font-bold text-red-400">⚠️ พบในฐานข้อมูล — ระวัง!</h2>
              </div>
              <p className="text-sm text-zinc-400">
                พบ &quot;{query}&quot; ในฐานข้อมูลมิจฉาชีพ ตรวจสอบรายละเอียดก่อนทำธุรกรรม
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-950/30 border border-green-500/50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h2 className="text-lg font-bold text-green-400">✅ ไม่พบในฐานข้อมูล</h2>
              </div>
              <p className="text-sm text-zinc-400">
                ไม่พบ &quot;{query}&quot; ในระบบ — แต่ควรระวังเสมอ ตรวจสอบผู้ขายก่อนโอนเงินทุกครั้ง
              </p>
            </motion.div>
          )}
        </section>
      )}

      {/* Report Form Toggle */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          {showReportForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          รายงานมิจฉาชีพ
        </button>

        {showReportForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อ / LINE ID / Facebook</label>
              <input
                type="text"
                placeholder="ข้อมูลผู้โกง"
                className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">รายละเอียด</label>
              <textarea
                placeholder="อธิบายวิธีการโกง..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
            <button className="px-6 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-400 transition-colors">
              ส่งรายงาน
            </button>
          </motion.div>
        )}
      </section>

      {/* Recent Reports */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-bold text-white mb-4">รายงานล่าสุด</h2>
        {recentReports.length > 0 ? (
          <div className="space-y-3">
            {recentReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-4"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{report.scammerName}</p>
                  {report.scamMethod && (
                    <p className="text-xs text-zinc-500">{report.scamMethod}</p>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">{getRelativeTime(report.createdAt)}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Shield className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">ยังไม่มีรายงาน — ชุมชนยังปลอดภัย 🎉</p>
          </div>
        )}
      </section>
    </div>
  )
}
