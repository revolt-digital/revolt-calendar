"use client"

import { Card } from "@/components/ui/card"
import type { Holiday } from "@/lib/sanity"
import { getHolidayDisplayName } from "@/lib/sanity"
import { parseDateString } from "@/lib/utils"

interface HolidayLegendProps {
  holidays: Holiday[]
  language?: 'en' | 'es'
}

export function HolidayLegend({ holidays, language = 'en' }: HolidayLegendProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h3 className="text-xl font-bold mb-4 text-foreground">Holidays</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {holidays.map((holiday) => {
          // Parse dates without timezone conversion
          const start = parseDateString(holiday.startDate)
          const end = parseDateString(holiday.endDate)
          
          const isSingleDay = start.toDateString() === end.toDateString()

          return (
            <div
              key={holiday._id}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-300 cursor-pointer group"
            >
              <div className="w-3 h-3 rounded-full bg-[#DA1104] mt-1 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#DA1104]/50 transition-all duration-300" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {getHolidayDisplayName(holiday, language)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isSingleDay
                    ? start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
