// @ts-nocheck
import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/forum/threads/[threadId]/replies — List replies
 * POST /api/forum/threads/[threadId]/replies — Create reply
 */

export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const replies = await prisma.forumReply.findMany({
      where: { threadId: params.threadId },
      include: {
        author: { select: { name: true, username: true, avatar: true } },
      },
      orderBy: [{ isBestAnswer: "desc" }, { upvoteCount: "desc" }, { createdAt: "asc" }],
    })

    return new Response(JSON.stringify({ replies }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Replies GET error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth()
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check thread exists and not locked
    const thread = await prisma.forumThread.findUnique({
      where: { id: params.threadId },
    })

    if (!thread) {
      return new Response(JSON.stringify({ error: "ไม่พบกระทู้" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (thread.isLocked) {
      return new Response(
        JSON.stringify({ error: "กระทู้นี้ถูกล็อค ไม่สามารถตอบกลับได้" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const { content } = body as { content?: string }

    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ error: "กรุณากรอกเนื้อหา" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const reply = await prisma.forumReply.create({
      data: {
        threadId: params.threadId,
        authorId: userId,
        content: content.trim(),
      },
    })

    // Update reply count
    await prisma.forumThread.update({
      where: { id: params.threadId },
      data: { replyCount: { increment: 1 } },
    })

    return new Response(
      JSON.stringify({ success: true, replyId: reply.id }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Replies POST error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
