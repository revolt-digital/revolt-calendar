import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-10-17',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { holidays, status } = await request.json()
    
    if (!holidays || !Array.isArray(holidays)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Holidays array is required' 
      }, { status: 400 })
    }

    if (!status || !['approved', 'working', 'custom'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Valid status (approved, working, or custom) is required' 
      }, { status: 400 })
    }

    console.log(`💾 Saving ${holidays.length} holidays to Sanity with status: ${status}`)
    
    const results = {
      saved: 0,
      skipped: 0,
      errors: 0,
    }

    for (const holiday of holidays) {
      try {
        // Verificar si ya existe
        const existing = await client.fetch(
          `*[_type == "holiday" && name == "${holiday.name}" && startDate == "${holiday.startDate}"]`
        )
        
        if (existing.length > 0) {
          results.skipped++
          continue
        }
        
        // Crear el documento en Sanity
        const doc: {
          _type: string
          name: string
          startDate: string
          endDate: string
          description?: string
          descriptionEn?: string
          status: string
          nameEn?: string
        } = {
          _type: 'holiday',
          name: holiday.name,
          startDate: holiday.startDate,
          endDate: holiday.endDate,
          description: holiday.description,
          status: status,
        }
        
        // Include nameEn if provided
        if (holiday.nameEn) {
          doc.nameEn = holiday.nameEn
        }
        
        // Include descriptionEn if provided
        if (holiday.descriptionEn) {
          doc.descriptionEn = holiday.descriptionEn
        }
        
        await client.create(doc)
        results.saved++
        
      } catch (error) {
        console.error(`Error saving ${holiday.name}:`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${results.saved} holidays to database`,
      results
    })

  } catch (error: unknown) {
    console.error('Error in save-approved-holidays API:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error during save' },
      { status: 500 }
    )
  }
}
