"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface PriceDataPoint {
  date: string
  price: number
}

interface PriceChartProps {
  data: PriceDataPoint[]
  title?: string
  timeRanges?: number[]
  className?: string
}

const TIME_RANGE_LABELS: Record<number, string> = {
  30: "30 วัน",
  90: "90 วัน",
  180: "180 วัน",
}

export function PriceChart({
  data,
  title = "ประวัติราคา",
  timeRanges = [30, 90, 180],
  className,
}: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState(timeRanges[0])

  // Filter data by selected range
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - selectedRange)

  const filteredData = data
    .filter((d) => new Date(d.date) >= cutoffDate)
    .map((d) => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      }),
    }))

  // Stats
  const prices = filteredData.map((d) => d.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : 0
  const oldestPrice = prices.length > 0 ? prices[0] : 0
  const priceChange = oldestPrice > 0 ? ((latestPrice - oldestPrice) / oldestPrice) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            {title}
          </CardTitle>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? "purple" : "ghost"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setSelectedRange(range)}
              >
                {TIME_RANGE_LABELS[range] ?? `${range} วัน`}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">ล่าสุด: </span>
            <span className="font-bold text-gold">{formatPrice(latestPrice)}</span>
          </div>
          {priceChange !== 0 && (
            <div className={priceChange > 0 ? "text-green-400" : "text-red-400"}>
              {priceChange > 0 ? "↑" : "↓"} {Math.abs(priceChange).toFixed(1)}%
            </div>
          )}
          <div className="text-muted-foreground">
            ต่ำสุด: {formatPrice(minPrice)} • สูงสุด: {formatPrice(maxPrice)}
          </div>
        </div>

        {/* Chart */}
        {filteredData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            ยังไม่มีข้อมูลราคา
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: "#737373" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#737373" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `฿${(v / 100).toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [formatPrice(Number(value ?? 0)), "ราคา"]}
                labelStyle={{ color: "#a3a3a3" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#D4AF37" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
