import { prisma } from "@/lib/prisma"
import { ScammerCheckClient } from "./check-client"

export const dynamic = "force-dynamic"

export default async function ScammerCheckPage() {
  const recentReports = await prisma.scammerReport.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const totalReports = await prisma.scammerReport.count({
    where: { status: "APPROVED" },
  })

  return (
    <ScammerCheckClient
      recentReports={recentReports.map((r) => ({
        id: r.id,
        scammerName: r.lineId ?? r.facebookUrl ?? r.phone ?? r.bankNumber ?? "ไม่ทราบ",
        scamMethod: r.description?.slice(0, 100) ?? null,
        reportCount: 1,
        createdAt: r.createdAt,
      }))}
      totalReports={totalReports}
    />
  )
}
