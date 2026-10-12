import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/client'

// Runs on the server so the Clerk secret key never reaches the browser.
export async function POST() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'User has no email address' }, { status: 400 })
    }

    const { error } = await supabase.from('users').upsert(
      {
        clerk_id: user.id,
        email,
        first_name: user.firstName,
        last_name: user.lastName,
      },
      { onConflict: 'clerk_id' }
    )
    if (error) {
      throw error
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
