"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด")
        return
      }

      setSubmitted(true)
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับหน้าเข้าสู่ระบบ
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-white">ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว</h2>
              <p className="text-zinc-400">
                กรุณาตรวจสอบอีเมล <strong className="text-white">{email}</strong> เพื่อรีเซ็ตรหัสผ่าน
              </p>
              <p className="text-sm text-zinc-500">
                ไม่เห็นอีเมล? ตรวจสอบโฟลเดอร์ Spam
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 text-sm font-bold mt-4 transition-colors"
              >
                กลับหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">ลืมรหัสผ่าน?</h2>
                <p className="text-zinc-400 text-sm mt-1">
                  กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">อีเมล</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full h-11 px-4 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    "ส่งลิงก์รีเซ็ต"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
