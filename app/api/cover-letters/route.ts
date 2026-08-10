import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { company, position, jobDescription, applicationId } = body

    if (!company || !position || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: company, position, jobDescription' },
        { status: 400 }
      )
    }

    // Get user data and CV
    const { data: userData } = await supabase
      .from('users')
      .select('*, cvs(*)')
      .eq('clerk_id', userId)
      .single()

    if (!userData || !userData.cvs || userData.cvs.length === 0) {
      return NextResponse.json({ error: 'No CV found. Please upload your CV first.' }, { status: 404 })
    }

    const cv = userData.cvs[0]

    // Generate cover letter with OpenAI
    const prompt = `Generate a professional cover letter for ${position} at ${company}.

Applicant Info:
- Name: ${userData.first_name} ${userData.last_name}
- Email: ${userData.email}
- Phone: ${userData.phone || 'Not provided'}

CV Summary:
${cv.content}

Job Description:
${jobDescription}

Requirements:
- Write in Italian
- Professional and concise (300-400 words)
- Highlight relevant skills and experience from the CV
- Show enthusiasm for the position and company
- Professional closing

Format the cover letter with proper business letter structure including date, recipient info, salutation, body paragraphs, and closing.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional career counselor and cover letter writer specializing in Italian job applications.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    })

    const coverLetterContent = completion.choices[0].message.content

    // Save cover letter to database
    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .insert({
        user_id: userData.id,
        application_id: applicationId || null,
        company,
        position,
        content: coverLetterContent
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(coverLetter)
  } catch (error) {
    console.error('Cover letter generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
