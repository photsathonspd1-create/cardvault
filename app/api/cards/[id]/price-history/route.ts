import { prisma } from "@/lib/prisma"

/**
 * GET /api/cards/[id]/price-history?days=30|90|180
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") ?? "30")

    const validDays = [30, 90, 180].includes(days) ? days : 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - validDays)

    const history = await prisma.priceHistory.findMany({
      where: {
        cardId: params.id,
        recordedAt: { gte: cutoffDate },
      },
      orderBy: { recordedAt: "asc" },
      select: {
        price: true,
        condition: true,
        source: true,
        recordedAt: true,
      },
    })

    // Group by date (take average if multiple per day)
    const byDate = new Map<string, number[]>()
    for (const entry of history) {
      const dateKey = entry.recordedAt.toISOString().split("T")[0]
      if (!byDate.has(dateKey)) byDate.set(dateKey, [])
      byDate.get(dateKey)!.push(entry.price)
    }

    const data = Array.from(byDate.entries())
      .map(([date, prices]) => ({
        date,
        price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return new Response(JSON.stringify({ data, days: validDays }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Price history error:", error)
    return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
