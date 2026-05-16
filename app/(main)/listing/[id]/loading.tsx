import { Skeleton } from "@/components/ui/skeleton"

export default function ListingLoading() {
  return (
    <div className="container px-4 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="aspect-[3/4] rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Title */}
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />

          {/* Price Card */}
          <Skeleton className="h-40 rounded-lg" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Shipping */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Seller */}
          <Skeleton className="h-24 rounded-lg" />

          {/* Escrow notice */}
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
