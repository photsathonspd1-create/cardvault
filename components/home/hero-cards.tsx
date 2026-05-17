"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

const CARDS = [
  {
    src: "https://images.pokemontcg.io/swsh4/20_hires.png",
    alt: "Charizard VMAX",
    width: "w-48 md:w-64",
    z: "z-20",
    rotate: 0,
    x: "left-1/2 -translate-x-1/2",
    y: "top-4",
    delay: 0,
    glow: "rgba(245,158,11,0.6)",
  },
  {
    src: "https://images.pokemontcg.io/swsh12/44_hires.png",
    alt: "Pikachu VMAX",
    width: "w-40 md:w-52",
    z: "z-10",
    rotate: -15,
    x: "left-0",
    y: "top-8",
    delay: 0.5,
    glow: "rgba(255,200,50,0.4)",
  },
  {
    src: "https://images.pokemontcg.io/swsh9/79_hires.png",
    alt: "Mewtwo V",
    width: "w-40 md:w-52",
    z: "z-10",
    rotate: 15,
    x: "right-0",
    y: "top-8",
    delay: 1,
    glow: "rgba(124,58,237,0.4)",
  },
]

export function HeroCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = ((e.clientX - centerX) / rect.width) * 10
      const y = ((e.clientY - centerY) / rect.height) * 10
      setMousePos({ x, y })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-[320px] md:h-[420px]">
      {/* Glow ring */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-radial from-amber-500/20 via-purple-500/10 to-transparent blur-3xl rounded-full" />

      {CARDS.map((card, i) => (
        <motion.div
          key={card.alt}
          className={`absolute ${card.width} ${card.z} ${card.x} ${card.y}`}
          style={{
            transform: `rotate(${card.rotate}deg) translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
          animate={{
            y: [0, i === 0 ? -15 : i === 1 ? -10 : -12, 0],
          }}
          transition={{
            duration: i === 0 ? 3 : i === 1 ? 3.5 : 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: card.delay,
          }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              filter: `drop-shadow(0 0 40px ${card.glow})`,
            }}
          >
            <Image
              src={card.src}
              alt={card.alt}
              width={300}
              height={420}
              className="rounded-2xl"
              priority={i === 0}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
