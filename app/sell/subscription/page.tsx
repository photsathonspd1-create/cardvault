"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Zap, Building2, Loader2 } from "lucide-react"

interface Plan {
  id: string
  name: string
  price: number
  priceLabel: string
  icon: React.ReactNode
  features: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    priceLabel: "ฟรี",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "ลงขายได้ 10 รายการ",
      "ต้องรอ Admin อนุมัติ",
      "ระบบ Escrow คุ้มครอง",
      "แชทกับผู้ซื้อ",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 29900,
    priceLabel: "฿299/เดือน",
    icon: <Crown className="h-6 w-6 text-gold" />,
    features: [
      "ลงขายไม่จำกัด",
      "อนุมัติอัตโนมัติ",
      "Featured Listing 1 ครั้ง/เดือน",
      "ระบบ Escrow คุ้มครอง",
      "แชทกับผู้ซื้อ",
      "ป้าย Pro บนโปรไฟล์",
    ],
    popular: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: 89900,
    priceLabel: "฿899/เดือน",
    icon: <Building2 className="h-6 w-6 text-purple-400" />,
    features: [
      "ทุกอย่างในแผน Pro",
      "Bulk Upload",
      "Analytics Dashboard",
      "API Access",
      "Featured Listing 5 ครั้ง/เดือน",
      "Priority Support",
    ],
  },
]

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("FREE")
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    try {
      const res = await fetch("/api/subscriptions")
      if (res.ok) {
        const data = await res.json()
        setCurrentPlan(data.plan ?? "FREE")
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleSubscribe(planId: string) {
    if (planId === "FREE") return

    setSubscribing(planId)
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })

      if (res.ok) {
        setCurrentPlan(planId)
      }
    } catch {
      // ignore
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แผนสมาชิก</h1>
        <p className="text-muted-foreground mt-1">
          เลือกแผนที่เหมาะกับคุณ เพื่อปลดล็อคฟีเจอร์เพิ่มเติม
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-purple-500/50 shadow-lg shadow-purple-500/10"
                  : ""
              } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && (
                <Badge
                  variant="purple"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  ยอดนิยม
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-2">{plan.icon}</div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-2xl font-bold text-gold">{plan.priceLabel}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    แผนปัจจุบัน
                  </Button>
                ) : plan.id === "FREE" ? (
                  <Button variant="outline" className="w-full" disabled>
                    แผนพื้นฐาน
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "purple" : "outline"}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing !== null}
                  >
                    {subscribing === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    สมัครสมาชิก
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
