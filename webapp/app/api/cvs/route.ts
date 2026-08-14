import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'
import pdf from 'pdf-parse'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF allowed.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF
    const data = await pdf(buffer)
    const content = data.text

    // Extract basic skills (simple keyword matching)
    const commonSkills = [
      'javascript', 'typescript', 'python', 'java', 'react', 'next.js', 'node.js',
      'sql', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'git', 'aws',
      'machine learning', 'data analysis', 'project management', 'agile', 'scrum',
      'html', 'css', 'tailwind', 'api', 'rest', 'graphql', 'python', 'pandas',
      'numpy', 'pytorch', 'tensorflow', 'nlp', 'spacy', 'huggingface', 'fastapi'
    ]
    const lowerContent = content.toLowerCase()
    const skills = commonSkills.filter(skill => lowerContent.includes(skill))

    // Upload to Supabase Storage
    const fileName = `${userId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(fileName)

    // Get user ID from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Save CV record
    const { data: cvData, error: cvError } = await supabase
      .from('cvs')
      .insert({
        user_id: userData.id,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        content: content,
        skills: skills,
        experience: extractExperience(content)
      })
      .select()
      .single()

    if (cvError) {
      return NextResponse.json({ error: cvError.message }, { status: 500 })
    }

    return NextResponse.json(cvData)
  } catch (error) {
    console.error('CV upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractExperience(content: string): string {
  const sentences = content.split(/[.!?]/)
  const experienceKeywords = ['experience', 'worked', 'developer', 'engineer', 'manager', 'analyst']
  const experienceSentences = sentences.filter(sentence =>
    experienceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  )
  return experienceSentences.slice(0, 5).join('. ')
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

    const { data: cvs } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    return NextResponse.json(cvs || [])
  } catch (error) {
    console.error('CV fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
