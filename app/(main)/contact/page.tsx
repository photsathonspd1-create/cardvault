import type { Metadata } from "next"
import { Mail, MessageCircle, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "ติดต่อเรา | CardVault",
  description: "ติดต่อทีมงาน CardVault เราพร้อมช่วยเหลือ",
}

export default function ContactPage() {
  return (
    <div className="container px-4 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">ติดต่อเรา</h1>
        <p className="text-muted-foreground text-lg">
          มีคำถาม ข้อเสนอแนะ หรือต้องการความช่วยเหลือ? ติดต่อเราได้เลย
        </p>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 flex gap-4 items-start">
          <Mail className="w-8 h-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">อีเมล</h3>
            <p className="text-muted-foreground mb-2">ส่งอีเมลหาเราได้ตลอด 24 ชั่วโมง</p>
            <a href="mailto:support@cardvault.co.th" className="text-purple-600 hover:underline font-medium">
              support@cardvault.co.th
            </a>
          </div>
        </div>

        <div className="border rounded-lg p-6 flex gap-4 items-start">
          <MessageCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">LINE Official</h3>
            <p className="text-muted-foreground mb-2">แอด LINE เพื่อแชทกับทีมงาน</p>
            <span className="text-green-600 font-medium">@cardvault</span>
          </div>
        </div>

        <div className="border rounded-lg p-6 flex gap-4 items-start">
          <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">เวลาทำการ</h3>
            <p className="text-muted-foreground">
              จันทร์ - ศุกร์: 09:00 - 18:00 น.<br />
              เสาร์ - อาทิตย์: 10:00 - 16:00 น.<br />
              <span className="text-sm">(ตอบกลับภายใน 24 ชั่วโมง)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
