import type { Metadata } from "next"
import { Mail, MessageCircle, Clock, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "ติดต่อเรา | CardVault",
  description: "ติดต่อทีมงาน CardVault เราพร้อมช่วยเหลือ",
}

export default function ContactPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <section className="relative py-20 border-b border-zinc-800">
        <div className="absolute inset-0 bg-hero-radial opacity-50" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            ติดต่อ<span className="text-gradient">เรา</span>
          </h1>
          <p className="text-lg text-zinc-400">ทีมงาน CardVault พร้อมช่วยเหลือคุณ</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">LINE Official</h3>
            <p className="text-sm text-zinc-400 mb-3">แชทสอบถามทีมงานโดยตรง ตอบเร็วที่สุด</p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white text-sm font-bold rounded-xl hover:bg-[#05b34a] transition-colors"
            >
              💬 เพิ่มเพื่อน LINE
            </a>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">อีเมล</h3>
            <p className="text-sm text-zinc-400 mb-3">ส่งอีเมลหาเรา ตอบภายใน 24 ชั่วโมง</p>
            <a
              href="mailto:support@cardvault.co.th"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@cardvault.co.th
            </a>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">เวลาทำการ</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400">จันทร์ — ศุกร์</p>
              <p className="text-white font-medium">09:00 — 18:00 น.</p>
            </div>
            <div>
              <p className="text-zinc-400">เสาร์ — อาทิตย์</p>
              <p className="text-white font-medium">10:00 — 16:00 น.</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-500">
            <Shield className="w-3.5 h-3.5" />
            ระบบ Escrow ทำงานอัตโนมัติ 24/7
          </div>
        </div>
      </section>
    </div>
  )
}
