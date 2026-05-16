import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-gold flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="font-bold text-xl">
                <span className="text-purple-400">Card</span>
                <span className="text-gold">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Marketplace ซื้อ-ขายการ์ด TCG ที่ใหญ่ที่สุดในประเทศไทย
              ปลอดภัยด้วยระบบ Escrow
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Marketplace</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">
                ค้นหาการ์ด
              </Link>
              <Link href="/browse?series=POKEMON" className="text-sm text-muted-foreground hover:text-foreground">
                Pokemon
              </Link>
              <Link href="/browse?series=YUGIOH" className="text-sm text-muted-foreground hover:text-foreground">
                Yu-Gi-Oh!
              </Link>
              <Link href="/browse?series=MTG" className="text-sm text-muted-foreground hover:text-foreground">
                Magic: The Gathering
              </Link>
              <Link href="/browse?series=ONE_PIECE" className="text-sm text-muted-foreground hover:text-foreground">
                One Piece
              </Link>
            </nav>
          </div>

          {/* Seller */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">สำหรับผู้ขาย</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/sell" className="text-sm text-muted-foreground hover:text-foreground">
                เริ่มขาย
              </Link>
              <Link href="/sell/new" className="text-sm text-muted-foreground hover:text-foreground">
                ลงขายสินค้า
              </Link>
              <Link href="/sell/listings" className="text-sm text-muted-foreground hover:text-foreground">
                รายการขาย
              </Link>
              <Link href="/sell/orders" className="text-sm text-muted-foreground hover:text-foreground">
                ออเดอร์
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">ช่วยเหลือ</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                คำถามที่พบบ่อย
              </Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                วิธีใช้งาน
              </Link>
              <Link href="/escrow-info" className="text-sm text-muted-foreground hover:text-foreground">
                ระบบ Escrow
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                ติดต่อเรา
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CardVault Thailand. สงวนลิขสิทธิ์
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
