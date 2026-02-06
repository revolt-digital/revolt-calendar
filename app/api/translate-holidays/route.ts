import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { translateHolidayName, translateHolidayDescription } from '@/lib/utils'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-10-17',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
})

/**
 * POST /api/translate-holidays
 * 
 * Translates all holidays that don't have nameEn yet
 */
export async function POST() {
  try {
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        message: 'SANITY_API_TOKEN not configured' 
      }, { status: 500 })
    }

    console.log('🔍 Fetching holidays without English translation...')
    
    // Fetch all holidays that don't have nameEn or where nameEn equals name (failed translation)
    const allHolidays = await client.fetch(
      `*[_type == "holiday"] {
        _id,
        name,
        nameEn,
        description,
        descriptionEn,
        startDate
      }`
    )

    // Filter holidays that need translation
    interface HolidayForTranslation {
      _id: string
      name: string
      nameEn?: string
      description?: string
      descriptionEn?: string
      startDate: string
    }
    const holidays = allHolidays.filter((h: HolidayForTranslation) => 
      !h.nameEn || h.nameEn === h.name || !h.descriptionEn
    )

    console.log(`📅 Found ${holidays.length} holidays without English translation`)

    if (holidays.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All holidays already have English translations!',
        translated: 0,
        errors: 0
      })
    }

    let translated = 0
    let errors = 0
    const errorsList: string[] = []

    for (const holiday of holidays) {
      try {
        const updates: { nameEn?: string; descriptionEn?: string } = {}
        
        // Translate name if needed
        if (!holiday.nameEn || holiday.nameEn === holiday.name) {
          updates.nameEn = translateHolidayName(holiday.name)
          console.log(`🔄 Translating name: "${holiday.name}" -> "${updates.nameEn}"`)
        }
        
        // Translate description if needed
        if (holiday.description && !holiday.descriptionEn) {
          // Extract tipo from description if it matches the pattern "Feriado oficial (tipo)"
          const tipoMatch = holiday.description.match(/\(([^)]+)\)/)
          const tipo = tipoMatch ? tipoMatch[1] : undefined
          updates.descriptionEn = translateHolidayDescription(holiday.description, tipo)
          console.log(`🔄 Translating description: "${holiday.description}" -> "${updates.descriptionEn}"`)
        }
        
        if (Object.keys(updates).length > 0) {
          await client
            .patch(holiday._id)
            .set(updates)
            .commit()
        }

        translated++
      } catch (error) {
        console.error(`❌ Error translating ${holiday.name}:`, error)
        errors++
        errorsList.push(`${holiday.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Translated ${translated} holidays`,
      translated,
      errors,
      errorsList: errors > 0 ? errorsList : undefined
    })

  } catch (error: unknown) {
    console.error('Error in translate-holidays API:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during translation' 
      },
      { status: 500 }
    )
  }
}
