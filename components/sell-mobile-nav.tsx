"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Plus, ShoppingBag, ClipboardList, Package } from "lucide-react"

const NAV_ITEMS = [
  { href: "/sell/new", label: "ลงขาย", icon: Plus },
  { href: "/sell/listings", label: "รายการ", icon: ShoppingBag },
  { href: "/sell/orders", label: "ออเดอร์", icon: Package },
]

export function SellMobileNav() {
  const pathname = usePathname()

  return (
    <div className="mobile-bottom-nav lg:hidden">
      <nav className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors touch-target",
                isActive
                  ? "text-purple-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
