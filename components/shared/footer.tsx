import Link from "next/link"
import { Shield } from "lucide-react"

const FOOTER_LINKS = {
  marketplace: [
    { label: "ซื้อการ์ด", href: "/browse" },
    { label: "ลงขายการ์ด", href: "/sell/new" },
    { label: "ซีรีส์การ์ด", href: "/browse" },
    { label: "การ์ดยอดนิยม", href: "/browse?sort=popular" },
    { label: "ลงขายล่าสุด", href: "/browse?sort=newest" },
  ],
  sellers: [
    { label: "เริ่มขายการ์ด", href: "/sell/new" },
    { label: "Seller Dashboard", href: "/sell" },
    { label: "คำแนะนำสำหรับผู้ขาย", href: "/how-it-works" },
    { label: "ระบบ Escrow", href: "/escrow-info" },
    { label: "อัปเกรดเป็น PRO", href: "/sell/subscription" },
  ],
  help: [
    { label: "วิธีการใช้งาน", href: "/how-it-works" },
    { label: "ตรวจสอบผู้ขาย", href: "/check" },
    { label: "คำถามที่พบบ่อย", href: "/faq" },
    { label: "ติดต่อเรา", href: "/contact" },
    { label: "เงื่อนไขการใช้งาน", href: "/terms" },
    { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
  ],
}

const SOCIAL_LINKS = [
  { label: "LINE", href: "https://line.me/ti/p/~cardvault", icon: "💬" },
  { label: "Facebook", href: "https://facebook.com/cardvault.th", icon: "📘" },
  { label: "Twitter", href: "https://twitter.com/cardvault_th", icon: "🐦" },
  { label: "YouTube", href: "https://youtube.com/@cardvault", icon: "📺" },
]

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold text-white">CardVault</span>
            </Link>
            <p className="text-sm text-zinc-400 mb-4 max-w-xs">
              ตลาดซื้อ-ขายการ์ด TCG ที่ใหญ่ที่สุดในประเทศไทย
              ปลอดภัยด้วยระบบ Escrow
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-sm transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Marketplace</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.marketplace.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">สำหรับผู้ขาย</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.sellers.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            CardVault © {new Date().getFullYear()}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
            <Link href="/how-it-works" className="hover:text-zinc-300 transition-colors">
              เกี่ยวกับเรา
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              เงื่อนไขการใช้งาน
            </Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
