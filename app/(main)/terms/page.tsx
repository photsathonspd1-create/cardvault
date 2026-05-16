import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน | CardVault",
  description: "ข้อกำหนดและเงื่อนไขการใช้งาน CardVault",
}

export default function TermsPage() {
  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">ข้อกำหนดการใช้งาน</h1>
      <p className="text-muted-foreground mb-8">อัปเดตล่าสุด: 17 พฤษภาคม 2569</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. การยอมรับข้อกำหนด</h2>
          <p className="text-muted-foreground">
            การเข้าถึงและใช้งานเว็บไซต์ CardVault ถือว่าท่านยอมรับข้อกำหนดการใช้งานทั้งหมด
            หากไม่ยอมรับ กรุณาหยุดใช้งานเว็บไซต์ทันที
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. การสมัครสมาชิก</h2>
          <p className="text-muted-foreground">
            ผู้ใช้ต้องมีอายุ 15 ปีขึ้นไป ข้อมูลที่ให้ต้องเป็นความจริง ผู้ใช้รับผิดชอบในการรักษาความปลอดภัยของบัญชีตนเอง
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. การซื้อ-ขาย</h2>
          <p className="text-muted-foreground">
            CardVault เป็นเพียงตัวกลาง ไม่ได้เป็นผู้ขายสินค้า ผู้ขายรับผิดชอบคุณภาพและความถูกต้องของสินค้า
            ระบบ Escrow คุ้มครองผู้ซื้อตามข้อกำหนดที่ระบุไว้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. ค่าธรรมเนียม</h2>
          <p className="text-muted-foreground">
            ค่าธรรมเนียม platform 6% จากราคาขาย รวมค่าธรรมเนียมการชำระเงิน
            ไม่มีค่าใช้จ่ายสำหรับผู้ซื้อ
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. ข้อห้าม</h2>
          <p className="text-muted-foreground">
            ห้ามลงขายสินค้าปลอม สินค้าผิดกฎหมาย หรือสินค้าที่ละเมิดลิขสิทธิ์
            ห้ามใช้ platform เพื่อการฉ้อโกง หรือกิจกรรมที่ผิดกฎหมาย
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. การระงับบัญชี</h2>
          <p className="text-muted-foreground">
            CardVault สงวนสิทธิ์ในการระงับหรือลบบัญชีที่ละเมิดข้อกำหนด
            โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
          </p>
        </section>
      </div>
    </div>
  )
}
