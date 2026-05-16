"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ShoppingBag,
  Plus,
  User,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { getInitials } from "@/lib/utils"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const user = session?.user as any

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-gold flex items-center justify-center">
            <span className="text-white font-bold text-sm">CV</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">
            <span className="text-purple-400">Card</span>
            <span className="text-gold">Vault</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ค้นหาการ์ด
          </Link>
          <Link href="/browse?series=POKEMON" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pokemon
          </Link>
          <Link href="/browse?series=YUGIOH" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Yu-Gi-Oh!
          </Link>
          <Link href="/browse?series=MTG" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            MTG
          </Link>
          <Link href="/browse?series=ONE_PIECE" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            One Piece
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
            <Link href="/browse">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {status === "loading" ? (
            <div className="h-10 w-20 animate-pulse bg-muted rounded-md" />
          ) : session ? (
            <>
              <Button variant="purple" size="sm" asChild className="hidden md:flex">
                <Link href="/sell/new">
                  <Plus className="h-4 w-4 mr-1" />
                  ลงขาย
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                      <AvatarFallback className="bg-purple-600/20 text-purple-400">
                        {getInitials(user?.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.role === "ADMIN" && (
                        <Badge variant="purple" className="w-fit">Admin</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/sell/listings" className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      รายการขาย
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      ออเดอร์
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      ตั้งค่า
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          จัดการระบบ
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">เข้าสู่ระบบ</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link href="/register">สมัครสมาชิก</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background p-4">
          <nav className="flex flex-col gap-3">
            <Link href="/browse" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              ค้นหาการ์ด
            </Link>
            <Link href="/browse?series=POKEMON" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Pokemon
            </Link>
            <Link href="/browse?series=YUGIOH" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Yu-Gi-Oh!
            </Link>
            <Link href="/browse?series=MTG" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              MTG
            </Link>
            <Link href="/browse?series=ONE_PIECE" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              One Piece
            </Link>
            {session && (
              <Button variant="purple" size="sm" asChild className="mt-2">
                <Link href="/sell/new" onClick={() => setMobileMenuOpen(false)}>
                  <Plus className="h-4 w-4 mr-1" />
                  ลงขาย
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
