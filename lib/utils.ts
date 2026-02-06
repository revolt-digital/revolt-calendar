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
  // Normalize input: trim and handle case variations
  const normalized = spanishName.trim()
  
  const translations: Record<string, string> = {
    // Fixed holidays - with different case variations
    'Año Nuevo': 'New Year\'s Day',
    'Año nuevo': 'New Year\'s Day',
    'año nuevo': 'New Year\'s Day',
    'Día del Trabajador': 'Labor Day',
    'Día de la Revolución de Mayo': 'May Revolution Day',
    'Día de la Independencia': 'Independence Day',
    'Día de la Soberanía Nacional': 'National Sovereignty Day',
    'Inmaculada Concepción de María': 'Immaculate Conception of Mary',
    'Navidad': 'Christmas',
    
    // Movable holidays
    'Carnaval': 'Carnival',
    'Día de la Memoria por la Verdad y la Justicia': 'Day of Remembrance for Truth and Justice',
    'Día Nacional de la Memoria por la Verdad y la Justicia': 'National Day of Remembrance for Truth and Justice',
    'Día del Veterano y de los Caídos en la Guerra de Malvinas': 'Veterans Day and Day of the Fallen in the Malvinas War',
    'Pascuas': 'Easter',
    'Viernes Santo': 'Good Friday',
    'Día de la Bandera': 'Flag Day',
    'Paso a la Inmortalidad del General Martín Miguel de Güemes': 'Passing to Immortality of General Martín Miguel de Güemes',
    'Paso a la Inmortalidad del General Manuel Belgrano': 'Passing to Immortality of General Manuel Belgrano',
    'Paso a la Inmortalidad del General José de San Martín': 'Passing to Immortality of General José de San Martín',
    'Día del Respeto a la Diversidad Cultural': 'Day of Respect for Cultural Diversity',
    
    // Custom/Revolt holidays
    'Revolt Day Off': 'Revolt Day Off',
    
    // Bridge holidays
    'Puente turístico no laborable': 'Tourist Bridge Holiday',
    'Puente Turístico No Laborable': 'Tourist Bridge Holiday',
    'Puente': 'Bridge Holiday',
    
    // Common patterns
    'Día de': 'Day of',
    'Paso a la Inmortalidad de': 'Passing to Immortality of',
    'Feriado': 'Holiday',
  }

  // Check for exact match first (case-sensitive)
  if (translations[normalized]) {
    return translations[normalized]
  }

  // Check for case-insensitive match
  const lowerNormalized = normalized.toLowerCase()
  for (const [key, value] of Object.entries(translations)) {
    if (key.toLowerCase() === lowerNormalized) {
      return value
    }
  }

  // Try to translate common patterns
  
  // Translate "Día de..." patterns
  if (normalized.match(/^Día de /i)) {
    const rest = normalized.replace(/^Día de /i, '')
    const patternKey = `Día de ${rest}`
    if (translations[patternKey]) {
      return translations[patternKey]
    }
    // Generic translation
    return `Day of ${rest}`
  }

  // Translate "Día Nacional de..." patterns
  if (normalized.match(/^Día Nacional de /i)) {
    const rest = normalized.replace(/^Día Nacional de /i, '')
    return `National Day of ${rest}`
  }

  // Translate "Paso a la Inmortalidad de..." patterns
  if (normalized.includes('Paso a la Inmortalidad')) {
    const person = normalized
      .replace(/Paso a la Inmortalidad del General /i, '')
      .replace(/Paso a la Inmortalidad de /i, '')
    return `Passing to Immortality of General ${person}`
  }

  // Translate "Puente..." patterns
  if (normalized.toLowerCase().includes('puente')) {
    if (normalized.toLowerCase().includes('turístico')) {
      return 'Tourist Bridge Holiday'
    }
    return 'Bridge Holiday'
  }

  // If no translation found, return original (can be manually edited later)
  return normalized
}

/**
 * Translate holiday type/description from Spanish to English
 */
export function translateHolidayType(tipo: string): string {
  const typeTranslations: Record<string, string> = {
    'inamovible': 'fixed',
    'trasladable': 'movable',
    'puente': 'bridge',
    'no laborable': 'non-working',
    'turístico': 'tourist',
  }

  const lowerTipo = tipo.toLowerCase().trim()
  
  // Check for exact match
  if (typeTranslations[lowerTipo]) {
    return typeTranslations[lowerTipo]
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(typeTranslations)) {
    if (lowerTipo.includes(key)) {
      return value
    }
  }

  return tipo
}

/**
 * Translate holiday description from Spanish to English
 */
export function translateHolidayDescription(description: string, tipo?: string): string {
  if (!description) return description

  const lowerDesc = description.toLowerCase().trim()

  // Translate common patterns
  if (lowerDesc.includes('feriado oficial')) {
    if (tipo) {
      const translatedType = translateHolidayType(tipo)
      return `Official holiday (${translatedType})`
    }
    return 'Official holiday'
  }

  if (lowerDesc.includes('puente turístico')) {
    return 'Tourist bridge holiday'
  }

  if (lowerDesc.includes('puente')) {
    return 'Bridge holiday'
  }

  // If no pattern matches, return original
  return description
}
