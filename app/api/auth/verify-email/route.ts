// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

/**
 * POST /api/auth/verify-email
 * Send verification email to the logged-in user
 */
export async function POST(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth")
    const userId = await getUserId(request)
    if (!userId) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return Response.json({ error: "ไม่พบผู้ใช้" }, { status: 404 })
    }

    if (user.emailVerified) {
      return Response.json({ error: "อีเมลนี้ยืนยันแล้ว" }, { status: 400 })
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    })

    // Send verification email
    const { sendEmail } = await import("@/lib/resend")
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${token}`

    await sendEmail({
      to: user.email,
      subject: "ยืนยันอีเมล CardVault",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7C3AED;">ยืนยันอีเมลของคุณ</h2>
          <p>สวัสดีคุณ ${user.name},</p>
          <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            ยืนยันอีเมล
          </a>
          <p style="color: #666; font-size: 12px;">ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
        </div>
      `,
    })

    return Response.json({ success: true, message: "ส่งอีเมลยืนยันแล้ว" })
  } catch (error) {
    console.error("Verify email error:", error)
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify email with token
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")
    if (!token) {
      return Response.json({ error: "Token ไม่ถูกต้อง" }, { status: 400 })
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return Response.json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return Response.json({ error: "Token หมดอายุแล้ว" }, { status: 400 })
    }

    // Update user email verification
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete used token
    await prisma.verificationToken.delete({ where: { token } })

    // Redirect to profile with success message
    return Response.redirect(
      new URL("/profile?verified=true", request.nextUrl.origin)
    )
  } catch (error) {
    console.error("Email verify error:", error)
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
