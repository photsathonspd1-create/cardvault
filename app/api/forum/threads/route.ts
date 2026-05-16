import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TcgCategory } from "@prisma/client"

/**
 * GET /api/forum/threads — List threads
 * POST /api/forum/threads — Create thread
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")

    const where: Record<string, unknown> = {}
    if (category && category !== "ALL") {
      where.category = category as TcgCategory
    }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        include: {
          author: { select: { name: true, username: true, avatar: true } },
          _count: { select: { replies: true } },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ])

    return new Response(
      JSON.stringify({ threads, total, page, totalPages: Math.ceil(total / limit) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Forum GET error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { title, content, category } = body as {
      title?: string
      content?: string
      category?: string
    }

    if (!title?.trim() || !content?.trim()) {
      return new Response(
        JSON.stringify({ error: "กรุณากรอกหัวข้อและเนื้อหา" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!category || !Object.keys(TcgCategory).includes(category)) {
      return new Response(
        JSON.stringify({ error: "หมวดหมู่ไม่ถูกต้อง" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const thread = await prisma.forumThread.create({
      data: {
        authorId: userId,
        title: title.trim(),
        content: content.trim(),
        category: category as TcgCategory,
      },
    })

    return new Response(
      JSON.stringify({ success: true, threadId: thread.id }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Forum POST error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
