"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import { Shield, Truck, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface CheckoutPageProps {
  params: { listingId: string }
}

interface CheckoutListing {
  id: string
  customName?: string | null
  price: number
  condition: string
  series: string
  isGraded?: boolean
  gradingCompany?: string | null
  gradeScore?: string | null
  images?: { url: string }[]
  seller?: { id?: string; user?: { name?: string | null } }
  shippingOptions?: { provider: string; price: number; name: string }[]
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [listing, setListing] = useState<CheckoutListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [paymentStep, setPaymentStep] = useState(false)
  const [paymentData, setPaymentData] = useState<{ authorizeUri?: string; qrCodeUrl?: string } | null>(null)
  const [orderId, setOrderId] = useState<string>("")

  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    shippingDistrict: "",
    shippingProvince: "",
    shippingPostcode: "",
    shippingProvider: "KERRY",
    paymentMethod: "card",
  })

  useEffect(() => {
    fetch(`/api/listings/${params.listingId}`)
      .then((res) => res.json())
      .then((data) => {
        setListing(data.listing)
        setLoading(false)
      })
      .catch(() => {
        setError("ไม่พบรายการนี้")
        setLoading(false)
      })
  }, [params.listingId])

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: params.listingId,
          quantity: 1,
          ...form,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/orders")
      }, 2000)
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-xl text-muted-foreground">ไม่พบรายการนี้</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">ชำระเงินสำเร็จ!</h1>
        <p className="text-muted-foreground">กำลังนำไปยังหน้าออเดอร์...</p>
      </div>
    )
  }

  // Calculate total early for payment step
  const shippingOpt = listing?.shippingOptions?.find(
    (s: { provider: string; price: number; name: string }) => s.provider === form.shippingProvider
  )
  const sub = listing?.price ?? 0
  const sFee = shippingOpt?.price ?? 0
  const totalAmount = sub + sFee

  // Payment step — show QR code or card form
  if (paymentStep && paymentData) {
    return (
      <div className="container px-4 py-8 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">ชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.paymentMethod === "promptpay" && paymentData.qrCodeUrl ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">สแกน QR Code เพื่อชำระเงิน</p>
                <div className="bg-white p-6 rounded-lg inline-block">
                  <div className="w-64 h-64 bg-muted flex items-center justify-center rounded">
                    <p className="text-xs text-muted-foreground text-center px-4">
                      QR Code<br/>
                      <span className="font-mono text-[10px] break-all">{paymentData.qrCodeUrl}</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  QR Code จะหมดอายุใน 30 นาที
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span className="text-sm">รอการชำระเงิน...</span>
                </div>
              </div>
            ) : paymentData.authorizeUri ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">กดปุ่มด้านล่างเพื่อกรอกข้อมูลบัตรเครดิต</p>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => window.open(paymentData.authorizeUri, "_blank")}
                >
                  กรอกข้อมูลบัตรเครดิต
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
                <p className="text-sm text-muted-foreground">กำลังเตรียมการชำระเงิน...</p>
              </div>
            )}

            <Separator />

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">ออเดอร์ #{orderId.slice(0, 8)}</p>
              <p className="text-lg font-bold text-gold">{formatPrice(totalAmount)}</p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPaymentStep(false)
                setPaymentData(null)
              }}
            >
              ยกเลิกและกลับไปแก้ไข
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shippingOption = listing.shippingOptions?.find(
    (s: { provider: string; price: number; name: string }) => s.provider === form.shippingProvider
  )
  const subtotal = listing.price
  const shippingFee = shippingOption?.price ?? 0
  const total = subtotal + shippingFee

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ชำระเงิน</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  ข้อมูลจัดส่ง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ชื่อ-นามสกุล *</Label>
                    <Input
                      value={form.shippingName}
                      onChange={(e) => updateForm("shippingName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>เบอร์โทร *</Label>
                    <Input
                      value={form.shippingPhone}
                      onChange={(e) => updateForm("shippingPhone", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ที่อยู่ *</Label>
                  <Textarea
                    value={form.shippingAddress}
                    onChange={(e) => updateForm("shippingAddress", e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>อำเภอ/เขต *</Label>
                    <Input
                      value={form.shippingDistrict}
                      onChange={(e) => updateForm("shippingDistrict", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>จังหวัด *</Label>
                    <Input
                      value={form.shippingProvince}
                      onChange={(e) => updateForm("shippingProvince", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>รหัสไปรษณีย์ *</Label>
                    <Input
                      value={form.shippingPostcode}
                      onChange={(e) => updateForm("shippingPostcode", e.target.value)}
                      required
                      maxLength={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative h-20 w-14 bg-muted rounded overflow-hidden shrink-0">
                    <Image
                      src={listing.images?.[0]?.url ?? "/placeholder-card.png"}
                      alt={listing.customName ?? "Card"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{listing.customName}</p>
                    <p className="text-xs text-muted-foreground">
                      {SERIES_LABELS[listing.series]} • {CONDITION_LABELS[listing.condition]}
                    </p>
                    {listing.isGraded && (
                      <Badge variant="gold" className="text-[10px] mt-1">
                        {listing.gradingCompany} {listing.gradeScore}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ราคาสินค้า</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>รวม</span>
                    <span className="text-gold">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Escrow Notice */}
                <div className="flex items-start gap-2 p-3 bg-purple-600/10 rounded-lg text-xs">
                  <Shield className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-400">ระบบ Escrow</p>
                    <p className="text-muted-foreground">
                      เงินจะถูกเก็บในระบบจนกว่าคุณจะยืนยันรับสินค้า
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    `ดำเนินการชำระเงิน ${formatPrice(total)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
