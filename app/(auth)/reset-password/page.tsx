"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Shield, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">ลิงก์ไม่ถูกต้องหรือหมดอายุ</p>
          <Link href="/forgot-password" className="text-amber-400 hover:underline">
            ขอลิงก์ใหม่
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      return
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">เปลี่ยนรหัสผ่านสำเร็จ!</h1>
          <p className="text-zinc-400">กำลังนำไปหน้าเข้าสู่ระบบ...</p>
          <Link href="/login" className="text-amber-400 hover:underline text-sm">
            เข้าสู่ระบบเลย
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-white">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-sm text-zinc-400 mt-1">กรอกรหัสผ่านใหม่ของคุณ</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">รหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  required
                  minLength={8}
                  className="w-full h-11 px-4 pr-10 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
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
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                className="w-full h-11 px-4 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "เปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
