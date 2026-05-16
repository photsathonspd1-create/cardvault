"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const DISPUTE_REASONS = [
  { value: "FAKE_CARD", label: "การ์ดปลอม" },
  { value: "NOT_AS_DESCRIBED", label: "ไม่ตรงตามที่โฆษณา" },
  { value: "NOT_RECEIVED", label: "ไม่ได้รับสินค้า" },
  { value: "WRONG_ITEM", label: "ได้รับผิดชิ้น" },
  { value: "DAMAGED_IN_TRANSIT", label: "เสียหายระหว่างขนส่ง" },
  { value: "OTHER", label: "อื่นๆ" },
]

export function OrderDisputeButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")

  async function handleSubmit() {
    if (!reason || !description) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: "เกิดข้อผิดพลาด", description: data.error, variant: "destructive" })
        return
      }

      toast({ title: "เปิดข้อพิพาทสำเร็จ", description: "ผู้ขายและแอดมินจะได้รับแจ้งเตือน" })
      setOpen(false)
      router.refresh()
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          แจ้งปัญหา
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เปิดข้อพิพาท</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>เหตุผล</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเหตุผล" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>รายละเอียด</Label>
            <Textarea
              placeholder="อธิบายปัญหาที่เกิดขึ้น..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ เงินจะถูกอายัดไว้จนกว่าแอดมินจะตัดสิน
          </p>
          <Button variant="destructive" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            ยืนยันเปิดข้อพิพาท
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
