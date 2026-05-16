import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PlanType } from "@prisma/client"

/**
 * GET /api/subscriptions — Get current subscription
 * POST /api/subscriptions — Create/update subscription
 */

export async function GET() {
  try {
    const session = await auth()
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: { subscription: true },
    })

    if (!profile) {
      return new Response(JSON.stringify({ plan: "FREE", subscription: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({
        plan: profile.subscription?.plan ?? "FREE",
        subscription: profile.subscription,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Subscription GET error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined
    if (!userId) {
      return new Response(JSON.stringify({ error: "กรุณาเข้าสู่ระบบ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { plan } = body as { plan?: string }

    if (!plan || !["PRO", "BUSINESS"].includes(plan)) {
      return new Response(
        JSON.stringify({ error: "แผนไม่ถูกต้อง" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const planType = plan as PlanType
    const priceMap: Record<string, number> = { PRO: 29900, BUSINESS: 89900 }
    const price = priceMap[plan] ?? 0

    // Get or create seller profile
    let profile = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: { subscription: true },
    })

    if (!profile) {
      profile = await prisma.sellerProfile.create({
        data: {
          userId,
          displayName: (session?.user as Record<string, unknown>)?.name as string ?? "Seller",
        },
        include: { subscription: true },
      })
    }

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    if (profile.subscription) {
      // Update existing subscription
      await prisma.sellerSubscription.update({
        where: { id: profile.subscription.id },
        data: {
          plan: planType,
          price,
          startedAt: now,
          expiresAt,
          isActive: true,
        },
      })
    } else {
      // Create new subscription
      await prisma.sellerSubscription.create({
        data: {
          sellerId: profile.id,
          plan: planType,
          price,
          startedAt: now,
          expiresAt,
          isActive: true,
        },
      })
    }

    return new Response(
      JSON.stringify({ success: true, plan: planType }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Subscription POST error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
