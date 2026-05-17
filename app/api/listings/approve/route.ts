// @ts-nocheck
import { NextRequest } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    const userId = session?.user?.id
    const userRole = (session?.user as any)?.role

    if (!user || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      return new Response(
        JSON.stringify({ error: "ไม่มีสิทธิ์" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    const formData = await request.formData()
    const listingId = formData.get("listingId") as string

    if (!listingId) {
      return new Response(
        JSON.stringify({ error: "Missing listingId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "ACTIVE" },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LISTING_APPROVE",
        targetType: "LISTING",
        targetId: listingId,
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Approve listing error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
