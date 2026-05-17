// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

/**
 * Forgot Password API
 * POST /api/auth/forgot-password
 *
 * 1. Find user by email
 * 2. Generate reset token (valid 1 hour)
 * 3. In production: send email via Resend/SendGrid
 * 4. For now: return success regardless (don't reveal if email exists)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "กรุณากรอกอีเมล" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return new Response(
        JSON.stringify({ success: true, message: "หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตให้" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in VerificationToken table
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: `reset:${user.email}`,
          token: token,
        },
      },
      update: {
        expires,
      },
      create: {
        identifier: `reset:${user.email}`,
        token,
        expires,
      },
    })

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, token)
    if (!emailResult.success) {
      console.warn("Failed to send reset email:", emailResult.error)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตให้",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
