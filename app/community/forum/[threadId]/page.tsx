import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getInitials, getRelativeTime } from "@/lib/utils"
import { Pin, Lock, Eye, MessageCircle, ArrowLeft, CheckCircle, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { ForumReplyForm } from "./reply-form"

const CATEGORY_LABELS: Record<string, string> = {
  POKEMON: "โปเกมอน",
  YUGIOH: "Yu-Gi-Oh!",
  ONE_PIECE: "One Piece",
  MTG: "Magic: The Gathering",
  VANGUARD: "Cardfight!! Vanguard",
  DIGIMON: "Digimon",
  OTHER: "อื่นๆ",
}

interface ThreadPageProps {
  params: { threadId: string }
}

export default async function ForumThreadPage({ params }: ThreadPageProps) {
  const session = await auth()

  const thread = await prisma.forumThread.findUnique({
    where: { id: params.threadId },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      replies: {
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true },
          },
        },
        orderBy: [{ isBestAnswer: "desc" }, { upvoteCount: "desc" }, { createdAt: "asc" }],
      },
    },
  })

  if (!thread) notFound()

  // Increment view count
  await prisma.forumThread.update({
    where: { id: thread.id },
    data: { viewCount: { increment: 1 } },
  })

  const isAuthor = session?.user && (session.user as Record<string, unknown>).id === thread.authorId

  return (
    <div className="container px-4 py-8 max-w-3xl">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/community/forum">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับฟอรั่ม
        </Link>
      </Button>

      {/* Thread */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{CATEGORY_LABELS[thread.category]}</Badge>
            {thread.isPinned && (
              <Badge variant="gold" className="text-[10px]">
                <Pin className="h-3 w-3 mr-1" /> ปักหมุด
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="secondary" className="text-[10px]">
                <Lock className="h-3 w-3 mr-1" /> ล็อค
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{thread.title}</CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={thread.author.avatar ?? undefined} />
              <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs">
                {getInitials(thread.author.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${thread.author.username}`}
                className="font-medium hover:text-purple-400"
              >
                {thread.author.name}
              </Link>
              <p className="text-xs">
                {getRelativeTime(thread.createdAt)} • {thread.viewCount} ครั้ง
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">
            {thread.content}
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {thread.replies.length} ตอบกลับ
        </h2>

        <div className="space-y-4">
          {thread.replies.map((reply) => (
            <Card
              key={reply.id}
              className={reply.isBestAnswer ? "border-green-500/50 bg-green-500/5" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={reply.author.avatar ?? undefined} />
                    <AvatarFallback className="bg-purple-600/20 text-purple-400 text-xs">
                      {getInitials(reply.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profile/${reply.author.username}`}
                        className="font-medium text-sm hover:text-purple-400"
                      >
                        {reply.author.name}
                      </Link>
                      {reply.isBestAnswer && (
                        <Badge variant="success" className="text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          คำตอบที่ดีที่สุด
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {reply.upvoteCount}
                      </Button>
                      {isAuthor && !reply.isBestAnswer && (
                        <Button variant="ghost" size="sm" className="text-green-400 h-7 px-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          เลือกเป็นคำตอบที่ดีที่สุด
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      {!thread.isLocked && session ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ตอบกลับ</CardTitle>
          </CardHeader>
          <CardContent>
            <ForumReplyForm threadId={thread.id} />
          </CardContent>
        </Card>
      ) : thread.isLocked ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            <Lock className="h-4 w-4 mx-auto mb-2" />
            กระทู้นี้ถูกล็อค ไม่สามารถตอบกลับได้
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            <Link href="/login" className="text-purple-400 hover:underline">
              เข้าสู่ระบบ
            </Link>{" "}
            เพื่อตอบกลับ
          </CardContent>
        </Card>
      )}
    </div>
  )
}
