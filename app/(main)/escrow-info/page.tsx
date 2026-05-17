import type { Metadata } from "next"
import { Shield, Clock, AlertTriangle, CheckCircle, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ระบบ Escrow | CardVault",
  description: "ระบบ Escrow คุ้มครองทุกธุรกรรม ปลอดภัยทั้งผู้ซื้อและผู้ขาย",
}

export default function EscrowInfoPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <section className="relative py-20 border-b border-zinc-800">
        <div className="absolute inset-0 bg-hero-radial opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 mb-6">
            <Lock className="w-4 h-4" />
            ระบบ Escrow
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            เงินคุณ <span className="text-gradient">ปลอดภัย</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            ระบบ Escrow คุ้มครองทุกธุรกรรม ปลอดภัยทั้งผู้ซื้อและผู้ขาย
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        {/* How it works */}
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Escrow ทำงานอย่างไร?</h2>
        <div className="grid md:grid-cols-5 gap-4 mb-16">
          {[
            { icon: "💳", title: "ผู้ซื้อชำระเงิน", desc: "เงินเข้าระบบ Escrow" },
            { icon: "📦", title: "ผู้ขายจัดส่ง", desc: "พร้อม Tracking" },
            { icon: "👀", title: "ผู้ซื้อตรวจสอบ", desc: "ตรวจสอบการ์ด" },
            { icon: "✅", title: "ยืนยันรับสินค้า", desc: "กดยืนยันในระบบ" },
            { icon: "💰", title: "ปล่อยเงิน", desc: "เงินเข้าผู้ขาย" },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="text-xs text-amber-400 font-medium mb-1">{i + 1}</div>
              <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-zinc-500">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Protection */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="font-bold text-white">คุ้มครองผู้ซื้อ</h3>
            </div>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                เงินถูกเก็บใน Escrow จนกว่าจะยืนยันรับสินค้า
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                แจ้งข้อพิพาทได้ภายใน 7 วัน
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                คืนเงินเต็มจำนวนหากการ์ดเป็นของปลอม
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                Escrow ปล่อยอัตโนมัติหลัง 7 วันหากไม่มีปัญหา
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-white">คุ้มครองผู้ขาย</h3>
            </div>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                เงินยืนยันก่อนจัดส่ง ไม่ต้องกลัวผู้ซื้อไม่จ่าย
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                มีหลักฐาน Tracking ยืนยันการจัดส่ง
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                ได้รับเงินทันทีเมื่อผู้ซื้อยืนยัน
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                Admin ตัดสินอย่างเป็นธรรมหากมีข้อพิพาท
              </li>
            </ul>
          </div>
        </div>

        {/* Auto release */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-amber-500/30 mb-16">
          <div className="flex items-start gap-4">
            <Clock className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Escrow ปล่อยอัตโนมัติ</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                หากผู้ซื้อไม่ได้กดยืนยันหรือแจ้งปัญหาภายใน <span className="text-amber-400 font-medium">7 วัน</span> หลังจากจัดส่ง
                ระบบจะปล่อยเงินให้ผู้ขายโดยอัตโนมัติ เพื่อป้องกันผู้ซื้อที่ไม่ยืนยันรับสินค้า
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
          >
            เริ่มซื้อ-ขายอย่างปลอดภัย
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
