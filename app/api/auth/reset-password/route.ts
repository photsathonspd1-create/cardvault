// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * Reset Password API
 * POST /api/auth/reset-password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "ข้อมูลไม่ครบ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Find valid token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: { startsWith: "reset:" },
        expires: { gt: new Date() },
      },
    })

    if (!verificationToken) {
      return new Response(
        JSON.stringify({ error: "ลิงก์ไม่ถูกต้องหรือหมดอายุ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Extract email from identifier
    const email = verificationToken.identifier.replace("reset:", "")

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return new Response(
        JSON.stringify({ error: "ไม่พบบัญชีผู้ใช้" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })

    return new Response(
      JSON.stringify({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
