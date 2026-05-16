"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Plus,
  ShoppingBag,
  Package,
  BarChart3,
  Shield,
  Crown,
  Settings,
} from "lucide-react"

const NAV_ITEMS = [
  {
    title: "แดชบอร์ด",
    href: "/sell",
    icon: LayoutDashboard,
  },
  {
    title: "ลงขายสินค้า",
    href: "/sell/new",
    icon: Plus,
  },
  {
    title: "รายการขาย",
    href: "/sell/listings",
    icon: ShoppingBag,
  },
  {
    title: "ออเดอร์",
    href: "/sell/orders",
    icon: Package,
  },
  {
    title: "วิเคราะห์",
    href: "/sell/analytics",
    icon: BarChart3,
  },
  {
    title: "ยืนยันตัวตน",
    href: "/sell/kyc",
    icon: Shield,
  },
  {
    title: "แผนสมาชิก",
    href: "/sell/subscription",
    icon: Crown,
  },
]

export function SellerSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      <h2 className="text-lg font-semibold mb-4 px-3">ผู้ขาย</h2>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-purple-600/10 text-purple-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
