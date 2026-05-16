import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Header } from "@/components/shared/header"
import { SellerSidebar } from "@/components/shared/seller-sidebar"

export default async function SellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/sell")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <SellerSidebar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
