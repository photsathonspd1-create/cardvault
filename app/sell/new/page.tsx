"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, formatPrice, SERIES_LABELS } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import {
  Camera,
  FileText,
  DollarSign,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Search,
  X,
  Sparkles,
} from "lucide-react"

const STEPS = [
  { id: 1, label: "สแกน", icon: Camera },
  { id: 2, label: "รายละเอียด", icon: FileText },
  { id: 3, label: "ราคา", icon: DollarSign },
  { id: 4, label: "ยืนยัน", icon: CheckCircle2 },
]

const SERIES_OPTIONS = [
  { value: "POKEMON", label: "Pokemon", icon: "⚡" },
  { value: "YUGIOH", label: "Yu-Gi-Oh!", icon: "🃏" },
  { value: "MTG", label: "MTG", icon: "🔮" },
  { value: "ONE_PIECE", label: "One Piece", icon: "🏴‍☠️" },
]

const CONDITIONS = [
  { value: "MINT", label: "MINT", desc: "สภาพสมบูรณ์ ไม่มีรอย", color: "emerald" },
  { value: "NM", label: "NM", desc: "Near Mint เกือบสมบูรณ์", color: "green" },
  { value: "EX", label: "EX", desc: "Excellent มีรอยเล็กน้อย", color: "blue" },
  { value: "GD", label: "GD", desc: "Good มีรอยพอสมควร", color: "yellow" },
  { value: "PL", label: "PL", desc: "Played มีรอยชัดเจน", color: "orange" },
  { value: "PR", label: "PR", desc: "Poor สภาพแย่", color: "red" },
]

