// @ts-nocheck
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(100),
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20)
    .regex(/^[a-z0-9_]+$/, "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, 0-9, _"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return new Response(
        JSON.stringify({ error: firstError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const { name, username, email, password } = parsed.data

    // Check if email or username already exists (use separate queries to avoid OR issues)
    const [existingByEmail, existingByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ])

    if (existingByEmail) {
      return new Response(
        JSON.stringify({ error: "อีเมลนี้มีผู้ใช้แล้ว" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      )
    }

    if (existingByUsername) {
      return new Response(
        JSON.stringify({ error: "ชื่อผู้ใช้นี้มีผู้ใช้แล้ว" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return new Response(
      JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
