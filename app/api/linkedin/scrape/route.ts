import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { chromium } from 'playwright'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { keywords, location } = body

    if (!keywords) {
      return NextResponse.json(
        { error: 'Missing required field: keywords' },
        { status: 400 }
      )
    }

    // Launch browser
    const browser = await chromium.launch({
      headless: true,
    })

    const page = await browser.newPage()

    // Navigate to LinkedIn jobs
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location || '')}`
    await page.goto(searchUrl, { waitUntil: 'networkidle' })

    // Wait for job listings to load
    await page.waitForSelector('.job-card-container', { timeout: 10000 })

    // Extract job listings
    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.job-card-container')
      const jobListings = []

      for (const card of jobCards) {
        const titleElement = card.querySelector('.job-card-list__title')
        const companyElement = card.querySelector('.job-card-container__company-name')
        const locationElement = card.querySelector('.job-card-container__metadata-item')
        const linkElement = card.querySelector('a')

        if (titleElement && companyElement) {
          jobListings.push({
            title: titleElement.textContent?.trim() || '',
            company: companyElement.textContent?.trim() || '',
            location: locationElement?.textContent?.trim() || '',
            url: linkElement?.getAttribute('href') || '',
            platform: 'linkedin'
          })
        }
      }

      return jobListings.slice(0, 10) // Limit to 10 jobs
    })

    await browser.close()

    // Note: This is a simplified implementation. In production:
    // 1. You'll need to handle LinkedIn login
    // 2. Respect robots.txt and ToS
    // 3. Use proper rate limiting
    // 4. Consider using official LinkedIn API instead of scraping

    return NextResponse.json({
      jobs,
      note: 'This is a simplified scraper. For production use, consider LinkedIn API or specialized job aggregators.'
    })

  } catch (error) {
    console.error('LinkedIn scraping error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