export default function SellNewPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    cardName: "",
    series: "",
    setName: "",
    language: "THAI",
    condition: "",
    isGraded: false,
    gradingCompany: "",
    gradeScore: "",
    gradingCertNumber: "",
    description: "",
    price: "",
    quantity: 1,
    isNegotiable: false,
  })

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step === 1) return true // Scanner is optional
    if (step === 2) return form.cardName && form.series && form.condition
    if (step === 3) return form.price && Number(form.price) > 0
    return true
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isDone = step > s.id
            const isActive = step === s.id
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isDone
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-amber-500 text-black"
                        : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-amber-400" : isDone ? "text-green-400" : "text-zinc-600"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2 mb-5",
                      isDone ? "bg-green-500" : "bg-zinc-800"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 1: Scanner */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">สแกนการ์ด</h2>
                  <p className="text-sm text-zinc-400">ถ่ายรูปหรืออัปโหลดการ์ดของคุณ</p>
                </div>

                {/* Camera/Upload Area */}
                <div className="relative aspect-[2.5/3.5] max-w-xs mx-auto bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-amber-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 group">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                    <Camera className="w-8 h-8 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-400">วางด้านหน้าการ์ดในกรอบ</p>
                    <p className="text-xs text-zinc-600 mt-1">ระบบจะถ่ายอัตโนมัติเมื่อการ์ดชัดเจน</p>
                  </div>

                  {/* Corner Markers */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500 rounded-tl" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500 rounded-tr" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500 rounded-bl" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500 rounded-br" />
                </div>

                {/* Upload Button */}
                <div className="text-center">
                  <button className="text-sm text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-2 mx-auto">
                    <Upload className="w-4 h-4" />
                    เลือกจาก Gallery
                  </button>
                </div>

                {/* Tip */}
                <div className="text-center">
                  <span className="text-xs px-4 py-2 rounded-full border border-amber-500/30 text-amber-400">
                    💡 ถ่ายทั้งหน้า-หลัง ช่วยให้ผู้ซื้อตัดสินใจง่ายขึ้น
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">รายละเอียดการ์ด</h2>
                  <p className="text-sm text-zinc-400">กรอกข้อมูลการ์ดของคุณ</p>
                </div>

                {/* Card Name */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อการ์ด *</label>
                  <input
                    type="text"
                    value={form.cardName}
                    onChange={(e) => updateForm("cardName", e.target.value)}
                    placeholder="เช่น Charizard VMAX"
                    className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Series */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">ซีรีส์ *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERIES_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => updateForm("series", s.value)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                          form.series === s.value
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        )}
                      >
                        <span>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Set Name */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">ชื่อ Set</label>
                  <input
                    type="text"
                    value={form.setName}
                    onChange={(e) => updateForm("setName", e.target.value)}
                    placeholder="เช่น Shining Fates"
                    className="w-full h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">ภาษา</label>
                  <div className="flex gap-2">
                    {[
                      { value: "THAI", label: "🇹🇭 ไทย" },
                      { value: "JAPANESE", label: "🇯🇵 ญี่ปุ่น" },
                      { value: "ENGLISH", label: "🇺🇸 อังกฤษ" },
                    ].map((l) => (
                      <button
                        key={l.value}
                        onClick={() => updateForm("language", l.value)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border text-sm transition-all",
                          form.language === l.value
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">สภาพการ์ด *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateForm("condition", c.value)}
                        className={cn(
                          "text-left p-3 rounded-xl border transition-all",
                          form.condition === c.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                        )}
                      >
                        <span className={cn("text-sm font-bold", form.condition === c.value ? "text-amber-400" : "text-white")}>
                          {c.label}
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graded Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-zinc-300">การ์ดที่ผ่าน Grading</label>
                    <button
                      onClick={() => updateForm("isGraded", !form.isGraded)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        form.isGraded ? "bg-amber-500" : "bg-zinc-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                          form.isGraded ? "translate-x-[22px]" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                  {form.isGraded && (
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={form.gradingCompany}
                        onChange={(e) => updateForm("gradingCompany", e.target.value)}
                        className="h-11 px-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="">บริษัท</option>
                        <option value="PSA">PSA</option>
                        <option value="BGS">BGS</option>
                        <option value="CGC">CGC</option>
                        <option value="TAG">TAG</option>
                      </select>
                      <input
                        type="text"
                        value={form.gradeScore}
                        onChange={(e) => updateForm("gradeScore", e.target.value)}
                        placeholder="เกรด (เช่น 9)"
                        className="h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                      />
                      <input
                        type="text"
                        value={form.gradingCertNumber}
                        onChange={(e) => updateForm("gradingCertNumber", e.target.value)}
                        placeholder="Cert#"
                        className="h-11 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="อธิบายสภาพการ์ด, รายละเอียดเพิ่มเติม..."
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                  <p className="text-right text-[10px] text-zinc-500 mt-1">{form.description.length} / 2000</p>
                </div>
              </div>
            )}

            {/* STEP 3: Pricing */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">ตั้งราคา</h2>
                  <p className="text-sm text-zinc-400">กำหนดราคาและตัวเลือกจัดส่ง</p>
                </div>

                {/* Price Input */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">ราคาขาย *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-500">฿</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      placeholder="0"
                      className="w-full h-16 pl-12 pr-4 bg-zinc-900 border border-zinc-700 rounded-xl text-2xl font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  {/* Market Reference */}
                  <div className="mt-3 bg-zinc-900 rounded-xl p-3 border border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">ราคาตลาดเฉลี่ย</span>
                    <span className="text-sm font-bold text-amber-400">฿15,000</span>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">จำนวน</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateForm("quantity", Math.max(1, form.quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold text-white w-12 text-center">{form.quantity}</span>
                    <button
                      onClick={() => updateForm("quantity", form.quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Negotiable */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">เปิดให้ต่อราคา</label>
                  <button
                    onClick={() => updateForm("isNegotiable", !form.isNegotiable)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      form.isNegotiable ? "bg-amber-500" : "bg-zinc-700"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                        form.isNegotiable ? "translate-x-[22px]" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Preview & Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">ตัวอย่างที่ผู้ซื้อจะเห็น</h2>
                  <p className="text-sm text-zinc-400">ตรวจสอบข้อมูลก่อนลงขาย</p>
                </div>

                {/* Preview Card */}
                <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 max-w-xs mx-auto">
                  <div className="relative aspect-[5/7] bg-zinc-800 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-zinc-600" />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-zinc-500">{SERIES_LABELS[form.series] ?? form.series}</p>
                    <h3 className="text-base font-bold text-white">{form.cardName || "ชื่อการ์ด"}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">{form.condition}</span>
                    <p className="text-xl font-bold text-amber-400">{form.price ? formatPrice(Number(form.price)) : "฿0"}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">ราคาขาย</span>
                    <span className="text-white font-medium">{form.price ? formatPrice(Number(form.price)) : "฿0"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">ค่าธรรมเนียม (5%)</span>
                    <span className="text-red-400">-{form.price ? formatPrice(Math.round(Number(form.price) * 0.05)) : "฿0"}</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 flex justify-between">
                    <span className="text-sm font-medium text-zinc-300">คุณจะได้รับ</span>
                    <span className="text-lg font-bold text-amber-400">
                      {form.price ? formatPrice(Math.round(Number(form.price) * 0.95)) : "฿0"}
                    </span>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-xs text-zinc-400">
                    ยอมรับ{" "}
                    <Link href="/terms" className="text-amber-400 hover:underline">เงื่อนไขการใช้งาน</Link>
                    {" "}และนโยบายของ CardVault
                  </span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 bg-zinc-800 border border-zinc-700 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className={cn(
                "flex-1 h-12 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors",
                canProceed()
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              ถัดไป
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="flex-1 h-14 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2">
              ลงขายเลย 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
