"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">เกิดข้อผิดพลาด</h1>
          <p className="text-muted-foreground">
            ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            หรือกลับไปหน้าแรก
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="purple" size="lg" onClick={reset}>
            ลองใหม่
          </Button>
          <Button variant="gold" size="lg" asChild>
            <Link href="/">กลับหน้าแรก</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
