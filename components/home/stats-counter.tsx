"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

interface StatsCounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  label: string
  icon: React.ReactNode
}

export function StatsCounter({ end, suffix = "", prefix = "", duration = 2, label, icon }: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, end, duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-amber-400 mb-1">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-white">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-zinc-400 mt-1">{label}</div>
    </motion.div>
  )
}
