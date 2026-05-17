import type { Metadata } from "next"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน | CardVault",
  description: "ข้อกำหนดและเงื่อนไขการใช้งาน CardVault",
}

export default function TermsPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <section className="relative py-20 border-b border-zinc-800">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 mb-6">
            <FileText className="w-4 h-4" />
            เอกสารทางกฎหมาย
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">ข้อกำหนดการใช้งาน</h1>
          <p className="text-sm text-zinc-500">อัปเดตล่าสุด: 17 พฤษภาคม 2569</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        {[
          {
            title: "1. การยอมรับข้อกำหนด",
            content: "การใช้งาน CardVault ถือว่าคุณยอมรับข้อกำหนดทั้งหมด หากไม่ยอมรับ กรุณาหยุดใช้งานทันที",
          },
          {
            title: "2. บัญชีผู้ใช้",
            content: "คุณต้องมีอายุอย่างน้อย 15 ปี ข้อมูลที่ให้ต้องเป็นความจริง คุณรับผิดชอบต่อความปลอดภัยของบัญชีตนเอง",
          },
          {
            title: "3. การซื้อ-ขาย",
            content: "ทุกธุรกรรมผ่านระบบ Escrow ผู้ขายต้องจัดส่งภายใน 48 ชั่วโมงหลังยืนยันออเดอร์ ผู้ซื้อมีเวลา 7 วันในการยืนยันรับสินค้าหรือแจ้งปัญหา",
          },
          {
            title: "4. ค่าธรรมเนียม",
            content: "Bronze: 5% | Silver: 4% | Gold: 3% | Pro: 2% ค่าธรรมเนียมจะถูกหักจากราคาขาย ไม่มีค่าสมัครสมาชิก",
          },
          {
            title: "5. ข้อห้าม",
            content: "ห้ามขายการ์ดปลอม ห้ามใช้ข้อมูลเท็จ ห้ามทุจริต ห้ามละเมิดทรัพย์สินทางปัญญา การละเมิดจะส่งผลให้ถูกระงับบัญชี",
          },
          {
            title: "6. ข้อพิพาท",
            content: "หากมีปัญหา แจ้งข้อพิพาทภายใน 7 วัน ทีมงานจะตรวจสอบและตัดสินภายใน 72 ชั่วโมง การตัดสินของทีมงานถือเป็นที่สิ้นสุด",
          },
          {
            title: "7. การระงับบัญชี",
            content: "CardVault สงวนสิทธิ์ในการระงับหรือลบบัญชีที่ละเมิดข้อกำหนด โดยไม่ต้องแจ้งล่วงหน้า",
          },
        ].map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-bold text-white mb-2">{section.title}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
