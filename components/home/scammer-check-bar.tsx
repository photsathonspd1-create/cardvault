"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Search, Database, TrendingUp, CheckCircle2 } from "lucide-react"

export function ScammerCheckBar({ scammerCount = 0 }: { scammerCount?: number }) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  return (
    <section className="w-full py-4 px-4 sm:px-6">
      <div
        className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(24,24,27,0.92) 0%, rgba(39,39,42,0.85) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(245,158,11,0.08)",
        }}
      >
        {/* ── Ambient glow layer ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {/* Purple glow — left */}
          <div
            className="absolute"
            style={{
              width: 350,
              height: 350,
              left: "-5%",
              top: "-30%",
              background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Amber glow — right */}
          <div
            className="absolute"
            style={{
              width: 400,
              height: 400,
              right: "-5%",
              bottom: "-30%",
              background: "radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            {/* Left — Shield + Title + Search */}
            <div className="flex-1 w-full">
              {/* Shield icon + Title row */}
              <div className="flex items-start gap-5 mb-6">
                {/* Shield icon with ambient glow */}
                <div className="relative shrink-0 mt-1">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
                      filter: "blur(16px)",
                      transform: "scale(1.8)",
                    }}
                  />
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)",
                      border: "1px solid rgba(245,158,11,0.15)",
                    }}
                  >
                    <Shield className="w-7 h-7 text-amber-400" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Title + Subtitle */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    ตรวจสอบประวัติผู้ขายก่อนซื้อ
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2 max-w-lg leading-relaxed">
                    ฐานข้อมูลตรวจสอบมิจฉาชีพ TCG ไทย
                    <span className="text-zinc-600 mx-1.5">—</span>
                    ช่วยลดความเสี่ยงก่อนโอนเงินจริง
                  </p>
                </div>
              </div>

              {/* Search bar */}
              <div
                className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: focused
                    ? "1px solid rgba(245,158,11,0.3)"
                    : "1px solid rgba(63,63,70,0.6)",
                  boxShadow: focused
                    ? "0 0 0 3px rgba(245,158,11,0.06), 0 4px 24px rgba(0,0,0,0.3)"
                    : "inset 0 1px 2px rgba(0,0,0,0.3), 0 2px 12px rgba(0,0,0,0.2)",
                }}
              >
                <Search
                  className="absolute left-5 w-5 h-5 text-zinc-500 pointer-events-none"
                  strokeWidth={1.8}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="ค้นหาชื่อ LINE / Facebook / เบอร์โทร..."
                  className="flex-1 h-14 pl-14 pr-4 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none font-medium"
                />
                <Link
                  href={`/check?q=${encodeURIComponent(query)}`}
                  className="group flex items-center gap-2 h-10 mr-2 px-7 rounded-xl font-bold text-sm text-black transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    boxShadow: "0 2px 12px rgba(245,158,11,0.25)",
                  }}
                >
                  <Search className="w-4 h-4" strokeWidth={2.2} />
                  ตรวจสอบ
                </Link>
              </div>
            </div>

            {/* Right — Trust stats */}
            <div className="flex flex-row lg:flex-col gap-3 lg:gap-2.5 shrink-0">
              <TrustPill
                icon={<Database className="w-3.5 h-3.5" />}
                value={`${scammerCount.toLocaleString()}+`}
                label="รายชื่อในระบบ"
              />
              <TrustPill
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                value="อัพเดทวันนี้"
                label="ข้อมูลล่าสุด"
                color="green"
              />
              <TrustPill
                icon={<TrendingUp className="w-3.5 h-3.5" />}
                value="98.7%"
                label="ตรวจพบก่อนโดนโกง"
                color="green"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustPill({
  icon,
  value,
  label,
  color = "amber",
}: {
  icon: React.ReactNode
  value: string
  label: string
  color?: "amber" | "green"
}) {
  const accentColor = color === "green" ? "rgba(74,222,128," : "rgba(245,158,11,"

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, ${accentColor}0.06) 0%, ${accentColor}0.02) 100%)`,
        border: `1px solid ${accentColor}0.1)`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `${accentColor}0.1)`,
          color: color === "green" ? "#4ade80" : "#f59e0b",
        }}
      >
        {icon}
      </div>
      <div className="whitespace-nowrap">
        <div className="text-sm font-bold text-white leading-tight">{value}</div>
        <div className="text-[11px] text-zinc-500 leading-tight">{label}</div>
      </div>
    </div>
  )
}
