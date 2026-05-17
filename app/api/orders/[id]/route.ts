// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId, getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่系统" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
          },
        },
        buyer: { select: { id: true, name: true, username: true, avatar: true } },
        seller: { select: { id: true, name: true, username: true, avatar: true } },
        dispute: true,
        review: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    })

    if (!order) {
      return new Response(
        JSON.stringify({ error: "ไม่พบออเดอร์" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Only buyer, seller, or admin can view
    const _session = await getSession(request)
    const userRole = _session?.user?.role
    if (order.buyerId !== userId && order.sellerId !== userId && userRole !== "ADMIN") {
      return new Response(
        JSON.stringify({ error: "ไม่มีสิทธิ์ดูออเดอร์นี้" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ order }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Get order error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
