"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const LIVE_PURCHASES = [
  { card: "Charizard VMAX", price: "฿28,900", time: "เมื่อกี้" },
  { card: "Blue-Eyes White Dragon", price: "฿12,500", time: "2 นาทีที่แล้ว" },
  { card: "Luffy Leader OP-01", price: "฿8,700", time: "5 นาทีที่แล้ว" },
  { card: "Pikachu VMAX", price: "฿15,300", time: "8 นาทีที่แล้ว" },
]

export function LiveToast() {
  const [visible, setVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!visible || !isClient) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_PURCHASES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [visible, isClient])

  if (!isClient || !visible) return null

  const purchase = LIVE_PURCHASES[currentIndex]

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 shadow-2xl min-w-[220px] max-w-[280px]"
        >
          <button
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="ปิด"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 mb-0.5">มีคนเพิ่งซื้อ</p>
              <p className="text-sm font-semibold text-white">{purchase.card}</p>
              <p className="text-sm font-bold text-amber-400">{purchase.price}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{purchase.time}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
