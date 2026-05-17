"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Search } from "lucide-react"

export function ScammerCheckBar() {
  const [query, setQuery] = useState("")

  return (
    <section className="w-full bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8">
          {/* Left */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold text-white">
                ตรวจสอบประวัติผู้ขายก่อนซื้อ
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              ฐานข้อมูลมิจฉาชีพ TCG ไทย —{" "}
              <Link href="/check" className="text-amber-400 hover:underline">
                ฐานข้อมูลมิจฉาชีพ TCG ไทย
              </Link>
            </p>
            <div className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาชื่อ LINE / Facebook / เบอร์โทร..."
                className="flex-1 h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-l-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
              <Link
                href={`/check?q=${encodeURIComponent(query)}`}
                className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-r-lg flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                ตรวจสอบ
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-amber-400">12,450</div>
            <div className="text-xs text-zinc-400">รายชื่อในระบบ</div>
            <div className="text-[10px] text-green-400 mt-0.5">อัพเดทล่าสุดวันนี้ ✅</div>
          </div>
        </div>
      </div>
    </section>
  )
}
