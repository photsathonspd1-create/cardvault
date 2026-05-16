import { Skeleton } from "@/components/ui/skeleton"

export default function SellLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border/40" />

      <div className="flex-1 container px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />

            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
