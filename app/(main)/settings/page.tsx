"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { User, Store, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface UserData {
  id: string
  email: string
  name: string
  username: string
  avatar: string | null
  phone: string | null
  role: string
  sellerProfile: {
    id: string
    displayName: string
    bio: string | null
    tier: string
    isKycVerified: boolean
    kycStatus: string
  } | null
}

export default function SettingsClient() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Form fields
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState("")
  const [sellerDisplayName, setSellerDisplayName] = useState("")
  const [sellerBio, setSellerBio] = useState("")

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/login")
          return
        }
        const u = data.user
        setUser(u)
        setName(u.name ?? "")
        setUsername(u.username ?? "")
        setPhone(u.phone ?? "")
        setAvatar(u.avatar ?? "")
        if (u.sellerProfile) {
          setSellerDisplayName(u.sellerProfile.displayName ?? "")
          setSellerBio(u.sellerProfile.bio ?? "")
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: username.toLowerCase(),
          phone,
          avatar,
          sellerDisplayName: user?.sellerProfile ? sellerDisplayName : undefined,
          sellerBio: user?.sellerProfile ? sellerBio : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "เกิดข้อผิดพลาด" })
      } else {
        setMsg({ type: "ok", text: "บันทึกสำเร็จ!" })
        // Refresh user data
        const refreshed = await fetch("/api/users/me").then((r) => r.json())
        if (refreshed.user) setUser(refreshed.user)
      }
    } catch {
      setMsg({ type: "err", text: "เกิดข้อผิดพลาด กรุณาลองใหม่" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container px-4 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่าบัญชี</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูลส่วนตัวของคุณ</p>
      </div>

      {/* Message */}
      {msg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            msg.type === "ok"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {msg.type === "ok" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-500" />
            ข้อมูลส่วนตัว
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xl">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar">URL รูปโปรไฟล์</Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">ชื่อ</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  className="mt-1 pl-8"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" value={user.email} disabled className="mt-1 opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
          </div>

          <div>
            <Label htmlFor="phone">เบอร์โทร</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0xx-xxx-xxxx"
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={user.role === "ADMIN" ? "purple" : "secondary"}>{user.role}</Badge>
            {user.sellerProfile?.isKycVerified && <Badge variant="success">✓ Verified</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Seller Section */}
      {user.sellerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-500" />
              โปรไฟล์ผู้ขาย
              <Badge variant="gold" className="ml-auto">
                {user.sellerProfile.tier}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sellerDisplayName">ชื่อร้านค้า</Label>
              <Input
                id="sellerDisplayName"
                value={sellerDisplayName}
                onChange={(e) => setSellerDisplayName(e.target.value)}
                placeholder="ชื่อร้านค้าของคุณ"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sellerBio">คำอธิบายร้าน</Label>
              <Textarea
                id="sellerBio"
                value={sellerBio}
                onChange={(e) => setSellerBio(e.target.value)}
                placeholder="เล่าเกี่ยวกับร้านค้าของคุณ..."
                rows={4}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/profile")}>
          ยกเลิก
        </Button>
        <Button variant="purple" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              บันทึก
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
