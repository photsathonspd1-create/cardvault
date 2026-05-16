import type { Metadata } from "next"
import { Inter, Noto_Sans_Thai } from "next/font/google"
import { Providers } from "@/components/shared/providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-thai",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "CardVault Thailand — Marketplace ซื้อ-ขายการ์ด TCG",
  description:
    "Marketplace ซื้อ-ขายการ์ด TCG ที่ใหญ่ที่สุดในประเทศไทย Pokemon, Yu-Gi-Oh!, MTG, One Piece ปลอดภัยด้วยระบบ Escrow",
  keywords: [
    "การ์ด TCG",
    "Pokemon",
    "Yu-Gi-Oh",
    "Magic The Gathering",
    "One Piece",
    "ซื้อขายการ์ด",
    "CardVault",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="dark">
      <body
        className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
