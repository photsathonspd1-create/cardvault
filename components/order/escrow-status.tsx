import { Badge } from "@/components/ui/badge"
import { Shield, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EscrowStatusProps {
  status: string
  escrowReleaseAt?: Date | null
  className?: string
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; variant: any; color: string }> = {
  HOLDING: { label: "เงินอยู่ในระบบ", icon: Shield, variant: "purple", color: "text-purple-400" },
  RELEASING: { label: "กำลังปล่อยเงิน", icon: Clock, variant: "warning", color: "text-yellow-400" },
  RELEASED: { label: "ปล่อยเงินแล้ว", icon: CheckCircle, variant: "success", color: "text-green-400" },
  REFUNDED: { label: "คืนเงินแล้ว", icon: XCircle, variant: "secondary", color: "text-muted-foreground" },
  FROZEN: { label: "อายัดเงิน", icon: AlertTriangle, variant: "destructive", color: "text-red-400" },
}

export function EscrowStatus({ status, escrowReleaseAt, className }: EscrowStatusProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.HOLDING
  const Icon = config.icon

  // Calculate countdown for auto-release
  const now = new Date()
  const releaseAt = escrowReleaseAt ? new Date(escrowReleaseAt) : null
  const daysLeft = releaseAt ? Math.max(0, Math.ceil((releaseAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50", className)}>
      <Icon className={cn("h-5 w-5", config.color)} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Escrow:</span>
          <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
        </div>
        {status === "HOLDING" && daysLeft !== null && daysLeft > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            ปล่อยอัตโนมัติใน {daysLeft} วัน
          </p>
        )}
      </div>
    </div>
  )
}
