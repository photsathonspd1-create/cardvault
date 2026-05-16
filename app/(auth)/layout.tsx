import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute inset-0 hero-gradient opacity-50" />
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-gold flex items-center justify-center">
              <span className="text-white font-bold">CV</span>
            </div>
            <span className="font-bold text-2xl">
              <span className="text-purple-400">Card</span>
              <span className="text-gold">Vault</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
