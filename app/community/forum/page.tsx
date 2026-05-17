// @ts-nocheck
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Eye, Pin, Lock, Plus } from "lucide-react"
import { TcgCategory } from "@prisma/client"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

const CATEGORY_LABELS: Record<string, string> = {
  POKEMON: "โปเกมอน",
  YUGIOH: "Yu-Gi-Oh!",
  ONE_PIECE: "One Piece",
  MTG: "Magic: The Gathering",
  VANGUARD: "Cardfight!! Vanguard",
  DIGIMON: "Digimon",
  OTHER: "อื่นๆ",
}

const CATEGORY_EMOJIS: Record<string, string> = {
  POKEMON: "⚡",
  YUGIOH: "🃏",
  ONE_PIECE: "🏴‍☠️",
  MTG: "🔮",
  VANGUARD: "⚔️",
  DIGIMON: "🐉",
  OTHER: "🎲",
}

export default async function ForumPage() {
  const session = await auth()

  // Get threads grouped by category
  const threads = await prisma.forumThread.findMany({
    include: {
      author: { select: { name: true, username: true, avatar: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 100,
  })

  // Group by category
  const grouped = new Map<string, typeof threads>()
  for (const thread of threads) {
    const cat = thread.category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(thread)
  }

  // Ensure all categories are shown
  const allCategories = Object.keys(CATEGORY_LABELS)

  return (
    <div className="container px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">ฟอรั่ม</h1>
          <p className="text-muted-foreground mt-1">
            พูดคุย แลกเปลี่ยนความรู้ เกี่ยวกับการ์ด TCG
          </p>
        </div>
        {session && (
          <Button variant="purple" asChild>
            <Link href="/community/forum/new">
              <Plus className="mr-2 h-4 w-4" />
              สร้างกระทู้
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {allCategories.map((cat) => {
          const catThreads = grouped.get(cat) ?? []
          return (
            <Card key={cat}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{CATEGORY_EMOJIS[cat]}</span>
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {catThreads.length} กระทู้
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {catThreads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ยังไม่มีกระทู้ในหมวดนี้
                  </p>
                ) : (
                  <div className="space-y-2">
                    {catThreads.slice(0, 5).map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/community/forum/${thread.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {thread.isPinned && (
                          <Pin className="h-4 w-4 text-gold shrink-0" />
                        )}
                        {thread.isLocked && (
                          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {thread.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            โดย {thread.author.name} •{" "}
                            {new Date(thread.createdAt).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {thread._count.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {thread.viewCount}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {catThreads.length > 5 && (
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        และอีก {catThreads.length - 5} กระทู้...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
