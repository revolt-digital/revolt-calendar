import { client } from "../sanity/lib/client"

export interface Holiday {
  _id: string
  name: string
  nameEn?: string
  startDate: string
  endDate: string
  description?: string
  descriptionEn?: string
  status?: 'approved' | 'working' | 'custom'
  existsInDB?: boolean
}

/**
 * Get the display description for a holiday based on language preference
 * @param holiday - The holiday object
 * @param language - Language preference: 'en' for English, 'es' for Spanish (default: 'en')
 */
export function getHolidayDisplayDescription(holiday: Holiday, language: 'en' | 'es' = 'en'): string | undefined {
  if (!holiday.description && !holiday.descriptionEn) return undefined
  
  if (language === 'en') {
    return holiday.descriptionEn || holiday.description
  }
  return holiday.description
}

/**
 * Get the display name for a holiday based on language preference
 * @param holiday - The holiday object
 * @param language - Language preference: 'en' for English, 'es' for Spanish (default: 'en')
 */
export function getHolidayDisplayName(holiday: Holiday, language: 'en' | 'es' = 'en'): string {
  if (language === 'en') {
    return holiday.nameEn || holiday.name
  }
  return holiday.name
}

export async function getHolidays(year: number): Promise<Holiday[]> {
  const query = `*[_type == "holiday" && 
    startDate >= "${year}-01-01" && 
    startDate <= "${year}-12-31" &&
    status in ["approved", "working", "custom"]
  ] | order(startDate asc) {
    _id,
    name,
    nameEn,
    startDate,
    endDate,
    description,
    descriptionEn,
    status
  }`

  try {
    const holidays = await client.fetch(query, {}, { cache: 'no-store' })
    return holidays
  } catch (error) {
    console.error("Error fetching holidays:", error)
    // Return empty array if there's an error
    return []
  }
}

export async function updateHolidayStatus(id: string, status: Holiday['status']): Promise<void> {
  try {
    const response = await fetch('/api/update-holiday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error updating holiday status:", error);
    throw error;
  }
}

export async function bulkUpdateHolidayStatus(ids: string[], status: Holiday['status']): Promise<void> {
  try {
    const response = await fetch('/api/bulk-update-holidays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, status }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error updating holidays status:", error);
    throw error;
  }
}
