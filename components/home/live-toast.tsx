"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Package } from "lucide-react"

interface LiveToastItem {
  id: string
  cardName: string
  amount: string
  buyer: string
  timeAgo: string
}

const MOCK_TOASTS: LiveToastItem[] = [
  { id: "1", cardName: "Charizard VMAX", amount: "฿12,500", buyer: "A***", timeAgo: "2 นาทีที่แล้ว" },
  { id: "2", cardName: "Blue-Eyes White Dragon", amount: "฿8,900", buyer: "S***", timeAgo: "5 นาทีที่แล้ว" },
  { id: "3", cardName: "Monkey D. Luffy SEC", amount: "฿3,200", buyer: "P***", timeAgo: "8 นาทีที่แล้ว" },
  { id: "4", cardName: "Black Lotus (Proxy)", amount: "฿1,500", buyer: "N***", timeAgo: "12 นาทีที่แล้ว" },
  { id: "5", cardName: "Pikachu V Full Art", amount: "฿4,800", buyer: "K***", timeAgo: "15 นาทีที่แล้ว" },
]

export function LiveToast({ initialData }: { initialData?: LiveToastItem[] }) {
  const items = initialData && initialData.length > 0 ? initialData : MOCK_TOASTS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [items.length])

  const current = items[currentIndex]

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 z-40 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40, y: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-3 shadow-xl shadow-black/30 max-w-[280px]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {current.cardName}
                  </p>
                  <p className="text-[11px] text-amber-400 font-bold">{current.amount}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    ผู้ซื้อ {current.buyer} · {current.timeAgo}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
