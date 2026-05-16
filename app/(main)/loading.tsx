import { Skeleton } from "@/components/ui/skeleton"

export default function MainLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Skeleton className="h-6 w-48 mx-auto" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full max-w-md mx-auto" />
              <Skeleton className="h-12 w-full max-w-sm mx-auto" />
            </div>
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Series grid skeleton */}
      <section className="container px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      </section>

      {/* Featured listings skeleton */}
      <section className="container px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* Recent listings skeleton */}
      <section className="container px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
