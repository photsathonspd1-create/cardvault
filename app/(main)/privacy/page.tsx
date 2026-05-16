import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | CardVault",
  description: "นโยบายความเป็นส่วนตัวของ CardVault",
}

export default function PrivacyPage() {
  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">นโยบายความเป็นส่วนตัว</h1>
      <p className="text-muted-foreground mb-8">อัปเดตล่าสุด: 17 พฤษภาคม 2569</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. ข้อมูลที่เรารวบรวม</h2>
          <p className="text-muted-foreground">
            ข้อมูลส่วนตัว: ชื่อ อีเมล เบอร์โทร ที่อยู่จัดส่ง<br />
            ข้อมูลการชำระเงิน: ประวัติธุรกรรม (ไม่เก็บข้อมูลบัตรเครดิต)<br />
            ข้อมูลอุปกรณ์: IP address, browser, OS
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. การใช้ข้อมูล</h2>
          <p className="text-muted-foreground">
            ใช้เพื่อให้บริการ ประมวลผลธุรกรรม ส่งการแจ้งเตือน ป้องกันการฉ้อโกง
            และปรับปรุงประสบการณ์ผู้ใช้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. การเปิดเผยข้อมูล</h2>
          <p className="text-muted-foreground">
            ไม่เปิดเผยข้อมูลส่วนตัวแก่บุคคลที่สาม ยกเว้น:<br />
            - ผู้ขาย/ผู้ซื้อ (ข้อมูลที่จำเป็นต่อธุรกรรม)<br />
            - ผู้ให้บริการชำระเงิน (Omise)<br />
            - ตามกฎหมายกำหนด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. ความปลอดภัย</h2>
          <p className="text-muted-foreground">
            ใช้ HTTPS, เข้ารหัสข้อมูล, มีระบบ rate limiting และ monitoring
            เพื่อป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. สิทธิ์ของผู้ใช้</h2>
          <p className="text-muted-foreground">
            สามารถขอดู แก้ไข หรือลบข้อมูลส่วนตัวได้ โดยติดต่อ support@cardvault.co.th
          </p>
        </section>
      </div>
    </div>
  )
}
