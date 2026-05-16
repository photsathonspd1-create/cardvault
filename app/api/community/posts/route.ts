// @ts-nocheck
import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PostType } from "@prisma/client"

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).max(8).optional(),
  hashtags: z.array(z.string()).max(10).optional(),
  taggedCards: z.array(z.string()).max(5).optional(),
  taggedListings: z.array(z.string()).max(3).optional(),
  type: z.nativeEnum(PostType).default("GENERAL"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)
    const type = searchParams.get("type") as PostType | null
    const hashtag = searchParams.get("hashtag")

    const where: any = { isHidden: false }
    if (type) where.type = type
    if (hashtag) where.hashtags = { has: hashtag }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, username: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.communityPost.count({ where }),
    ])

    return new Response(
      JSON.stringify({
        posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Get posts error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่系统" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const parsed = createPostSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: userId,
        ...parsed.data,
      },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
      },
    })

    return new Response(
      JSON.stringify({ success: true, post }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Create post error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
