"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CalendarGrid } from "@/components/calendar-grid"
import { ColorLegend } from "@/components/color-legend"
import { getHolidays, type Holiday } from "@/lib/sanity"
import { cn } from "@/lib/utils"

export default function Home() {
  const [year, setYear] = useState(Math.max(new Date().getFullYear(), 2025))
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true)
      const data = await getHolidays(year)
      setHolidays(data)
      setLoading(false)
    }
    fetchHolidays()
  }, [year])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Header - Se oculta al hacer scroll */}
      <header className={cn(
        "bg-card/30 backdrop-blur-sm sticky top-0 z-40 transition-transform duration-300",
        isScrolled && "-translate-y-full"
      )}>
        <div className="container mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src="/logo.png" 
                  alt="Revolt Logo" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Revolt</h1>
                <p className="text-xs text-muted-foreground">Holiday Calendar</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Color Legend - Sticky arriba */}
      {!loading && (
        <div className={cn(
          "bg-card/30 backdrop-blur-sm sticky z-30 py-4 transition-all duration-300",
          isScrolled ? "top-0" : "top-[73px]"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <ColorLegend />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Calendar - Centrado con márgenes laterales de 50px */}
            <div className="mx-[50px]">
              <CalendarGrid holidays={holidays} year={year} onYearChange={setYear} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6">
        </div>
      </footer>
    </main>
  )
}
