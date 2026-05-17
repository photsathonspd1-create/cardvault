import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Header } from "@/components/shared/header"
import { AdminSidebar } from "@/components/shared/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <AdminSidebar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
