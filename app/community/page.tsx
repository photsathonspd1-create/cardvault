"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { getInitials, getRelativeTime } from "@/lib/utils"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ImagePlus,
  Send,
  Hash,
  TrendingUp,
  Sparkles,
} from "lucide-react"

const POST_TYPES = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "SHOW", label: "📸 โชว์การ์ด" },
  { value: "ASK_PRICE", label: "💰 ถามราคา" },
  { value: "SELL", label: "🏷️ ประกาศขาย" },
  { value: "NEWS", label: "📰 ข่าวสาร" },
]

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState("ALL")
  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [activeType])

  async function fetchPosts() {
    setLoading(true)
    try {
      const typeParam = activeType !== "ALL" ? `&type=${activeType}` : ""
      const res = await fetch(`/api/community/posts?page=1&limit=20${typeParam}`)
      const data = await res.json()
      setPosts(data.posts ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  async function handlePost() {
    if (!newPost.trim() || !session) return

    setPosting(true)
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, type: "GENERAL" }),
      })

      if (res.ok) {
        setNewPost("")
        fetchPosts()
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-gold" />
            ชุมชน CardVault
          </h1>
          <p className="text-muted-foreground mt-1">
            แลกเปลี่ยนความรู้ โชว์การ์ด ถาม-ตอบ กับเพื่อนนักสะสม
          </p>
        </div>

        {/* Create Post */}
        {session && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={(session.user as { image?: string })?.image} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-400">
                    {getInitials(session.user?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="แบ่งปันเรื่องราวการ์ดของคุณ..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ImagePlus className="h-4 w-4 mr-1" />
                        รูปภาพ
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Hash className="h-4 w-4 mr-1" />
                        แท็กการ์ด
                      </Button>
                    </div>
                    <Button
                      variant="purple"
                      size="sm"
                      onClick={handlePost}
                      disabled={posting || !newPost.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      โพสต์
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <Tabs value={activeType} onValueChange={setActiveType} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {POST_TYPES.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-20">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">ยังไม่มีโพสต์</p>
              <p className="text-sm text-muted-foreground mt-1">เป็นคนแรกที่แบ่งปันเรื่องราว!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback className="bg-purple-600/20 text-purple-400">
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/profile/${post.author.username}`}
                        className="font-medium text-sm hover:text-purple-400"
                      >
                        {post.author.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        @{post.author.username} • {getRelativeTime(post.createdAt)}
                      </p>
                    </div>
                    {post.type !== "GENERAL" && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {POST_TYPES.find((t) => t.value === post.type)?.label ?? post.type}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {post.images.slice(0, 4).map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.map((tag: string) => (
                        <span key={tag} className="text-xs text-purple-400 hover:underline cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-border/40">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Heart className="h-4 w-4 mr-1" />
                      {post._count.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post._count.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
