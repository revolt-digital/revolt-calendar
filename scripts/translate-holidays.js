#!/usr/bin/env node

/**
 * Script to translate existing holidays in Sanity
 * Adds nameEn field to all holidays that don't have it yet
 * 
 * Usage: node scripts/translate-holidays.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-10-17',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

/**
 * Translate Spanish holiday names to English
 */
function translateHolidayName(spanishName) {
  // Normalize input: trim and handle case variations
  const normalized = spanishName.trim()
  
  const translations = {
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

async function translateHolidays() {
  try {
    console.log('🔍 Fetching all holidays from Sanity...')
    
    // Fetch all holidays that don't have nameEn yet
    const holidays = await client.fetch(
      `*[_type == "holiday" && !defined(nameEn)] {
        _id,
        name,
        startDate
      }`
    )

    console.log(`📅 Found ${holidays.length} holidays without English translation`)

    if (holidays.length === 0) {
      console.log('✅ All holidays already have English translations!')
      return
    }

    let translated = 0
    let errors = 0

    for (const holiday of holidays) {
      try {
        const nameEn = translateHolidayName(holiday.name)
        
        console.log(`🔄 Translating: "${holiday.name}" -> "${nameEn}"`)
        
        await client
          .patch(holiday._id)
          .set({ nameEn })
          .commit()

        translated++
      } catch (error) {
        console.error(`❌ Error translating ${holiday.name}:`, error.message)
        errors++
      }
    }

    console.log(`\n✅ Translation complete!`)
    console.log(`   Translated: ${translated}`)
    console.log(`   Errors: ${errors}`)

  } catch (error) {
    console.error('❌ Error in translation script:', error)
    process.exit(1)
  }
}

// Run the script
translateHolidays()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
