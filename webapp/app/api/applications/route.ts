import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'

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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('applications')
      .select('*, cover_letters(*)')
      .eq('user_id', userData.id)
      .order('applied_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications } = await query

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { company, position, job_url, notes } = body

    if (!company || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: company, position' },
        { status: 400 }
      )
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        user_id: userData.id,
        company,
        position,
        job_url,
        notes
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
