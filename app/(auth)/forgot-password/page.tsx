"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับหน้าเข้าสู่ระบบ
        </Link>

        <div className="border rounded-lg p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold">ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว</h2>
              <p className="text-muted-foreground">
                กรุณาตรวจสอบอีเมล <strong>{email}</strong> เพื่อรีเซ็ตรหัสผ่าน
              </p>
              <p className="text-sm text-muted-foreground">
                ไม่เห็นอีเมล? ตรวจสอบโฟลเดอร์ Spam
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 mt-4"
              >
                กลับหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                <h2 className="text-xl font-semibold">ลืมรหัสผ่าน?</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">อีเมล</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
