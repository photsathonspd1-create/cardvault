"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { SERIES_LABELS, CONDITION_LABELS } from "@/lib/utils"

interface BrowseFiltersProps {
  series?: string
  condition?: string
  sort?: string
}

export function BrowseFilters({ series, condition, sort }: BrowseFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-6">
      {/* Mobile: Collapsible trigger */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          className="w-full justify-between"
          size="lg"
          onClick={() => setOpen(!open)}
          type="button"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            ตัวกรอง
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {open && (
          <div className="mt-3 space-y-3">
            <Select name="series" defaultValue={series ?? "ALL"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ซีรีส์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทุกซีรีส์</SelectItem>
                {Object.entries(SERIES_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="condition" defaultValue={condition ?? "ALL"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="สภาพ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทุกสภาพ</SelectItem>
                {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="sort" defaultValue={sort}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
                <SelectItem value="oldest">เก่าสุด</SelectItem>
                <SelectItem value="price_asc">ราคาต่ำ → สูง</SelectItem>
                <SelectItem value="price_desc">ราคาสูง → ต่ำ</SelectItem>
                <SelectItem value="popular">ยอดนิยม</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Desktop: Always visible filters */}
      <div className="hidden md:flex flex-wrap gap-2">
        <Select name="series" defaultValue={series ?? "ALL"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ซีรีส์" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ทุกซีรีส์</SelectItem>
            {Object.entries(SERIES_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="condition" defaultValue={condition ?? "ALL"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="สภาพ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ทุกสภาพ</SelectItem>
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="sort" defaultValue={sort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="เรียงตาม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
            <SelectItem value="oldest">เก่าสุด</SelectItem>
            <SelectItem value="price_asc">ราคาต่ำ → สูง</SelectItem>
            <SelectItem value="price_desc">ราคาสูง → ต่ำ</SelectItem>
            <SelectItem value="popular">ยอดนิยม</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
