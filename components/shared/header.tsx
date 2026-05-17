"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Shield,
  ShoppingCart,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
  Package,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/browse", label: "ซื้อของ" },
  { href: "/sell/new", label: "ขายของ" },
  { href: "/how-it-works", label: "วิธีใช้งาน" },
  { href: "/community", label: "เขียนกับเรา" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const userName = (session?.user as any)?.name || session?.user?.name || "ผู้ใช้"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 shadow-lg shadow-black/20"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                CardVault
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("?")[0])
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                      isActive
                        ? "text-amber-400"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Search (desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาการ์ด, ซีรีส์, ผู้ขาย..."
                  className="w-full h-10 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Scammer Check */}
              <Link href="/check" className="hidden sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-lg gap-1.5 text-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">ตรวจสอบผู้ขาย</span>
                </Button>
              </Link>

              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
              ) : session ? (
                <>
                  {/* Cart / Orders */}
                  <Link href="/orders">
                    <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">
                        1
                      </span>
                    </Button>
                  </Link>

                  {/* Notifications */}
                  <Link href="/orders">
                    <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white hover:ring-2 hover:ring-amber-500/50 transition-all"
                    >
                      {userInitial}
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-12 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            <div className="p-3 border-b border-zinc-800">
                              <p className="text-sm font-medium text-white truncate">{userName}</p>
                              <p className="text-xs text-zinc-500 truncate">{session.user?.email}</p>
                            </div>
                            <div className="p-1">
                              <Link
                                href="/profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                              >
                                <User className="w-4 h-4" />
                                โปรไฟล์
                              </Link>
                              <Link
                                href="/orders"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                              >
                                <Package className="w-4 h-4" />
                                ออเดอร์
                              </Link>
                              <Link
                                href="/sell/listings"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                              >
                                <Store className="w-4 h-4" />
                                รายการขาย
                              </Link>
                            </div>
                            <div className="p-1 border-t border-zinc-800">
                              <button
                                onClick={() => {
                                  setUserMenuOpen(false)
                                  signOut({ callbackUrl: "/" })
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                ออกจากระบบ
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
                      เข้าสู่ระบบ
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg">
                      สมัครสมาชิก
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-zinc-400 hover:text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-zinc-900 border-l border-zinc-800 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-lg font-bold text-white">CardVault</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="w-5 h-5 text-zinc-400" />
                  </Button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาการ์ด..."
                    className="w-full h-10 pl-10 pr-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </form>

                {NAV_LINKS.map((link) => {
                  const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("?")[0])
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      )}
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  )
                })}

                <div className="pt-4 mt-4 border-t border-zinc-800">
                  <Link href="/check">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-500/10 transition-colors">
                      <Shield className="w-4 h-4" />
                      ตรวจสอบผู้ขาย
                    </div>
                  </Link>

                  {session ? (
                    <>
                      <Link href="/profile">
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <User className="w-4 h-4" />
                          โปรไฟล์
                        </div>
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <Link href="/login" className="flex-1">
                        <Button variant="outline" className="w-full text-sm">เข้าสู่ระบบ</Button>
                      </Link>
                      <Link href="/register" className="flex-1">
                        <Button className="w-full bg-amber-500 text-black font-bold text-sm">สมัคร</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}
