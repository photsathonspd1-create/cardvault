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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://cardvault.co.th"),
  title: {
    default: "CardVault — ตลาดซื้อ-ขายการ์ด TCG อันดับ 1 ของไทย",
    template: "%s | CardVault",
  },
  description:
    "CardVault — ตลาดซื้อ-ขายการ์ด TCG ที่ใหญ่ที่สุดในประเทศไทย ด้วยระบบ Escrow คุ้มครองทุกคำสั่งซื้อ Pokemon, Yu-Gi-Oh!, MTG, One Piece",
  keywords: [
    "การ์ด TCG",
    "Pokemon",
    "Yu-Gi-Oh",
    "Magic The Gathering",
    "One Piece",
    "ซื้อขายการ์ด",
    "CardVault",
    "TCG Marketplace",
    "Thailand",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "CardVault",
    title: "CardVault — ตลาดซื้อ-ขายการ์ด TCG อันดับ 1 ของไทย",
    description:
      "ซื้อ-ขายการ์ด TCG อย่างปลอดภัยด้วยระบบ Escrow คุ้มครองทุกคำสั่งซื้อ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CardVault - TCG Marketplace Thailand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CardVault — ตลาดซื้อ-ขายการ์ด TCG",
    description: "ซื้อ-ขายการ์ด TCG อย่างปลอดภัยด้วยระบบ Escrow",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
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
