import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SellNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-[100px] font-bold text-gradient leading-none">
            404
          </h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">ไม่พบหน้าที่คุณค้นหา</h2>
          <p className="text-muted-foreground">
            หน้านี้ในส่วนการขายอาจถูกลบหรือย้ายที่
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="gold" size="lg" asChild>
            <Link href="/sell">กลับหน้าขาย</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">กลับหน้าแรก</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
