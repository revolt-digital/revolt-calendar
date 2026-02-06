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

/**
 * Translate Spanish holiday names to English
 * Common translations for Argentine holidays
 */
export function translateHolidayName(spanishName: string): string {
  const translations: Record<string, string> = {
    // Fixed holidays
    'Año Nuevo': 'New Year\'s Day',
    'Día del Trabajador': 'Labor Day',
    'Día de la Revolución de Mayo': 'May Revolution Day',
    'Día de la Independencia': 'Independence Day',
    'Día de la Soberanía Nacional': 'National Sovereignty Day',
    'Inmaculada Concepción de María': 'Immaculate Conception of Mary',
    'Navidad': 'Christmas',
    
    // Movable holidays
    'Carnaval': 'Carnival',
    'Día de la Memoria por la Verdad y la Justicia': 'Day of Remembrance for Truth and Justice',
    'Día del Veterano y de los Caídos en la Guerra de Malvinas': 'Veterans Day and Day of the Fallen in the Malvinas War',
    'Pascuas': 'Easter',
    'Viernes Santo': 'Good Friday',
    'Día de la Bandera': 'Flag Day',
    'Paso a la Inmortalidad del General Martín Miguel de Güemes': 'Passing to Immortality of General Martín Miguel de Güemes',
    'Paso a la Inmortalidad del General Manuel Belgrano': 'Passing to Immortality of General Manuel Belgrano',
    'Paso a la Inmortalidad del General José de San Martín': 'Passing to Immortality of General José de San Martín',
    'Día del Respeto a la Diversidad Cultural': 'Day of Respect for Cultural Diversity',
    'Día de la Soberanía Nacional': 'National Sovereignty Day',
    
    // Common patterns
    'Día de': 'Day of',
    'Paso a la Inmortalidad de': 'Passing to Immortality of',
    'Feriado': 'Holiday',
    'Puente': 'Bridge',
  }

  // Check for exact match first
  if (translations[spanishName]) {
    return translations[spanishName]
  }

  // Try to translate common patterns
  let translated = spanishName
  
  // Translate "Día de..." patterns
  if (spanishName.startsWith('Día de ')) {
    const rest = spanishName.replace('Día de ', '')
    if (translations[`Día de ${rest}`]) {
      return translations[`Día de ${rest}`]
    }
    // Generic translation
    return `Day of ${rest}`
  }

  // Translate "Paso a la Inmortalidad de..." patterns
  if (spanishName.includes('Paso a la Inmortalidad')) {
    const person = spanishName.replace('Paso a la Inmortalidad del General ', '').replace('Paso a la Inmortalidad de ', '')
    return `Passing to Immortality of General ${person}`
  }

  // If no translation found, return original (can be manually edited later)
  return spanishName
}
