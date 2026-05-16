"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  AlertTriangle,
  Users,
  Settings,
  FileText,
  ShieldCheck,
} from "lucide-react"

const NAV_ITEMS = [
  {
    title: "แดชบอร์ด",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "รายการขาย",
    href: "/admin/listings",
    icon: ShoppingBag,
  },
  {
    title: "ข้อพิพาท",
    href: "/admin/disputes",
    icon: AlertTriangle,
  },
  {
    title: "ผู้ใช้",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "ตรวจสอบ KYC",
    href: "/admin/kyc",
    icon: ShieldCheck,
  },
  {
    title: "บันทึกกิจกรรม",
    href: "/admin/audit-log",
    icon: FileText,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      <h2 className="text-lg font-semibold mb-4 px-3">แอดมิน</h2>
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
