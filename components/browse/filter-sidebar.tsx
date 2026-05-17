"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

const SERIES_OPTIONS = [
  { value: "POKEMON", label: "Pokemon" },
  { value: "YUGIOH", label: "Yu-Gi-Oh!" },
  { value: "MTG", label: "MTG" },
  { value: "ONE_PIECE", label: "One Piece" },
  { value: "VANGUARD", label: "Vanguard" },
  { value: "DIGIMON", label: "Digimon" },
]

const CONDITIONS = ["MINT", "NM", "EX", "GD", "PL", "PR"]

const LANGUAGES = [
  { value: "THAI", label: "🇹🇭 ไทย" },
  { value: "JAPANESE", label: "🇯🇵 ญี่ปุ่น" },
  { value: "ENGLISH", label: "🇺🇸 อังกฤษ" },
  { value: "OTHER", label: "🌐 อื่นๆ" },
]

const GRADING_COMPANIES = ["PSA", "BGS", "CGC", "TAG"]

const SELLER_TIERS = [
  { value: "Gold", label: "⭐ Gold" },
  { value: "Silver", label: "Silver" },
  { value: "Bronze", label: "Bronze" },
]

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-zinc-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-white mb-3"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>
      {open && children}
    </div>
  )
}

interface FilterSidebarProps {
  className?: string
  onClose?: () => void
}

export function FilterSidebar({ className, onClose }: FilterSidebarProps) {
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [isGraded, setIsGraded] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedGrading, setSelectedGrading] = useState<string[]>([])
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
  }

  const hasFilters =
    selectedSeries.length > 0 ||
    selectedConditions.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedGrading.length > 0 ||
    selectedTiers.length > 0 ||
    isGraded ||
    priceRange.min > 0 ||
    priceRange.max < 100000

  const clearAll = () => {
    setSelectedSeries([])
    setSelectedConditions([])
    setSelectedLanguages([])
    setSelectedGrading([])
    setSelectedTiers([])
    setIsGraded(false)
    setPriceRange({ min: 0, max: 100000 })
  }

  return (
    <div className={cn("bg-zinc-900 rounded-2xl p-4 border border-zinc-800", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">ตัวกรอง</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-amber-400 hover:text-amber-300">
              ล้างตัวกรอง
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Series */}
      <FilterSection title="ซีรีส์">
        <div className="space-y-2">
          {SERIES_OPTIONS.map((s) => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedSeries.includes(s.value)}
                onChange={() => toggleItem(selectedSeries, setSelectedSeries, s.value)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/20"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="สภาพการ์ด">
        <div className="grid grid-cols-3 gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleItem(selectedConditions, setSelectedConditions, c)}
              className={cn(
                "text-xs font-medium py-2 rounded-lg border transition-all",
                selectedConditions.includes(c)
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="ช่วงราคา">
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
                placeholder="฿0"
              />
            </div>
            <span className="text-zinc-500 self-center text-xs">—</span>
            <div className="flex-1">
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
                placeholder="฿100,000"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection title="ภาษา">
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, l.value)}
              className={cn(
                "text-xs font-medium py-2 rounded-lg border transition-all",
                selectedLanguages.includes(l.value)
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Graded Toggle */}
      <FilterSection title="การ์ดที่ Graded">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">เฉพาะ Graded</span>
          <button
            onClick={() => setIsGraded(!isGraded)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative",
              isGraded ? "bg-amber-500" : "bg-zinc-700"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                isGraded ? "translate-x-5.5 left-0.5" : "left-0.5"
              )}
            />
          </button>
        </div>
        {isGraded && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {GRADING_COMPANIES.map((g) => (
              <button
                key={g}
                onClick={() => toggleItem(selectedGrading, setSelectedGrading, g)}
                className={cn(
                  "text-xs font-medium py-2 rounded-lg border transition-all",
                  selectedGrading.includes(g)
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Seller Tier */}
      <FilterSection title="Seller Tier" defaultOpen={false}>
        <div className="space-y-2">
          {SELLER_TIERS.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTiers.includes(t.value)}
                onChange={() => toggleItem(selectedTiers, setSelectedTiers, t.value)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/20"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Mobile: Show Results Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-amber-500 text-black font-bold text-sm rounded-xl lg:hidden"
        >
          แสดงผล
        </button>
      )}
    </div>
  )
}
