"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/", icon: Home, label: "หน้าแรก" },
  { href: "/browse", icon: Search, label: "ค้นหา" },
  { href: "/sell/new", icon: Plus, label: "ลงขาย", isCenter: true },
  { href: "/orders", icon: Bell, label: "แจ้งเตือน", badge: true },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
          const Icon = tab.icon

          if (tab.isCenter) {
            return (
              <Link key={tab.href} href={tab.href} className="relative -mt-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Icon className="w-6 h-6 text-black" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors relative",
                isActive ? "text-amber-400" : "text-zinc-500"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full text-[8px] font-bold text-black flex items-center justify-center">
                    3
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
