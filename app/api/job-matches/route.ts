import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { jobDescription, company, position } = body

    if (!jobDescription || !company || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: jobDescription, company, position' },
        { status: 400 }
      )
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, cvs(*)')
      .eq('clerk_id', userId)
      .single()

    if (!userData || !userData.cvs || userData.cvs.length === 0) {
      return NextResponse.json({ error: 'No CV found' }, { status: 404 })
    }

    const cv = userData.cvs[0]

    // Calculate match score
    const matchScore = calculateMatchScore(cv, jobDescription)

    // Save job offer and match
    const { data: jobOffer, error: jobError } = await supabase
      .from('job_offers')
      .insert({
        platform: 'manual',
        platform_id: `manual-${Date.now()}`,
        company,
        position,
        description: jobDescription,
        url: '#'
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    // Save match
    const { data: match, error: matchError } = await supabase
      .from('job_matches')
      .insert({
        user_id: userData.id,
        job_offer_id: jobOffer.id,
        match_score: matchScore
      })
      .select(`
        *,
        job_offers(*)
      `)
      .single()

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error('Job matching error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: matches } = await supabase
      .from('job_matches')
      .select(`
        *,
        job_offers(*)
      `)
      .eq('user_id', userData.id)
      .order('match_score', { ascending: false })

    return NextResponse.json(matches || [])
  } catch (error) {
    console.error('Matches fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateMatchScore(cv: any, jobDescription: string): number {
  if (!cv.skills || !Array.isArray(cv.skills)) {
    return 50
  }

  const lowerJobDesc = jobDescription.toLowerCase()
  const cvSkills = cv.skills.map((s: string) => s.toLowerCase())

  // Count how many CV skills are mentioned in job description
  let matchedSkills = 0
  cvSkills.forEach((skill: string) => {
    if (lowerJobDesc.includes(skill)) {
      matchedSkills++
    }
  })

  // Calculate base score (0-70)
  const baseScore = Math.min(70, (matchedSkills / Math.max(1, cvSkills.length)) * 70)

  // Bonus for experience keywords in CV
  const experienceKeywords = ['experience', 'developed', 'managed', 'led', 'created', 'implemented']
  const lowerCvContent = cv.content?.toLowerCase() || ''
  const experienceBonus = experienceKeywords.filter(keyword => lowerCvContent.includes(keyword)).length * 5

  // Total score (max 100)
  const totalScore = Math.min(100, baseScore + experienceBonus)

  return Math.round(totalScore)
}
