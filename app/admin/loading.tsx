import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border/40" />

      <div className="flex-1 container px-4 py-4 sm:py-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">
            <Skeleton className="h-8 w-48" />

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>

            {/* Table */}
            <Skeleton className="h-96 rounded-lg" />
          </main>
        </div>
      </div>
    </div>
  )
}
