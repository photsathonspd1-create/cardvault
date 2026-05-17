import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        phone: true,
        role: true,
        createdAt: true,
        sellerProfile: {
          select: {
            id: true,
            displayName: true,
            bio: true,
            tier: true,
            isKycVerified: true,
            kycStatus: true,
          },
        },
      },
    })

    if (!user) {
      return Response.json({ error: "ไม่พบผู้ใช้" }, { status: 404 })
    }

    return Response.json({ user })
  } catch (error) {
    console.error("Get me error:", error)
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, avatar, phone, sellerDisplayName, sellerBio } = body as {
      name?: string
      username?: string
      avatar?: string
      phone?: string
      sellerDisplayName?: string
      sellerBio?: string
    }

    // Validate
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 1)) {
      return Response.json({ error: "ชื่อต้องไม่ว่าง" }, { status: 400 })
    }
    if (username !== undefined) {
      if (typeof username !== "string" || !/^[a-z0-9_]+$/.test(username)) {
        return Response.json({ error: "Username ต้องเป็น a-z, 0-9, _ เท่านั้น" }, { status: 400 })
      }
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } },
        select: { id: true },
      })
      if (existing) {
        return Response.json({ error: "Username นี้ถูกใช้แล้ว" }, { status: 409 })
      }
    }

    // Update user
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (username !== undefined) updateData.username = username.toLowerCase()
    if (avatar !== undefined) updateData.avatar = avatar
    if (phone !== undefined) updateData.phone = phone || null

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })
    }

    // Update seller profile if provided
    if (sellerDisplayName !== undefined || sellerBio !== undefined) {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (sellerProfile) {
        const sellerUpdate: Record<string, unknown> = {}
        if (sellerDisplayName !== undefined) sellerUpdate.displayName = sellerDisplayName.trim()
        if (sellerBio !== undefined) sellerUpdate.bio = sellerBio || null
        await prisma.sellerProfile.update({
          where: { id: sellerProfile.id },
          data: sellerUpdate,
        })
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Update me error:", error)
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
