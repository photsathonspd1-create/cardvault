// CardVault Design Tokens — Dark Gaming Luxury
// Reference: "Steam meets Binance meets high-end Japanese card shop"

export const colors = {
  bgPrimary: "#09090b",      // zinc-950
  bgSecondary: "#111113",    // zinc-900
  bgCard: "#18181b",         // zinc-800/50
  accentGold: "#F59E0B",     // amber-500
  accentPurple: "#7C3AED",   // violet-600
  textPrimary: "#FAFAFA",    // zinc-50
  textSecondary: "#A1A1AA",  // zinc-400
  textMuted: "#52525B",      // zinc-600
  border: "#27272A",         // zinc-800
  success: "#22C55E",        // green-500
  danger: "#EF4444",         // red-500
} as const

export const effects = {
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 0 20px rgba(245,158,11,0.15)",
  },
  goldGlow: {
    boxShadow: "0 0 30px rgba(245,158,11,0.3)",
  },
  purpleGlow: {
    boxShadow: "0 0 30px rgba(124,58,237,0.3)",
  },
  glassCard: {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(10px)",
  },
} as const

export const animations = {
  staggerFadeUp: (index: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.08, duration: 0.5 },
  }),
  scrollReveal: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  },
  hoverScale: {
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 300 },
  },
  floatY: (duration: number, delay = 0) => ({
    animate: { y: [0, -15, 0] },
    transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
  }),
} as const

export const sellerTiers = {
  Gold: {
    bg: "bg-amber-500",
    text: "text-black",
    label: "Gold",
  },
  Silver: {
    bg: "bg-zinc-400",
    text: "text-black",
    label: "Silver",
  },
  Bronze: {
    bg: "bg-orange-700",
    text: "text-white",
    label: "Bronze",
  },
} as const

export const conditionColors: Record<string, { bg: string; text: string; border: string }> = {
  MINT: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  NM: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  EX: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  GD: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  PL: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  PR: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
} as const

export const orderStatusColors: Record<string, { bg: string; text: string }> = {
  PENDING_PAYMENT: { bg: "bg-zinc-500/20", text: "text-zinc-400" },
  PAID: { bg: "bg-amber-500/20", text: "text-amber-400" },
  SHIPPED: { bg: "bg-blue-500/20", text: "text-blue-400" },
  DELIVERED: { bg: "bg-purple-500/20", text: "text-purple-400" },
  COMPLETED: { bg: "bg-green-500/20", text: "text-green-400" },
  DISPUTED: { bg: "bg-red-500/20", text: "text-red-400" },
  REFUNDED: { bg: "bg-zinc-500/20", text: "text-zinc-400" },
  CANCELLED: { bg: "bg-zinc-500/20", text: "text-zinc-400" },
} as const
