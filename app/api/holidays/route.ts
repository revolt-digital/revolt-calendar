import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Configure Sanity client for server-side operations
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-10-17',
  useCdn: true, // Use CDN for better performance on public endpoint
  token: process.env.SANITY_API_TOKEN,
});

/**
 * GET /api/holidays
 * 
 * Public endpoint to fetch all holidays from Sanity.
 * Returns holidays ordered by startDate.
 * 
 * Query parameters:
 * - year: optional, filter holidays by year
 * - status: optional, filter by status (approved, working, custom)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    // Build GROQ query with optional filters
    let query = `*[_type == "holiday"`;
    
    const conditions: string[] = [];
    
    if (year) {
      conditions.push(`startDate >= "${year}-01-01" && startDate <= "${year}-12-31"`);
    }
    
    if (status) {
      conditions.push(`status == "${status}"`);
    }
    
    if (conditions.length > 0) {
      query += ` && ${conditions.join(' && ')}`;
    }
    
    query += `] | order(startDate asc) {
      _id,
      name,
      nameEn,
      startDate,
      endDate,
      description,
      descriptionEn,
      status
    }`;

    const holidays = await client.fetch(query);

    return NextResponse.json(
      { 
        success: true, 
        holidays,
        count: holidays.length
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale for 24h
        },
      }
    );

  } catch (error: unknown) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error fetching holidays.' 
      },
      { status: 500 }
    );
  }
}
