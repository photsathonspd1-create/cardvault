import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Condition, CardLanguage, ListingStatus } from "@prisma/client"

const updateListingSchema = z.object({
  condition: z.nativeEnum(Condition).optional(),
  language: z.nativeEnum(CardLanguage).optional(),
  price: z.number().int().positive().optional(),
  originalPrice: z.number().int().positive().nullable().optional(),
  isNegotiable: z.boolean().optional(),
  quantity: z.number().int().positive().optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่系统" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { seller: true },
    })

    if (!listing) {
      return new Response(
        JSON.stringify({ error: "ไม่พบรายการ" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Only owner or admin can edit
    const userRole = (session!.user as any).role
    if (listing.seller.userId !== userId && userRole !== "ADMIN") {
      return new Response(
        JSON.stringify({ error: "ไม่มีสิทธิ์แก้ไข" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const parsed = updateListingSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return new Response(
      JSON.stringify({ success: true, listing: updated }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Update listing error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่系统" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { seller: true, orders: true },
    })

    if (!listing) {
      return new Response(
        JSON.stringify({ error: "ไม่พบรายการ" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    const userRole = (session!.user as any).role
    if (listing.seller.userId !== userId && userRole !== "ADMIN") {
      return new Response(
        JSON.stringify({ error: "ไม่มีสิทธิ์ลบ" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    // Can't delete if there are active orders
    const activeOrders = listing.orders.filter((o) =>
      ["PENDING_PAYMENT", "PAID", "SHIPPED"].includes(o.status)
    )
    if (activeOrders.length > 0) {
      return new Response(
        JSON.stringify({ error: "ไม่สามารถลบได้เนื่องจากมีออเดอร์ที่ยังไม่เสร็จ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    await prisma.listing.delete({ where: { id: params.id } })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Delete listing error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
