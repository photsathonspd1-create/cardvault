import Image from "next/image"
import Link from "next/link"
import { TrendingUp, Eye } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export async function HotThisWeek() {
  const hotListings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { views: "desc" },
    take: 8,
  })

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-white">กำลัง Hot สัปดาห์นี้</h3>
        <Link href="/browse?sort=popular" className="ml-auto text-xs text-amber-400 hover:text-amber-300">
          ดูทั้งหมด →
        </Link>
      </div>

      {hotListings.length > 0 ? (
        <div className="space-y-2">
          {hotListings.map((item, i) => {
            const imageUrl = item.images?.[0]?.url ?? "/placeholder-card.png"
            return (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-xs text-zinc-600 w-4 text-center font-bold">{i + 1}</span>
                <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                  <Image
                    src={imageUrl}
                    alt={item.customName ?? "Card"}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{item.customName ?? "Untitled"}</p>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500">{item.views} views</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-amber-400">{formatPrice(item.price)}</p>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-500">ยังไม่มีข้อมูล</p>
        </div>
      )}
    </div>
  )
}
