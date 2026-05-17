// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sellerApplySchema = z.object({
  displayName: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  bankCode: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(10).max(20),
})

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check if already a seller
    const existing = await prisma.sellerProfile.findUnique({
      where: { userId },
    })
    if (existing) {
      return new Response(
        JSON.stringify({ error: "คุณเป็นผู้ขายอยู่แล้ว" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const parsed = sellerApplySchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const { displayName, bio, bankCode, bankName, accountNumber } = parsed.data

    // Create seller profile + bank account
    await prisma.$transaction(async (tx) => {
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId,
          displayName,
          bio,
          tier: "BRONZE",
        },
      })

      await tx.bankAccount.create({
        data: {
          sellerId: sellerProfile.id,
          bankCode,
          bankName,
          accountNumber,
        },
      })

      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: "SELLER" },
      })
    })

    return new Response(
      JSON.stringify({ success: true, message: "สมัครเป็นผู้ขายสำเร็จ!" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Seller apply error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
