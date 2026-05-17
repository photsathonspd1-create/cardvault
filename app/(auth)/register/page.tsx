"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const passwordStrength = () => {
    const p = form.password
    if (p.length === 0) return { level: 0, label: "", color: "" }
    if (p.length < 6) return { level: 1, label: "อ่อน", color: "bg-red-500" }
    if (p.length < 10 || !/[A-Z]/.test(p)) return { level: 2, label: "ปานกลาง", color: "bg-orange-500" }
    return { level: 3, label: "แข็งแรง", color: "bg-green-500" }
  }

  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.name || !form.username || !form.email || !form.password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง")
      return
    }
    if (form.password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }
    if (!acceptedTerms) {
      setError("กรุณายอมรับเงื่อนไขการใช้งาน")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด")
        return
      }

      // Auto login after register
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push("/login")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  const handleLineLogin = () => {
    signIn("line", { callbackUrl: "/" })
  }

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
            เริ่มต้นซื้อ-ขายการ์ด TCG วันนี้
          </p>
          <div className="space-y-4 text-left max-w-sm mx-auto">
            {[
              { icon: "🆓", text: "สมัครฟรี ไม่มีค่าใช้จ่าย" },
              { icon: "🛡️", text: "ระบบ Escrow คุ้มครองทุกธุรกรรม" },
              { icon: "📈", text: "เข้าถึงตลาดการ์ด TCG ทั่วไทย" },
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

          <h1 className="text-2xl font-bold text-white mb-2">สร้างบัญชีใหม่</h1>
          <p className="text-sm text-zinc-400 mb-8">สมัครสมาชิกฟรี เริ่มซื้อขายได้ทันที</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {/* LINE Login */}
          <button
            onClick={handleLineLogin}
            className="w-full h-12 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mb-6"
          >
            <span className="text-lg">💬</span>
            สมัครด้วย LINE
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-500">— หรือ —</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อ</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ชื่อที่ต้องการแสดง"
                required
                className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                placeholder="เช่น somchai_cards"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_]+"
                className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[10px] text-zinc-500 mt-1">a-z, 0-9, _ เท่านั้น</p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">อีเมล</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  required
                  minLength={8}
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
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((l) => (
                      <div
                        key={l}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          strength.level >= l ? strength.color : "bg-zinc-800"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500">{strength.label}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/20"
              />
              <span className="text-xs text-zinc-400">
                ยอมรับ{" "}
                <Link href="/terms" className="text-amber-400 hover:underline">เงื่อนไขการใช้งาน</Link>
                {" "}และ{" "}
                <Link href="/privacy" className="text-amber-400 hover:underline">นโยบายความเป็นส่วนตัว</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังสมัคร...
                </>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">
              เข้าสู่ระบบ →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
