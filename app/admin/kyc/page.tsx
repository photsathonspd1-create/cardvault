export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getRelativeTime } from "@/lib/utils"
import { Shield, CheckCircle, XCircle, Clock, User } from "lucide-react"
import { revalidatePath } from "next/cache"

const KYC_STATUS_LABELS: Record<string, string> = {
  NONE: "ยังไม่ส่ง",
  PENDING: "รอตรวจสอบ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ปฏิเสธ",
}

const KYC_STATUS_COLORS: Record<string, string> = {
  NONE: "secondary",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

async function approveKyc(formData: FormData) {
  "use server"
  const sellerId = formData.get("sellerId") as string
  await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      kycStatus: "APPROVED",
      isKycVerified: true,
      kycReviewedAt: new Date(),
      tier: "SILVER",
    },
  })
  revalidatePath("/admin/kyc")
}

async function rejectKyc(formData: FormData) {
  "use server"
  const sellerId = formData.get("sellerId") as string
  const note = formData.get("note") as string
  await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      kycStatus: "REJECTED",
      isKycVerified: false,
      kycReviewedAt: new Date(),
      kycNote: note || "ไม่ผ่านการตรวจสอบ",
    },
  })
  revalidatePath("/admin/kyc")
}

export default async function AdminKycPage() {
  const pendingKyc = await prisma.sellerProfile.findMany({
    where: { kycStatus: "PENDING" },
    include: {
      user: { select: { id: true, name: true, email: true, username: true, avatar: true } },
    },
    orderBy: { kycSubmittedAt: "asc" },
  })

  const recentKyc = await prisma.sellerProfile.findMany({
    where: { kycStatus: { in: ["APPROVED", "REJECTED"] } },
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
    },
    orderBy: { kycReviewedAt: "desc" },
    take: 20,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ตรวจสอบ KYC</h1>
        <p className="text-muted-foreground">{pendingKyc.length} รายการรอตรวจสอบ</p>
      </div>

      {pendingKyc.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-lg font-medium">ไม่มีรายการรอตรวจสอบ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingKyc.map((seller) => (
            <Card key={seller.id} className="border-yellow-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{seller.user.name}</p>
                      <p className="text-xs text-muted-foreground">@{seller.user.username} • {seller.user.email}</p>
                    </div>
                  </CardTitle>
                  <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />รอตรวจสอบ</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">ชื่อร้าน:</span> <span className="font-medium">{seller.displayName}</span></div>
                  <div><span className="text-muted-foreground">Tier:</span> <Badge variant="gold" className="text-xs">{seller.tier}</Badge></div>
                  <div><span className="text-muted-foreground">ส่งเมื่อ:</span> {seller.kycSubmittedAt ? getRelativeTime(seller.kycSubmittedAt) : "-"}</div>
                  <div><span className="text-muted-foreground">ยอดขาย:</span> {seller.totalSales} ออเดอร์</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {seller.kycIdCardUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">บัตรประชาชน</p>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img src={seller.kycIdCardUrl} alt="ID Card" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                  {seller.kycSelfieUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Selfie กับบัตร</p>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img src={seller.kycSelfieUrl} alt="Selfie" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <form action={approveKyc}>
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />อนุมัติ
                    </Button>
                  </form>
                  <form action={rejectKyc} className="flex gap-2">
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <Textarea name="note" placeholder="เหตุผลที่ปฏิเสธ..." className="w-64 h-10 text-sm" />
                    <Button type="submit" variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />ปฏิเสธ
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recentKyc.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">ประวัติล่าสุด</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentKyc.map((seller) => (
                  <div key={seller.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{seller.user.name}</p>
                        <p className="text-xs text-muted-foreground">@{seller.user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={KYC_STATUS_COLORS[seller.kycStatus] as any}>{KYC_STATUS_LABELS[seller.kycStatus]}</Badge>
                      {seller.kycReviewedAt && <span className="text-xs text-muted-foreground">{getRelativeTime(seller.kycReviewedAt)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
