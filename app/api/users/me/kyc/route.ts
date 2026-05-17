// @ts-nocheck
import { NextRequest } from "next/server"
import { getUserId, getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/users/me/kyc — Get current KYC status
 * POST /api/users/me/kyc — Submit KYC documents
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        kycStatus: true,
        kycIdCardUrl: true,
        kycSelfieUrl: true,
        kycSubmittedAt: true,
        kycReviewedAt: true,
        kycNote: true,
        isKycVerified: true,
      },
    })

    if (!profile) {
      return new Response(JSON.stringify({ kycStatus: "NONE" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("KYC GET error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { kycIdCardUrl, kycSelfieUrl } = body as {
      kycIdCardUrl?: string
      kycSelfieUrl?: string
    }

    if (!kycIdCardUrl || !kycSelfieUrl) {
      return new Response(
        JSON.stringify({ error: "กรุณาอัปโหลดบัตรประชาชนและรูปเซลฟี่" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check if profile exists
    let profile = await prisma.sellerProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      profile = await prisma.sellerProfile.create({
        data: {
          userId,
          displayName: "Seller",
        },
      })
    }

    // Prevent re-submission if already pending
    if (profile.kycStatus === "PENDING") {
      return new Response(
        JSON.stringify({ error: "เอกสารของคุณอยู่ระหว่างการตรวจสอบ กรุณารอ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    await prisma.sellerProfile.update({
      where: { userId },
      data: {
        kycStatus: "PENDING",
        kycIdCardUrl,
        kycSelfieUrl,
        kycSubmittedAt: new Date(),
        kycReviewedAt: null,
        kycNote: null,
      },
    })

    return new Response(
      JSON.stringify({ success: true, message: "ส่งเอกสารเรียบร้อย" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("KYC POST error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
