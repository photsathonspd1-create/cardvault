import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, getRelativeTime } from "@/lib/utils"
import { Shield, Ban, CheckCircle, User } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      sellerProfile: {
        select: {
          tier: true,
          isKycVerified: true,
          totalSales: true,
          rating: true,
        },
      },
      _count: {
        select: {
          buyerOrders: true,
          sellerOrders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">จัดการผู้ใช้</h1>
        <p className="text-muted-foreground">{users.length} ผู้ใช้</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-400">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge variant={user.role === "ADMIN" ? "purple" : "secondary"} className="text-xs">
                      {user.role}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive" className="text-xs">ระงับ</Badge>
                    )}
                    {user.sellerProfile?.isKycVerified && (
                      <Badge variant="success" className="text-xs">KYC ✓</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{user.username} • {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    สมัคร {getRelativeTime(user.createdAt)} •
                    ออเดอร์ซื้อ: {user._count.buyerOrders} •
                    ออเดอร์ขาย: {user._count.sellerOrders}
                    {user.sellerProfile && (
                      <> • ระดับ: {user.sellerProfile.tier} • ขาย: {user.sellerProfile.totalSales} • ★ {user.sellerProfile.rating.toFixed(1)}</>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!user.isBanned ? (
                    <Button variant="destructive" size="sm">
                      <Ban className="h-4 w-4 mr-1" />
                      ระงับ
                    </Button>
                  ) : (
                    <Button variant="success" size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      ปลดระงับ
                    </Button>
                  )}
                  {user.role === "USER" && (
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      ตั้งเป็น Admin
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
