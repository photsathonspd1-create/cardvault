"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function OrderConfirmButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!confirm("ยืนยันว่าได้รับสินค้าถูกต้อง? เงินจะถูกปล่อยให้ผู้ขาย")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: "เกิดข้อผิดพลาด", description: data.error, variant: "destructive" })
        return
      }

      toast({ title: "ยืนยันสำเร็จ!", description: "เงินถูกปล่อยให้ผู้ขายแล้ว", variant: "success" })
      router.refresh()
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="success" onClick={handleConfirm} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
      ยืนยันรับสินค้า
    </Button>
  )
}
