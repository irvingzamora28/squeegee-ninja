import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import db from '@/lib/db'

// For static export, we need to handle this differently
export const dynamic = 'error'

// Path to the landing content file
const landingContentFilePath = path.join(process.cwd(), 'data', 'landingContent.json')

// Load landing content from file (fallback)
async function loadLandingContentFromFile() {
  try {
    const fileData = await fs.readFile(landingContentFilePath, 'utf-8')
    return JSON.parse(fileData)
  } catch (error) {
    console.error('Error loading landing content:', error)
    throw new Error('Failed to load landing content')
  }
}

// Primary source is DB via site_settings.landing_content

export async function GET() {
  console.log('GET /api/allset/landing-content - Loading landing content')
  try {
    const settings = await db.getSiteSettings()
    if (settings.landing_content) {
      return NextResponse.json(settings.landing_content)
    }
    // Fallback to file during migration
    const content = await loadLandingContentFromFile()
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error in GET /api/allset/landing-content:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load landing content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/allset/landing-content - Saving landing content')
  try {
    const contentData = await request.json()

    // Basic validation - ensure it's a valid object
    if (!contentData || typeof contentData !== 'object') {
      console.log('POST /api/allset/landing-content - Invalid content data')
      return NextResponse.json({ success: false, message: 'Invalid content data' }, { status: 400 })
    }

    // Persist content in DB
    await db.updateSiteSettings({ landing_content: contentData as unknown })

    console.log('POST /api/allset/landing-content - Content saved successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Landing content update error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating landing content' },
      { status: 500 }
    )
  }
}
