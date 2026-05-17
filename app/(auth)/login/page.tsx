"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen flex">
      {/* Left — Visual */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-amber-500/10" />
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-black" />
            </div>
            <span className="text-3xl font-bold text-white">CardVault</span>
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            ตลาดซื้อ-ขายการ์ด TCG ที่ใหญ่ที่สุดในประเทศไทย
          </p>
          <div className="space-y-4 text-left max-w-sm mx-auto">
            {[
              { icon: "🔒", text: "ระบบ Escrow คุ้มครองทุกธุรกรรม" },
              { icon: "✅", text: "ผู้ขายยืนยันตัวตนทุกราย" },
              { icon: "🔄", text: "คืนเงิน 7 วัน หากไม่ได้รับการ์ด" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 px-4 py-3 bg-zinc-800/50 rounded-xl">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-zinc-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold text-white">CardVault</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">ยินดีต้อนรับกลับมา</h1>
          <p className="text-sm text-zinc-400 mb-8">เข้าสู่ระบบเพื่อซื้อ-ขายการ์ด TCG</p>

          {/* LINE Login */}
          <button className="w-full h-12 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mb-6">
            <span className="text-lg">💬</span>
            เข้าสู่ระบบด้วย LINE
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-500">— หรือ —</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300">รหัสผ่าน</label>
                <Link href="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-10 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-colors">
              เข้าสู่ระบบ
            </button>
          </div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium">
              สมัครสมาชิกฟรี →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
