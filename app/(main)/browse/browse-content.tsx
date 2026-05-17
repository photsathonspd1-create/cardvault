"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { FilterSidebar } from "@/components/browse/filter-sidebar"
import { ListingCard } from "@/components/listing/listing-card"
import { cn } from "@/lib/utils"

interface BrowseContentProps {
  listings: any[]
  total: number
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

const SORT_OPTIONS = [
  { value: "newest", label: "ใหม่สุด" },
  { value: "price_asc", label: "ราคาน้อย → มาก" },
  { value: "price_desc", label: "ราคามาก → น้อย" },
  { value: "popular", label: "ยอดนิยม" },
]

export function BrowseContent({ listings, total, page, totalPages, searchParams }: BrowseContentProps) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid4" | "grid2" | "list">("grid4")

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams as any)
    params.set("sort", sort)
    params.delete("page")
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">ซื้อการ์ด</h1>
        <p className="text-sm text-zinc-400 mt-1">ค้นหาการ์ด TCG ที่คุณต้องการ</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — Desktop */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
          <FilterSidebar />
        </div>

        {/* Sidebar — Mobile Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-zinc-950 overflow-y-auto p-4">
              <FilterSidebar onClose={() => setShowFilters(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                ตัวกรอง
              </button>
              <p className="text-sm text-zinc-400">
                ผลการค้นหา <span className="text-white font-medium">{total.toLocaleString()}</span> รายการ
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={searchParams.sort || "newest"}
                onChange={(e) => updateSort(e.target.value)}
                className="h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid4")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "grid4" ? "bg-zinc-800 text-amber-400" : "text-zinc-500"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "list" ? "bg-zinc-800 text-amber-400" : "text-zinc-500"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {listings.length > 0 ? (
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid4"
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : viewMode === "grid2"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              )}
            >
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-lg font-bold text-white mb-2">ไม่พบรายการที่ตรงกับตัวกรอง</h3>
              <p className="text-sm text-zinc-400 mb-6">
                ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น
              </p>
              <Link
                href="/browse"
                className="inline-flex px-6 py-3 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Link
                href={`/browse?${new URLSearchParams({ ...searchParams as any, page: String(page - 1) }).toString()}`}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors",
                  page <= 1
                    ? "border-zinc-800 text-zinc-600 pointer-events-none"
                    : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                if (pageNum > totalPages) return null
                return (
                  <Link
                    key={pageNum}
                    href={`/browse?${new URLSearchParams({ ...searchParams as any, page: String(pageNum) }).toString()}`}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                      pageNum === page
                        ? "bg-amber-500 text-black"
                        : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    {pageNum}
                  </Link>
                )
              })}

              <Link
                href={`/browse?${new URLSearchParams({ ...searchParams as any, page: String(page + 1) }).toString()}`}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors",
                  page >= totalPages
                    ? "border-zinc-800 text-zinc-600 pointer-events-none"
                    : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
