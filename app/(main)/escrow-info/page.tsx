import type { Metadata } from "next"
import { Shield, Clock, AlertTriangle, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "ระบบ Escrow | CardVault",
  description: "ระบบ Escrow คุ้มครองทุกธุรกรรม ปลอดภัยทั้งผู้ซื้อและผู้ขาย",
}

export default function EscrowInfoPage() {
  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <Shield className="w-16 h-16 mx-auto text-purple-600 mb-4" />
        <h1 className="text-3xl font-bold mb-2">ระบบ Escrow</h1>
        <p className="text-muted-foreground text-lg">
          คุ้มครองทุกธุรกรรม ปลอดภัยทั้งผู้ซื้อและผู้ขาย
        </p>
      </div>

      <div className="space-y-8">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">ขั้นตอนการทำงาน</h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-green-600">1</span>
              </div>
              <div>
                <h3 className="font-medium">ผู้ซื้อชำระเงิน</h3>
                <p className="text-sm text-muted-foreground">เงินจะถูกเก็บไว้ในระบบ Escrow (HOLDING)</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="font-medium">ผู้ขายจัดส่งสินค้า</h3>
                <p className="text-sm text-muted-foreground">อัพเดทสถานะเป็น SHIPPED พร้อมเลข Tracking</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <h3 className="font-medium">ผู้ซื้อยืนยันรับสินค้า</h3>
                <p className="text-sm text-muted-foreground">ตรวจสอบแล้วยืนยัน ระบบจะปล่อยเงินให้ผู้ขาย (RELEASED)</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">ปล่อยเงินอัตโนมัติ 7 วัน</h3>
                <p className="text-sm text-muted-foreground">หากผู้ซื้อไม่ยืนยันภายใน 7 วัน ระบบจะปล่อยเงินอัตโนมัติ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            กรณีพิพาท (Dispute)
          </h2>
          <p className="text-muted-foreground mb-4">
            หากได้รับสินค้าไม่ตรงกับที่โฆษณา หรือมีปัญหา สามารถเปิด Dispute ได้ภายใน 7 วัน
            เงินจะถูก Freeze ไว้จนกว่าทีมงานจะตรวจสอบและตัดสิน
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ผู้ซื้อได้รับสินค้าไม่ตรง → คืนเงินเต็มจำนวน
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              สินค้าเสียหายระหว่างจัดส่ง → คืนเงินเต็มจำนวน
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ผู้ขายไม่จัดส่ง → คืนเงินเต็มจำนวน
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
