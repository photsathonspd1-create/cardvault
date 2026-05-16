// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: "asc" } },
        shippingOptions: true,
        seller: {
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
        card: true,
      },
    })

    if (!listing) {
      return new Response(
        JSON.stringify({ error: "ไม่พบรายการนี้" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ listing }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Get listing error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
