"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, User, AtSign, AlertCircle, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    if (form.password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      return
    }

    if (!form.agreeTerms) {
      setError("กรุณายอมรับข้อกำหนดการใช้งาน")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด")
        return
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">สมัครสมาชิก</CardTitle>
        <CardDescription className="text-center">
          สร้างบัญชี CardVault เพื่อเริ่มซื้อ-ขายการ์ด
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="ชื่อ นามสกุล"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="username"
                value={form.username}
                onChange={(e) => updateForm("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="pl-10"
                required
                disabled={loading}
                minLength={3}
                maxLength={20}
              />
            </div>
            <p className="text-xs text-muted-foreground">a-z, 0-9, _ เท่านั้น (3-20 ตัวอักษร)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
                minLength={8}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={form.confirmPassword}
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={form.agreeTerms}
              onCheckedChange={(checked) => updateForm("agreeTerms", checked)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              ฉันยอมรับ{" "}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                ข้อกำหนดการใช้งาน
              </Link>{" "}
              และ{" "}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                นโยบายความเป็นส่วนตัว
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="gold"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                สมัครสมาชิก
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center text-muted-foreground w-full">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
