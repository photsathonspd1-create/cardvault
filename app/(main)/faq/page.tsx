import type { Metadata } from "next"
import { HelpCircle, ChevronDown } from "lucide-react"

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย | CardVault",
  description: "คำถามที่พบบ่อยเกี่ยวกับการซื้อ-ขายการ์ด TCG บน CardVault",
}

const FAQ_ITEMS = [
  {
    q: "CardVault คืออะไร?",
    a: "CardVault เป็นตลาดซื้อ-ขายการ์ด TCG ออนไลน์อันดับ 1 ของไทย รองรับ Pokemon, Yu-Gi-Oh!, MTG, One Piece และอื่นๆ ด้วยระบบ Escrow คุ้มครองทุกธุรกรรม",
  },
  {
    q: "ระบบ Escrow ทำงานอย่างไร?",
    a: "เมื่อผู้ซื้อชำระเงิน เงินจะถูกเก็บในระบบ Escrow ไม่ได้ส่งให้ผู้ขายโดยตรง ผู้ซื้อจะได้รับการ์ดและตรวจสอบก่อน หากถูกต้องจึงยืนยันรับสินค้า ระบบจะปล่อยเงินให้ผู้ขาย หากมีปัญหาสามารถแจ้งข้อพิพาทได้",
  },
  {
    q: "ขายการ์ดบน CardVault ต้องทำอย่างไร?",
    a: "สมัครสมาชิกฟรี → ไปที่ 'ลงขายการ์ด' → สแกนหรืออัปโหลดรูปการ์ด → ตั้งราคา → รอ admin อนุมัติ (Bronze tier) หรือลงขายทันที (Gold tier)",
  },
  {
    q: "ค่าธรรมเนียมเท่าไร?",
    a: "Bronze: 5% ต่อรายการ | Silver: 4% | Gold: 3% | Pro: 2% ไม่มีค่าสมัคร ไม่มีค่ารายเดือน (ยกเว้น Pro)",
  },
  {
    q: "จ่ายเงินช่องทางไหนได้บ้าง?",
    a: "PromptPay QR, บัตรเครดิต/เดบิต (Visa, Mastercard), Rabbit LINE Pay ทุกช่องทางผ่านระบบ Escrow",
  },
  {
    q: "ถ้าได้การ์ดปลอมทำอย่างไร?",
    a: "แจ้งข้อพิพาท (Dispute) ภายใน 7 วัน พร้อมหลักฐาน ทีมงานจะตรวจสอบและคืนเงินเต็มจำนวนหากการ์ดเป็นของปลอม",
  },
  {
    q: "Verified Seller คืออะไร?",
    a: "ผู้ขายที่ยืนยันตัวตน (KYC) และมีประวัติขายดี ได้รับ tier Bronze → Silver → Gold ตามยอดขายและคะแนนรีวิว",
  },
  {
    q: "ตรวจสอบผู้ขายก่อนซื้อได้อย่างไร?",
    a: "ใช้ฟีเจอร์ 'ตรวจสอบผู้ขาย' ค้นหาชื่อ LINE, Facebook, หรือเบอร์โทร ในฐานข้อมูลมิจฉาชีพ TCG ไทย ที่อัพเดทโดยชุมชน",
  },
]

export default function FAQPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <section className="relative py-20 border-b border-zinc-800">
        <div className="absolute inset-0 bg-hero-radial opacity-50" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 mb-6">
            <HelpCircle className="w-4 h-4" />
            คำถามที่พบบ่อย
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            มีคำถาม? <span className="text-gradient">เราตอบให้</span>
          </h1>
          <p className="text-lg text-zinc-400">รวมคำถามที่พบบ่อยเกี่ยวกับ CardVault</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={i}
            className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden"
          >
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
              <span className="font-semibold text-white text-sm pr-4">{item.q}</span>
              <ChevronDown className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform shrink-0" />
            </summary>
            <div className="px-5 pb-5">
              <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </section>
    </div>
  )
}
