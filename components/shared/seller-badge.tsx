import { Badge } from "@/components/ui/badge"
import { Star, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface SellerBadgeProps {
  tier: string
  rating?: number
  ratingCount?: number
  isKycVerified?: boolean
  className?: string
  showRating?: boolean
}

const TIER_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  BRONZE: { label: "Bronze", icon: "🥉", className: "bg-orange-700 text-white" },
  SILVER: { label: "Silver", icon: "🥈", className: "bg-zinc-400 text-black" },
  GOLD: { label: "Gold", icon: "🥇", className: "bg-amber-500 text-black" },
  VERIFIED_PRO: { label: "Pro", icon: "💎", className: "bg-purple-600 text-white" },
}

export function SellerBadge({
  tier,
  rating,
  ratingCount,
  isKycVerified,
  className,
  showRating = true,
}: SellerBadgeProps) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.BRONZE

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full", config.className)}>
        {config.icon} {config.label}
      </span>
      {isKycVerified && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
          <Shield className="h-3 w-3" />
          Verified
        </span>
      )}
      {showRating && rating !== undefined && rating > 0 && (
        <span className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          {ratingCount !== undefined && (
            <span className="text-zinc-500">({ratingCount})</span>
          )}
        </span>
      )}
    </div>
  )
}
