import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatPrice, SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"
import {
  Search,
  Shield,
  Truck,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react"

export const dynamic = "force-dynamic"

const SERIES_CARDS = [
  {
    series: "POKEMON",
    name: "Pokemon",
    image: "https://images.pokemontcg.io/swsh12/1_hires.png",
    color: "from-yellow-500 to-red-500",
    count: "2,500+",
  },
  {
    series: "YUGIOH",
    name: "Yu-Gi-Oh!",
    image: "https://images.pokemontcg.io/xy12/1_hires.png",
    color: "from-purple-600 to-blue-600",
    count: "1,800+",
  },
  {
    series: "MTG",
    name: "Magic: The Gathering",
    image: "https://images.pokemontcg.io/sm12/1_hires.png",
    color: "from-orange-500 to-amber-500",
    count: "3,200+",
  },
  {
    series: "ONE_PIECE",
    name: "One Piece",
    image: "https://images.pokemontcg.io/swsh11/1_hires.png",
    color: "from-red-500 to-blue-500",
    count: "900+",
  },
]

export default async function HomePage() {
  // Fetch featured listings
  const featuredListings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: { include: { user: { select: { name: true, username: true } } } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  })

  // Fetch recent listings
  const recentListings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      seller: { include: { user: { select: { name: true, username: true } } } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  })

  // Stats
  const totalListings = await prisma.listing.count({ where: { status: "ACTIVE" } })
  const totalUsers = await prisma.user.count()
  const totalOrders = await prisma.order.count({ where: { status: "COMPLETED" } })

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="gold" className="text-sm px-4 py-1">
              🇹🇭 Marketplace การ์ด TCG อันดับ 1 ของไทย
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">ซื้อ-ขายการ์ด TCG</span>
              <br />
              <span className="text-white">ปลอดภัย ไว้ใจได้</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              ระบบ Escrow คุ้มครองทุกธุรกรรม Pokemon, Yu-Gi-Oh!, MTG, One Piece
              และอีกมากมาย พร้อมจัดส่งทั่วประเทศไทย
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="gold" asChild>
                <Link href="/browse">
                  <Search className="mr-2 h-5 w-5" />
                  ค้นหาการ์ด
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="border-gold/30 text-gold hover:bg-gold/10">
                <Link href="/sell/new">
                  เริ่มขายการ์ด
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gold">{totalListings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">รายการ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-400">{totalUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">สมาชิก</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gold">{totalOrders.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">ออเดอร์สำเร็จ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Series */}
      <section className="container px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">เลือกซีรีส์</h2>
            <p className="text-muted-foreground mt-1">ค้นหาการ์ดจากซีรีส์ที่คุณชื่นชอบ</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/browse">
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERIES_CARDS.map((s) => (
            <Link key={s.series} href={`/browse?series=${s.series}`}>
              <Card className="group overflow-hidden hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10">
                <div className={`h-32 bg-gradient-to-br ${s.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-2 left-3">
                    <span className="text-xs text-white/80">{s.count} รายการ</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm group-hover:text-gold transition-colors">
                    {s.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="container px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-gold" />
                รายการแนะนำ
              </h2>
              <p className="text-muted-foreground mt-1">การ์ดคุณภาพที่คัดสรรโดยทีมงาน</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="container px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              ลงขายล่าสุด
            </h2>
            <p className="text-muted-foreground mt-1">การ์ดที่เพิ่งลงขายใหม่</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/browse">
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-border/40 bg-card/50">
        <div className="container px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            ทำไมต้อง <span className="text-gradient">CardVault</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">ระบบ Escrow</h3>
              <p className="text-sm text-muted-foreground">
                เงินจะถูกเก็บไว้ในระบบจนกว่าผู้ซื้อยืนยันว่าได้รับสินค้าถูกต้อง
                คุ้มครองทั้งผู้ซื้อและผู้ขาย
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gold/10 flex items-center justify-center">
                <Star className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-semibold text-lg">ผู้ขายที่น่าเชื่อถือ</h3>
              <p className="text-sm text-muted-foreground">
                ระบบ Verified Seller และรีวิวจากผู้ซื้อจริง
                คุณมั่นใจได้ว่าจะได้การ์ดของแท้ตามที่โฆษณา
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Truck className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">จัดส่งทั่วไทย</h3>
              <p className="text-sm text-muted-foreground">
                เลือกขนส่งได้หลากหลาย Kerry, Flash, Thailand Post
                พร้อมเลข tracking ติดตามพัสดุ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16">
        <Card className="relative overflow-hidden border-gold/20">
          <div className="absolute inset-0 card-gradient" />
          <CardContent className="relative p-8 md:p-12 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              พร้อมเริ่มขายการ์ดของคุณ?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              สมัครสมาชิกฟรี ลงขายได้ทันที ไม่มีค่าใช้จ่ายจนกว่าจะขายได้
            </p>
            <Button size="xl" variant="gold" asChild>
              <Link href="/register">
                <Users className="mr-2 h-5 w-5" />
                สมัครสมาชิกฟรี
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const imageUrl = listing.images?.[0]?.url ?? "/placeholder-card.png"

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <Image
            src={imageUrl}
            alt={listing.customName ?? listing.card?.name ?? "Card"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {listing.isGraded && (
            <Badge variant="gold" className="absolute top-2 left-2 text-[10px]">
              {listing.gradingCompany} {listing.gradeScore}
            </Badge>
          )}
          {listing.isFeatured && (
            <Badge variant="purple" className="absolute top-2 right-2 text-[10px]">
              ⭐ แนะนำ
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground truncate">
            {SERIES_LABELS[listing.series] ?? listing.series}
          </p>
          <h3 className="font-medium text-sm truncate group-hover:text-purple-400 transition-colors">
            {listing.customName ?? listing.card?.name ?? "Untitled"}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gold">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
