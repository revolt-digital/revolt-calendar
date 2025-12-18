import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string in YYYY-MM-DD format without timezone conversion issues.
 * This prevents dates from being shifted by one day due to UTC conversion.
 */
export function parseDateString(dateString: string): Date {
  const parts = dateString.split('-')
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`)
  }
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
  const day = parseInt(parts[2], 10)
  return new Date(year, month, day)
}
