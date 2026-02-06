"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Briefcase, CheckSquare } from "lucide-react"
import { type Holiday, getHolidayDisplayName } from "@/lib/sanity"
import { parseDateString } from "@/lib/utils"

interface HolidayCardProps {
  holiday: Holiday
  isSelected: boolean
  onToggleSelect: (id: string) => void
  disabled?: boolean
}

export function HolidayCard({ 
  holiday, 
  isSelected, 
  onToggleSelect, 
  disabled = false
}: HolidayCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'working': return <Briefcase className="w-4 h-4 text-orange-500" />
      case 'custom': return <Briefcase className="w-4 h-4 text-purple-500" />
      case 'existing': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return { text: 'Aprobado', color: 'bg-green-500 text-white' }
      case 'working': return { text: 'Working', color: 'bg-orange-500 text-white' }
      case 'custom': return { text: 'Custom', color: 'bg-purple-500 text-white' }
      default: return { text: 'Aprobado', color: 'bg-green-500 text-white' }
    }
  }

  const displayName = getHolidayDisplayName(holiday)

  return (
    <Card 
      className={`p-4 transition-colors relative ${
        holiday.existsInDB
          ? 'bg-slate-900/40 border-slate-600/30 opacity-60'
          : isSelected 
          ? 'bg-slate-700/50 border-slate-600' 
          : 'bg-slate-800/60 border-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => !holiday.existsInDB && onToggleSelect(holiday._id)}
            disabled={holiday.existsInDB || disabled}
            className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors flex-shrink-0 ${
              holiday.existsInDB
                ? 'border-slate-600 cursor-not-allowed opacity-50'
                : 'border-slate-400 hover:border-slate-300'
            }`}
          >
            {isSelected && (
              <CheckSquare className="w-4 h-4 text-slate-300" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mb-2">
              {getStatusIcon(holiday.status || 'approved')}
              <h3 className="font-semibold truncate min-w-0">
                {displayName}
              </h3>
              {holiday.existsInDB ? (
                <Badge className="bg-blue-500 text-white whitespace-nowrap">
                  Already in DB
                </Badge>
              ) : (
                <Badge className={`${getStatusBadge(holiday.status || 'approved').color} whitespace-nowrap`}>
                  {getStatusBadge(holiday.status || 'approved').text}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Date:</span> {parseDateString(holiday.startDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div>
                <span className="font-medium">Status:</span> {holiday.existsInDB ? 'Already in Database' : getStatusBadge(holiday.status || 'approved').text}
              </div>
            </div>
            {holiday.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {holiday.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
