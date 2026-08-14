"use client"

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function ClerkAuthSync() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && userId) {
      syncUserWithSupabase(userId)
    }
  }, [userId, isLoaded])

  const syncUserWithSupabase = async (clerkUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Create user in Supabase
        const { data: clerkUser } = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }).then(res => res.json())

        await supabase.from('users').upsert({
          clerk_id: userId,
          email: clerkUser.email_addresses[0].email_address,
          first_name: clerkUser.first_name,
          last_name: clerkUser.last_name,
        })
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error)
    }
  }

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ClerkAuthSync />
      {children}
    </ClerkProvider>
  )
}
