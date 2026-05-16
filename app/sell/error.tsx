"use client"

import { Button } from "@/components/ui/button"

export default function SellError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">เกิดข้อผิดพลาด</h2>
        <p className="text-muted-foreground">
          {error.message || "ไม่สามารถโหลดหน้านี้ได้"}
        </p>
        <Button onClick={reset} variant="outline">
          ลองใหม่
        </Button>
      </div>
    </div>
  )
}
