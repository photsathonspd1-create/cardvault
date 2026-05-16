import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย | CardVault",
  description: "คำถามที่พบบ่อยเกี่ยวกับการซื้อ-ขายการ์ด TCG บน CardVault",
}

const FAQ_ITEMS = [
  {
    q: "CardVault คืออะไร?",
    a: "CardVault เป็น Marketplace สำหรับซื้อ-ขายการ์ด TCG (Trading Card Game) ที่ใหญ่ที่สุดในประเทศไทย รองรับ Pokemon, Yu-Gi-Oh!, MTG, One Piece และอื่นๆ พร้อมระบบ Escrow คุ้มครองทุกธุรกรรม",
  },
  {
    q: "ระบบ Escrow ทำงานอย่างไร?",
    a: "เมื่อผู้ซื้อชำระเงิน เงินจะถูกเก็บไว้ในระบบ Escrow จนกว่าผู้ซื้อยืนยันว่าได้รับสินค้าถูกต้อง จึงจะปล่อยเงินให้ผู้ขาย หากไม่มีการยืนยันภายใน 7 วัน ระบบจะปล่อยเงินอัตโนมัติ",
  },
  {
    q: "ค่าธรรมเนียมเท่าไหร่?",
    a: "สมัครสมาชิกฟรี ไม่มีค่าใช้จ่ายจนกว่าจะขายได้ ค่าธรรมเนียม platform 6% จากราคาขาย (รวมค่าธรรมเนียมการชำระเงิน)",
  },
  {
    q: "ชำระเงินด้วยวิธีไหนได้บ้าง?",
    a: "รองรับ PromptPay QR Code และบัตรเครดิต/เดบิต ผ่านระบบ Omise ชำระเงินง่าย ปลอดภัย",
  },
  {
    q: "จัดส่งด้วยขนส่งอะไรบ้าง?",
    a: "ผู้ขายสามารถเลือกขนส่งได้หลากหลาย เช Kerry Flash Express Thailand Post พร้อมเลข Tracking ติดตามพัสดุ",
  },
  {
    q: "ถ้าได้การ์ดไม่ตรงกับที่โฆษณาทำอย่างไร?",
    a: "สามารถเปิด Dispute ได้ภายใน 7 วันหลังได้รับสินค้า ทีมงานจะตรวจสอบและตัดสิน หากผู้ขายผิดจริง ระบบจะคืนเงินเต็มจำนวน",
  },
  {
    q: "ยืนยันตัวตน (KYC) จำเป็นไหม?",
    a: "สำหรับผู้ขาย แนะนำให้ยืนยันตัวตนเพื่อสร้างความน่าเชื่อถือ ผู้ขายที่ยืนยันแล้วจะได้รับ Verified Badge และโอกาสขายได้สูงขึ้น",
  },
  {
    q: "สมัครสมาชิกอย่างไร?",
    a: "สมัครง่ายๆ ด้วยอีเมลและรหัสผ่าน หรือเข้าสู่ระบบด้วย LINE (เร็วๆ นี้) ฟรีไม่มีค่าใช้จ่าย",
  },
]

export default function FAQPage() {
  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">คำถามที่พบบ่อย</h1>
      <p className="text-muted-foreground mb-8">
        รวมคำถามที่พบบ่อยเกี่ยวกับการใช้งาน CardVault
      </p>

      <div className="space-y-6">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
            <p className="text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center border rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-2">ยังมีคำถามอื่น?</h2>
        <p className="text-muted-foreground mb-4">
          ติดต่อทีมงานได้เลย เราพร้อมช่วยเหลือ
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          ติดต่อเรา
        </a>
      </div>
    </div>
  )
}
