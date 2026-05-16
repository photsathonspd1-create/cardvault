import { Badge } from "@/components/ui/badge"
import { Star, Shield, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SellerBadgeProps {
  tier: string
  rating?: number
  ratingCount?: number
  isKycVerified?: boolean
  className?: string
  showRating?: boolean
}

const TIER_CONFIG: Record<string, { label: string; icon: string; variant: any }> = {
  BRONZE: { label: "Bronze", icon: "🥉", variant: "secondary" },
  SILVER: { label: "Silver", icon: "🥈", variant: "outline" },
  GOLD: { label: "Gold", icon: "🥇", variant: "gold" },
  VERIFIED_PRO: { label: "Pro", icon: "💎", variant: "purple" },
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
      <Badge variant={config.variant} className="text-xs">
        {config.icon} {config.label}
      </Badge>
      {isKycVerified && (
        <Badge variant="success" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )}
      {showRating && rating !== undefined && rating > 0 && (
        <span className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          {ratingCount !== undefined && (
            <span className="text-muted-foreground">({ratingCount})</span>
          )}
        </span>
      )}
    </div>
  )
}
