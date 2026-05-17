"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { TrendingUp, ShoppingBag, Eye, Star } from "lucide-react"

interface MonthlyRevenueData {
  month: string
  revenue: number
  orders: number
}

interface TopCardData {
  name: string
  soldCount: number
  revenue: number
}

interface AnalyticsChartsProps {
  monthlyRevenue: MonthlyRevenueData[]
  topCards: TopCardData[]
  totalViews: number
  totalOrders: number
  conversionRate: number
}

export function AnalyticsCharts({
  monthlyRevenue,
  topCards,
  totalViews,
  totalOrders,
  conversionRate,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">ยอดเข้าชม</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">ออเดอร์</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            รายได้รายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              ยังไม่มีข้อมูลรายได้
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="month"
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
                  formatter={(value: number | string | readonly (string | number)[] | undefined) => [formatPrice(Number(value ?? 0)), "รายได้"]}
                />
                <Bar dataKey="revenue" fill="#9355FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Selling Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">การ์ดขายดี Top 10</CardTitle>
        </CardHeader>
        <CardContent>
          {topCards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              ยังไม่มีข้อมูลการขาย
            </p>
          ) : (
            <div className="space-y-2">
              {topCards.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ขายได้ {card.soldCount} ใบ
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gold">
                    {formatPrice(card.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
