import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-[120px] sm:text-[160px] font-bold text-gradient leading-none">
            404
          </h1>
          <div className="absolute inset-0 bg-purple-600/5 blur-3xl rounded-full" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">ไม่พบหน้าที่คุณค้นหา</h2>
          <p className="text-muted-foreground">
            หน้านี้อาจถูกลบ ย้ายที่ หรือไม่เคยมีอยู่จริง
            กรุณาตรวจสอบ URL หรือกลับไปหน้าแรก
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gold" size="lg" asChild>
            <Link href="/">กลับหน้าแรก</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/browse">ค้นหาการ์ด</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
