import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(priceInSatang: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInSatang / 100)
}

export function formatPriceRaw(priceInSatang: number): string {
  return new Intl.NumberFormat("th-TH").format(priceInSatang / 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const SERIES_LABELS: Record<string, string> = {
  POKEMON: "โปเกมอน",
  YUGIOH: "Yu-Gi-Oh!",
  MTG: "Magic: The Gathering",
  ONE_PIECE: "One Piece",
  VANGUARD: "Cardfight!! Vanguard",
  DIGIMON: "Digimon",
  OTHER: "อื่นๆ",
}

export const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint (M)",
  NEAR_MINT: "Near Mint (NM)",
  EXCELLENT: "Excellent (EX)",
  GOOD: "Good (G)",
  PLAYED: "Played (PL)",
  POOR: "Poor (P)",
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  PAID: "ชำระเงินแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "ได้รับแล้ว",
  COMPLETED: "สำเร็จ",
  DISPUTED: "มีข้อพิพาท",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงิน",
}

export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "แบบร่าง",
  PENDING_REVIEW: "รอตรวจสอบ",
  ACTIVE: "เปิดขาย",
  SOLD: "ขายแล้ว",
  PAUSED: "หยุดขาย",
  EXPIRED: "หมดอายุ",
  REJECTED: "ถูกปฏิเสธ",
}

export const LANGUAGE_LABELS: Record<string, string> = {
  THAI: "ภาษาไทย",
  JAPANESE: "ภาษาญี่ปุ่น",
  ENGLISH: "ภาษาอังกฤษ",
  KOREAN: "ภาษาเกาหลี",
  OTHER: "อื่นๆ",
}

export const ESCROW_STATUS_LABELS: Record<string, string> = {
  HOLDING: "เงินอยู่ในระบบ",
  RELEASING: "กำลังปล่อยเงิน",
  RELEASED: "ปล่อยเงินแล้ว",
  REFUNDED: "คืนเงินแล้ว",
  FROZEN: "อายัดเงิน",
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "เมื่อสักครู่"
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  if (days < 7) return `${days} วันที่แล้ว`
  return date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
}

export function generateOrderNumber(): string {
  const prefix = "CV"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}
