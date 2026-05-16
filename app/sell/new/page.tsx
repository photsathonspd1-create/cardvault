"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  SERIES_LABELS,
  CONDITION_LABELS,
  LANGUAGE_LABELS,
} from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  ImagePlus,
  X,
  Loader2,
  CheckCircle,
  Search,
} from "lucide-react"

const STEPS = [
  { title: "ข้อมูลการ์ด", description: "เลือกการ์ดหรือกรอกข้อมูลเอง" },
  { title: "สภาพ & รายละเอียด", description: "สภาพการ์ดและข้อมูลเพิ่มเติม" },
  { title: "รูปภาพ", description: "อัปโหลดรูปการ์ด" },
  { title: "ราคา & จัดส่ง", description: "ตั้งราคาและตัวเลือกจัดส่ง" },
]

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    // Card info
    series: "",
    customName: "",
    customSet: "",
    cardNumber: "",
    rarity: "",
    // Condition
    condition: "",
    language: "THAI",
    isGraded: false,
    gradingCompany: "",
    gradeScore: "",
    gradeCertNo: "",
    // Description
    description: "",
    // Pricing
    price: "",
    originalPrice: "",
    isNegotiable: false,
    quantity: "1",
    // Shipping
    shippingProvider: "KERRY",
    shippingPrice: "40",
    shippingDays: "2-3 วัน",
    // Images
    images: [] as string[],
  })

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const progress = ((step + 1) / STEPS.length) * 100

  async function handleSubmit() {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series: form.series,
          customName: form.customName,
          customSet: form.customSet,
          cardNumber: form.cardNumber,
          rarity: form.rarity,
          condition: form.condition,
          language: form.language,
          isGraded: form.isGraded,
          gradingCompany: form.gradingCompany || null,
          gradeScore: form.gradeScore || null,
          gradeCertNo: form.gradeCertNo || null,
          description: form.description || null,
          price: Math.round(parseFloat(form.price) * 100),
          originalPrice: form.originalPrice ? Math.round(parseFloat(form.originalPrice) * 100) : null,
          isNegotiable: form.isNegotiable,
          quantity: parseInt(form.quantity),
          shippingOptions: [
            {
              provider: form.shippingProvider,
              name: form.shippingProvider,
              price: Math.round(parseFloat(form.shippingPrice) * 100),
              estimatedDays: form.shippingDays,
            },
          ],
          images: form.images,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? "เกิดข้อผิดพลาด")
        return
      }

      router.push("/sell/listings")
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return !!form.series && !!form.customName
      case 1:
        return !!form.condition
      case 2:
        return true // Images are optional
      case 3:
        return !!form.price && parseFloat(form.price) > 0
      default:
        return false
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ลงขายสินค้า</h1>
        <p className="text-muted-foreground">เพิ่มการ์ด TCG ของคุณเข้าสู่ระบบ</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {STEPS.map((s, i) => (
            <span
              key={i}
              className={i <= step ? "text-purple-400 font-medium" : "text-muted-foreground"}
            >
              {s.title}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>ซีรีส์ *</Label>
                <Select value={form.series} onValueChange={(v) => updateForm("series", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกซีรีส์" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERIES_LABELS)
                      .filter(([k]) => k !== "OTHER")
                      .map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    <SelectItem value="OTHER">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ชื่อการ์ด *</Label>
                <Input
                  placeholder="เช่น Charizard VMAX, Blue-Eyes White Dragon"
                  value={form.customName}
                  onChange={(e) => updateForm("customName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ชุด (Set)</Label>
                  <Input
                    placeholder="เช่น Scarlet & Violet"
                    value={form.customSet}
                    onChange={(e) => updateForm("customSet", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>เลขการ์ด</Label>
                  <Input
                    placeholder="เช่น 001/165"
                    value={form.cardNumber}
                    onChange={(e) => updateForm("cardNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ความหายาก (Rarity)</Label>
                <Input
                  placeholder="เช่น Ultra Rare, Secret Rare"
                  value={form.rarity}
                  onChange={(e) => updateForm("rarity", e.target.value)}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>สภาพการ์ด *</Label>
                <Select value={form.condition} onValueChange={(v) => updateForm("condition", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสภาพ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ภาษา</Label>
                <Select value={form.language} onValueChange={(v) => updateForm("language", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="graded"
                  checked={form.isGraded}
                  onCheckedChange={(checked) => updateForm("isGraded", checked)}
                />
                <label htmlFor="graded" className="text-sm">
                  การ์ดนี้ผ่านการ Grading แล้ว
                </label>
              </div>

              {form.isGraded && (
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label>บริษัท</Label>
                    <Select
                      value={form.gradingCompany}
                      onValueChange={(v) => updateForm("gradingCompany", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PSA">PSA</SelectItem>
                        <SelectItem value="BGS">BGS</SelectItem>
                        <SelectItem value="CGC">CGC</SelectItem>
                        <SelectItem value="ACE">ACE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>เกรด</Label>
                    <Input
                      placeholder="เช่น 10"
                      value={form.gradeScore}
                      onChange={(e) => updateForm("gradeScore", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cert No.</Label>
                    <Input
                      placeholder="เลข Certificate"
                      value={form.gradeCertNo}
                      onChange={(e) => updateForm("gradeCertNo", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>รายละเอียด</Label>
                <Textarea
                  placeholder="อธิบายสภาพการ์ด, ข้อมูลเพิ่มเติม..."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        const newImages = [...form.images]
                        newImages.splice(i, 1)
                        updateForm("images", newImages)
                      }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {form.images.length < 6 && (
                  <button
                    onClick={() => {
                      // Mock upload - in production, use presigned URL to S3/R2
                      const mockUrl = `https://via.placeholder.com/400x560/1a1a2e/7C3AED?text=Card+${form.images.length + 1}`
                      updateForm("images", [...form.images, mockUrl])
                    }}
                    className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 transition-colors"
                  >
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">เพิ่มรูป</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                อัปโหลดรูปภาพสูงสุด 6 รูป (ด้านหน้า, ด้านหลัง, ขอบ, มุม)
              </p>
            </div>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ราคา (บาท) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    min="1"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ราคาเดิม (ถ้ามี)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.originalPrice}
                    onChange={(e) => updateForm("originalPrice", e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>จำนวน</Label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => updateForm("quantity", e.target.value)}
                    min="1"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negotiable"
                      checked={form.isNegotiable}
                      onCheckedChange={(checked) => updateForm("isNegotiable", checked)}
                    />
                    <label htmlFor="negotiable" className="text-sm">
                      ต่อรองได้
                    </label>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium text-sm">ค่าจัดส่ง</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">ขนส่ง</Label>
                      <Select
                        value={form.shippingProvider}
                        onValueChange={(v) => updateForm("shippingProvider", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KERRY">Kerry Express</SelectItem>
                          <SelectItem value="FLASH">Flash Express</SelectItem>
                          <SelectItem value="THAILAND_POST">Thailand Post</SelectItem>
                          <SelectItem value="J&T">J&T Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">ค่าส่ง (บาท)</Label>
                      <Input
                        type="number"
                        value={form.shippingPrice}
                        onChange={(e) => updateForm("shippingPrice", e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">ระยะเวลา</Label>
                      <Input
                        value={form.shippingDays}
                        onChange={(e) => updateForm("shippingDays", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-purple-600/10 border border-purple-600/20 text-sm">
                <p className="font-medium text-purple-400 mb-1">ค่าธรรมเนียมแพลตฟอร์ม: 5%</p>
                <p className="text-muted-foreground">
                  คุณจะได้รับ{" "}
                  <span className="text-gold font-bold">
                    ฿
                    {form.price
                      ? (
                          (parseFloat(form.price) * 0.95).toFixed(2)
                        )
                      : "0.00"}
                  </span>{" "}
                  เมื่อขายได้
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ย้อนกลับ
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            variant="purple"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            ถัดไป
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="gold"
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังลงขาย...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                ลงขายสินค้า
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
