import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav"
import { LiveToast } from "@/components/shared/live-toast"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
      <LiveToast />
    </div>
  )
}
