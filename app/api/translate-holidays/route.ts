import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { translateHolidayName } from '@/lib/utils'

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
        const nameEn = translateHolidayName(holiday.name)
        
        console.log(`🔄 Translating: "${holiday.name}" -> "${nameEn}"`)
        
        await client
          .patch(holiday._id)
          .set({ nameEn })
          .commit()

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
