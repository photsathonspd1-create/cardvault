import type { Metadata } from "next"
import Link from "next/link"
import { Search, CreditCard, Truck, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "วิธีใช้งาน | CardVault",
  description: "วิธีซื้อ-ขายการ์ด TCG บน CardVault ง่ายๆ ไม่กี่ขั้นตอน",
}

const STEPS = [
  {
    icon: Search,
    title: "ค้นหาการ์ด",
    desc: "เลือกซีรีส์ที่ชอบ ค้นหาการ์ดที่ต้องการ กรองตามสภาพ ราคา และอื่นๆ",
  },
  {
    icon: CreditCard,
    title: "ชำระเงิน",
    desc: "ชำระผ่าน PromptPay QR หรือบัตรเครดิต เงินจะถูกเก็บในระบบ Escrow",
  },
  {
    icon: Truck,
    title: "รอรับสินค้า",
    desc: "ผู้ขายจัดส่ง พร้อมเลข Tracking ติดตามพัสดุได้ตลอดเวลา",
  },
  {
    icon: CheckCircle,
    title: "ยืนยันรับสินค้า",
    desc: "ตรวจสอบการ์ด ยืนยันว่าถูกต้อง ระบบจะปล่อยเงินให้ผู้ขาย",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="container px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">วิธีใช้งาน CardVault</h1>
        <p className="text-muted-foreground text-lg">
          ซื้อ-ขายการ์ด TCG ง่ายๆ ปลอดภัย ไม่กี่ขั้นตอน
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {STEPS.map((step, i) => (
          <div key={i} className="flex gap-4 items-start border rounded-lg p-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <step.icon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">ขั้นตอนที่ {i + 1}</div>
              <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">พร้อมเริ่มต้น?</h2>
        <div className="flex gap-4 justify-center">
          <Link
            href="/browse"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ค้นหาการ์ด
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
          >
            สมัครสมาชิกฟรี
          </Link>
        </div>
      </div>
    </div>
  )
}
