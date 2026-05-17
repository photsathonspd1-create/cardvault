import type { Metadata } from "next"
import { Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | CardVault",
  description: "นโยบายความเป็นส่วนตัวของ CardVault",
}

export default function PrivacyPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <section className="relative py-20 border-b border-zinc-800">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 mb-6">
            <Lock className="w-4 h-4" />
            ความเป็นส่วนตัว
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-sm text-zinc-500">อัปเดตล่าสุด: 17 พฤษภาคม 2569</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        {[
          {
            title: "ข้อมูลที่เราเก็บ",
            items: [
              "ชื่อ, อีเมล, เบอร์โทร (ตอนสมัคร)",
              "ที่อยู่จัดส่ง (ตอนสั่งซื้อ)",
              "ข้อมูลบัตรประชาชน (ตอนยืนยันตัวตน KYC)",
              "ประวัติการซื้อ-ขาย และการใช้งาน",
            ],
          },
          {
            title: "วิธีใช้ข้อมูล",
            items: [
              "ประมวลผลธุรกรรมซื้อ-ขาย",
              "ยืนยันตัวตนและป้องกันการทุจริต",
              "ปรับปรุงบริการและประสบการณ์ผู้ใช้",
              "ส่งข้อมูลข่าวสารและโปรโมชั่น (หากยินยอม)",
            ],
          },
          {
            title: "การเปิดเผยข้อมูล",
            items: [
              "ไม่เปิดเผยข้อมูลส่วนตัวให้บุคคลที่สาม ยกเว้น:",
              "ผู้ขาย/ผู้ซื้อ (เฉพาะข้อมูลที่จำเป็นต่อธุรกรรม)",
              "หน่วยงานราชการ (เมื่อกฎหมายกำหนด)",
              "ผู้ให้บริการชำระเงิน (เพื่อประมวลผลธุรกรรม)",
            ],
          },
          {
            title: "ความปลอดภัย",
            items: [
              "เข้ารหัสข้อมูลทั้งหมดด้วย SSL/TLS",
              "เก็บข้อมูลบัตรประชาชนในระบบที่เข้ารหัส",
              "ไม่เก็บข้อมูลบัตรเครดิต/เดบิต",
              "ตรวจสอบความปลอดภัยเป็นประจำ",
            ],
          },
          {
            title: "สิทธิ์ของคุณ",
            items: [
              "เข้าถึงและดาวน์โหลดข้อมูลส่วนตัว",
              "แก้ไขหรือลบข้อมูลส่วนตัว",
              "ถอนความยินยอมในการรับข่าวสาร",
              "ขอลบบัญชีและข้อมูลทั้งหมด",
            ],
          },
        ].map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
            <ul className="space-y-2">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-amber-400 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <p className="text-sm text-zinc-400">
            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว ติดต่อเราได้ที่{" "}
            <a href="mailto:privacy@cardvault.co.th" className="text-amber-400 hover:underline">
              privacy@cardvault.co.th
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
