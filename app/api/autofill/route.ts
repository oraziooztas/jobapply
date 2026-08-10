import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'
import { chromium } from 'playwright'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { url, cvData } = body

    if (!url) {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      )
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*, cvs(*)')
      .eq('clerk_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const cv = userData.cvs?.[0]
    const profileData = cvData || {
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.email,
      phone: userData.phone
    }

    // Launch browser
    const browser = await chromium.launch({
      headless: false, // Set to true for production
      slowMo: 50 // Slow down for demonstration
    })

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })

    const page = await context.newPage()

    // Navigate to job application page
    await page.goto(url, { waitUntil: 'networkidle' })

    // Auto-fill common form fields
    // This is a simplified implementation. Real-world usage would need:
    // 1. Site-specific field mapping
    // 2. Better field detection
    // 3. CAPTCHA handling
    // 4. File upload handling for CV

    const fillResult = await page.evaluate((data) => {
      const results = {
        firstName: false,
        lastName: false,
        email: false,
        phone: false
      }

      // Find and fill first name fields
      const firstNameSelectors = [
        'input[name*="first"]',
        'input[name*="firstname"]',
        'input[placeholder*="first"]',
        'input[id*="first"]'
      ]

      for (const selector of firstNameSelectors) {
        const element = document.querySelector(selector) as HTMLInputElement
        if (element && !element.value) {
          element.value = data.firstName || ''
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
          results.firstName = true
          break
        }
      }

      // Find and fill last name fields
      const lastNameSelectors = [
        'input[name*="last"]',
        'input[name*="lastname"]',
        'input[placeholder*="last"]',
        'input[id*="last"]'
      ]

      for (const selector of lastNameSelectors) {
        const element = document.querySelector(selector) as HTMLInputElement
        if (element && !element.value) {
          element.value = data.lastName || ''
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
          results.lastName = true
          break
        }
      }

      // Find and fill email fields
      const emailSelectors = [
        'input[type="email"]',
        'input[name*="email"]',
        'input[placeholder*="email"]'
      ]

      for (const selector of emailSelectors) {
        const element = document.querySelector(selector) as HTMLInputElement
        if (element && !element.value) {
          element.value = data.email || ''
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
          results.email = true
          break
        }
      }

      // Find and fill phone fields
      const phoneSelectors = [
        'input[type="tel"]',
        'input[name*="phone"]',
        'input[placeholder*="phone"]'
      ]

      for (const selector of phoneSelectors) {
        const element = document.querySelector(selector) as HTMLInputElement
        if (element && !element.value) {
          element.value = data.phone || ''
          element.dispatchEvent(new Event('input', { bubbles: true }))
          element.dispatchEvent(new Event('change', { bubbles: true }))
          results.phone = true
          break
        }
      }

      return results
    }, profileData)

    // Keep browser open for manual review
    // In production, you would:
    // 1. Fill more fields
    // 2. Upload CV file
    // 3. Optionally submit the form
    // 4. Close the browser

    return NextResponse.json({
      success: true,
      fillResult,
      message: 'Form fields filled. Browser is open for review.',
      note: 'For production use, implement site-specific field mapping and better error handling.'
    })

  } catch (error) {
    console.error('Auto-fill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
