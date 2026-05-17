"use client"

import { useState } from "react"
import Image from "next/image"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_HOT_DATA = {
  up: [
    { name: "Charizard VMAX", set: "Shining Fates", price: "฿28,900", change: "+12.5%", image: "https://images.pokemontcg.io/swsh4/20_hires.png" },
    { name: "Moonbreon", set: "Evolving Skies", price: "฿45,000", change: "+8.3%", image: "https://images.pokemontcg.io/swsh7/215_hires.png" },
    { name: "Pikachu VMAX", set: "Vivid Voltage", price: "฿15,300", change: "+6.1%", image: "https://images.pokemontcg.io/swsh4/44_hires.png" },
    { name: "Blue-Eyes Alt Art", set: "LOB", price: "฿32,000", change: "+4.8%", image: "https://images.pokemontcg.io/xy12/1_hires.png" },
    { name: "Luffy Leader", set: "OP-01", price: "฿8,700", change: "+3.2%", image: "https://images.pokemontcg.io/swsh11/1_hires.png" },
  ],
  down: [
    { name: "Gold Star Eevee", set: "POP Series 5", price: "฿52,000", change: "-5.2%", image: "https://images.pokemontcg.io/swsh4/20_hires.png" },
    { name: "Lugia V Alt Art", set: "Silver Tempest", price: "฿18,500", change: "-3.8%", image: "https://images.pokemontcg.io/swsh12/186_hires.png" },
    { name: "Mew VMAX", set: "Fusion Strike", price: "฿9,200", change: "-2.1%", image: "https://images.pokemontcg.io/swsh9/114_hires.png" },
  ],
}

export function HotThisWeek() {
  const [tab, setTab] = useState<"up" | "down">("up")
  const data = MOCK_HOT_DATA[tab]

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-white">กำลัง Hot สัปดาห์นี้</h3>
        <span className="ml-auto text-xs text-amber-400 cursor-pointer hover:text-amber-300">
          ดูทั้งหมด →
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setTab("up")}
          className={cn(
            "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
            tab === "up" ? "bg-green-500/20 text-green-400" : "text-zinc-400 hover:text-zinc-300"
          )}
        >
          ราคาขึ้น
        </button>
        <button
          onClick={() => setTab("down")}
          className={cn(
            "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
            tab === "down" ? "bg-red-500/20 text-red-400" : "text-zinc-400 hover:text-zinc-300"
          )}
        >
          ราคาลง
        </button>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-zinc-800">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{item.name}</p>
              <p className="text-[10px] text-zinc-500">{item.set}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-white">{item.price}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded",
                  tab === "up"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {tab === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
