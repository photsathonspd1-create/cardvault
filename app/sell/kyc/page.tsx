"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"

type KycStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED"

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string; icon: React.ReactNode }> = {
  NONE: { label: "ยังไม่ยืนยัน", color: "bg-muted", icon: <Shield className="h-4 w-4" /> },
  PENDING: { label: "รอการตรวจสอบ", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> },
  APPROVED: { label: "ยืนยันแล้ว", color: "bg-green-500", icon: <CheckCircle className="h-4 w-4" /> },
  REJECTED: { label: "ถูกปฏิเสธ", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
}

export default function KycPage() {
  const [status, setStatus] = useState<KycStatus>("NONE")
  const [kycNote, setKycNote] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [idCardUrl, setIdCardUrl] = useState("")
  const [selfieUrl, setSelfieUrl] = useState("")

  const idCardRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchKycStatus()
  }, [])

  async function fetchKycStatus() {
    try {
      const res = await fetch("/api/users/me/kyc")
      if (res.ok) {
        const data = await res.json()
        setStatus(data.kycStatus ?? "NONE")
        setKycNote(data.kycNote ?? null)
        if (data.kycIdCardUrl) setIdCardUrl(data.kycIdCardUrl)
        if (data.kycSelfieUrl) setSelfieUrl(data.kycSelfieUrl)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(file: File, type: "idcard" | "selfie") {
    // Get presigned URL
    const res = await fetch("/api/upload/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ")
    }

    const { uploadUrl, publicUrl } = await res.json()

    // Upload to R2 (or mock)
    if (uploadUrl.startsWith("/api/upload/mock")) {
      // Mock upload — just use the URL
    } else {
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
    }

    if (type === "idcard") {
      setIdCardUrl(publicUrl)
      setIdCardPreview(URL.createObjectURL(file))
    } else {
      setSelfieUrl(publicUrl)
      setSelfiePreview(URL.createObjectURL(file))
    }
  }

  function handleIdCardChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file, "idcard")
  }

  function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file, "selfie")
  }

  async function handleSubmit() {
    if (!idCardUrl || !selfieUrl) {
      setError("กรุณาอัปโหลดบัตรประชาชนและรูปเซลฟี่")
      return
    }

    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/users/me/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycIdCardUrl: idCardUrl,
          kycSelfieUrl: selfieUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "เกิดข้อผิดพลาด")
        return
      }

      setStatus("PENDING")
      setSuccess("ส่งเอกสารยืนยันตัวตนเรียบร้อย กรุณารอการตรวจสอบ (1-3 วันทำการ)")
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  const config = STATUS_CONFIG[status]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ยืนยันตัวตน (KYC)</h1>
        <p className="text-muted-foreground mt-1">
          ยืนยันตัวตนเพื่อเพิ่มความน่าเชื่อถือและปลดล็อคระดับผู้ขายขั้นสูง
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Badge className={`${config.color} text-white px-3 py-1.5`}>
              {config.icon}
              <span className="ml-1.5">{config.label}</span>
            </Badge>
            {status === "PENDING" && (
              <p className="text-sm text-muted-foreground">
                เอกสารของคุณอยู่ระหว่างการตรวจสอบ โดยปกติใช้เวลา 1-3 วันทำการ
              </p>
            )}
            {status === "APPROVED" && (
              <p className="text-sm text-green-400">
                ✓ ยืนยันตัวตนเรียบร้อย คุณได้รับเครื่องหมาย Verified
              </p>
            )}
          </div>
          {status === "REJECTED" && kycNote && (
            <div className="mt-3 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                <strong>เหตุผล:</strong> {kycNote}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                กรุณาแก้ไขและส่งเอกสารใหม่
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Form (shown when NONE or REJECTED) */}
      {(status === "NONE" || status === "REJECTED") && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">เอกสารที่ต้องใช้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ID Card */}
              <div className="space-y-2">
                <Label>บัตรประชาชน</Label>
                <p className="text-xs text-muted-foreground">
                  ถ่ายรูปบัตรประชาชนด้านหน้าให้ชัดเจน ข้อมูลต้องอ่านออก
                </p>
                <input
                  ref={idCardRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIdCardChange}
                />
                {idCardPreview ? (
                  <div className="relative w-full max-w-sm aspect-[1.6/1] rounded-lg overflow-hidden border-2 border-green-500/50">
                    <img
                      src={idCardPreview}
                      alt="บัตรประชาชน"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setIdCardPreview(null)
                        setIdCardUrl("")
                      }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <XCircle className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => idCardRef.current?.click()}
                    className="w-full max-w-sm aspect-[1.6/1] border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">อัปโหลดบัตรประชาชน</span>
                  </button>
                )}
              </div>

              {/* Selfie */}
              <div className="space-y-2">
                <Label>รูปเซลฟี่พร้อมบัตร</Label>
                <p className="text-xs text-muted-foreground">
                  ถ่ายเซลฟี่พร้อมบัตรประชาชน โดยให้เห็นใบหน้าและบัตรชัดเจน
                </p>
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleSelfieChange}
                />
                {selfiePreview ? (
                  <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden border-2 border-green-500/50">
                    <img
                      src={selfiePreview}
                      alt="เซลฟี่"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setSelfiePreview(null)
                        setSelfieUrl("")
                      }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <XCircle className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => selfieRef.current?.click()}
                    className="w-full max-w-sm aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 transition-colors"
                  >
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">ถ่ายเซลฟี่</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <Button
            variant="purple"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || !idCardUrl || !selfieUrl}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                ส่งเอกสารยืนยันตัวตน
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )
}
