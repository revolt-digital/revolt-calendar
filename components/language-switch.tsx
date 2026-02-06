"use client"

import { cn } from "@/lib/utils"

interface LanguageSwitchProps {
  language: 'en' | 'es'
  onLanguageChange: (lang: 'en' | 'es') => void
  className?: string
}

export function LanguageSwitch({ language, onLanguageChange, className }: LanguageSwitchProps) {
  return (
    <div className={cn("flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50", className)}>
      <button
        onClick={() => onLanguageChange('en')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          language === 'en'
            ? "bg-red-500 text-white shadow-md hover:bg-red-600"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        )}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('es')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          language === 'es'
            ? "bg-red-500 text-white shadow-md hover:bg-red-600"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        )}
      >
        ES
      </button>
    </div>
  )
}
