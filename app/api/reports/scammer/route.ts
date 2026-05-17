// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reportSchema = z.object({
  phone: z.string().max(20).optional(),
  bankCode: z.string().max(10).optional(),
  bankNumber: z.string().max(30).optional(),
  bankName: z.string().max(200).optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  lineId: z.string().max(50).optional(),
  description: z.string().min(20).max(2000),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "กรุณาเข้าสู่系统" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await request.json()
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const report = await prisma.scammerReport.create({
      data: {
        reporterId: userId,
        ...parsed.data,
      },
    })

    return new Response(
      JSON.stringify({ success: true, message: "ส่งรายงานสำเร็จ แอดมินจะตรวจสอบ" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Scammer report error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const bank = searchParams.get("bank")

    if (!phone && !bank) {
      return new Response(
        JSON.stringify({ error: "กรุณาระบุเบอร์โทรหรือเลขบัญชี" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const where: any = { status: "APPROVED", isPublic: true }
    if (phone) where.phone = phone
    if (bank) where.bankNumber = bank

    const reports = await prisma.scammerReport.findMany({
      where,
      select: {
        id: true,
        phone: true,
        bankCode: true,
        bankNumber: true,
        bankName: true,
        description: true,
        evidenceUrls: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Mask bank number for privacy
    const masked = reports.map((r) => ({
      ...r,
      bankNumber: r.bankNumber ? r.bankNumber.slice(0, 3) + "***" + r.bankNumber.slice(-3) : null,
    }))

    return new Response(
      JSON.stringify({ reports: masked, count: masked.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Scammer check error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาด" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
