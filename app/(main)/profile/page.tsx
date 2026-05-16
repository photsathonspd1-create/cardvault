import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatPrice, getRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { User, ShoppingBag, Star, Shield, Settings, Edit } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()
  const userId = (session!.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sellerProfile: {
        include: {
          _count: { select: { listings: true } },
        },
      },
      _count: {
        select: {
          buyerOrders: true,
          reviewsGiven: true,
          reviewsReceived: true,
        },
      },
    },
  })

  if (!user) return null

  return (
    <div className="container px-4 py-8 max-w-2xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === "ADMIN" ? "purple" : "secondary"}>
                  {user.role}
                </Badge>
                {user.sellerProfile?.isKycVerified && (
                  <Badge variant="success">✓ Verified</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  สมาชิกตั้งแต่ {getRelativeTime(user.createdAt)}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Edit className="h-4 w-4 mr-1" />
                แก้ไข
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{user._count.buyerOrders}</p>
            <p className="text-xs text-muted-foreground">ออเดอร์ซื้อ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-bold">{user._count.reviewsReceived}</p>
            <p className="text-xs text-muted-foreground">รีวิวที่ได้รับ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {user.sellerProfile?._count.listings ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">รายการขาย</p>
          </CardContent>
        </Card>
      </div>

      {/* Seller Profile */}
      {user.sellerProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">โปรไฟล์ผู้ขาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ระดับ</span>
              <Badge variant="gold">{user.sellerProfile.tier}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ยอดขายรวม</span>
              <span className="font-medium text-gold">
                {formatPrice(user.sellerProfile.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ออเดอร์สำเร็จ</span>
              <span>{user.sellerProfile.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">คะแนน</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {user.sellerProfile.rating.toFixed(1)} ({user.sellerProfile.ratingCount})
              </span>
            </div>
            {user.sellerProfile.bio && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">เกี่ยวกับ</p>
                <p className="text-sm">{user.sellerProfile.bio}</p>
              </div>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/sell">
                <Settings className="h-4 w-4 mr-1" />
                จัดการร้านค้า
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" asChild>
          <Link href="/orders">ดูออเดอร์</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/sell/listings">รายการขาย</Link>
        </Button>
      </div>
    </div>
  )
}
