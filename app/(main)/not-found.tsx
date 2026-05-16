import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MainNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-[100px] sm:text-[140px] font-bold text-gradient leading-none">
            404
          </h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">ไม่พบหน้าที่คุณค้นหา</h2>
          <p className="text-muted-foreground">
            หน้านี้อาจถูกลบ ย้ายที่ หรือไม่เคยมีอยู่จริง
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
