import type { Metadata } from "next"
import Link from "next/link"
import { Search, CreditCard, Truck, CheckCircle, Shield, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "วิธีใช้งาน | CardVault",
  description: "วิธีซื้อ-ขายการ์ด TCG บน CardVault ง่ายๆ ไม่กี่ขั้นตอน",
}

const STEPS = [
  {
    icon: Search,
    title: "ค้นหาการ์ด",
    desc: "เลือกซีรีส์ที่ชอบ ค้นหาการ์ดที่ต้องการ กรองตามสภาพ ราคา และอื่นๆ",
    color: "from-purple-500 to-blue-500",
  },
  {
    icon: CreditCard,
    title: "ชำระเงิน",
    desc: "ชำระผ่าน PromptPay QR หรือบัตรเครดิต เงินจะถูกเก็บในระบบ Escrow",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Truck,
    title: "รอรับสินค้า",
    desc: "ผู้ขายจัดส่ง พร้อมเลข Tracking ติดตามพัสดุได้ตลอดเวลา",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: CheckCircle,
    title: "ยืนยันรับสินค้า",
    desc: "ตรวจสอบการ์ด ยืนยันว่าถูกต้อง ระบบจะปล่อยเงินให้ผู้ขาย",
    color: "from-amber-500 to-yellow-500",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 border-b border-zinc-800">
        <div className="absolute inset-0 bg-hero-radial opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 mb-6">
            <Shield className="w-4 h-4" />
            ปลอดภัยด้วยระบบ Escrow
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            วิธีใช้งาน <span className="text-gradient">CardVault</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            ซื้อ-ขายการ์ด TCG ง่ายๆ ปลอดภัย ไม่กี่ขั้นตอน
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="group bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="flex gap-4 items-start">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-amber-400 font-medium mb-1">ขั้นตอนที่ {i + 1}</div>
                  <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Escrow Explainer */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">ระบบ Escrow คืออะไร?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-sm font-bold text-white mb-1">เงินปลอดภัย</h3>
              <p className="text-xs text-zinc-400">เงินจะถูกเก็บในระบบ Escrow ไม่ได้ส่งให้ผู้ขายโดยตรง</p>
            </div>
            <div>
              <div className="text-3xl mb-3">👀</div>
              <h3 className="text-sm font-bold text-white mb-1">ตรวจสอบก่อน</h3>
              <p className="text-xs text-zinc-400">ผู้ซื้อได้รับการ์ดและตรวจสอบก่อน จึงจะยืนยันรับสินค้า</p>
            </div>
            <div>
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-sm font-bold text-white mb-1">ปล่อยเงิน</h3>
              <p className="text-xs text-zinc-400">เมื่อยืนยันแล้ว ระบบจะปล่อยเงินให้ผู้ขายทันที</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">พร้อมเริ่มต้น?</h2>
        <div className="flex gap-4 justify-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
          >
            ค้นหาการ์ด
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 text-white font-medium text-sm rounded-xl hover:bg-zinc-700 transition-colors"
          >
            สมัครสมาชิกฟรี
          </Link>
        </div>
      </section>
    </div>
  )
}
