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
  const translations = {
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
  }

  // Check for exact match first
  if (translations[spanishName]) {
    return translations[spanishName]
  }

  // Try to translate "Día de..." patterns
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
