"use client"

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

function ClerkAuthSync() {
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded || !userId) {
      return
    }
    // The sync runs in /api/users/sync: calling Clerk's backend API needs the
    // secret key, which must never be bundled into client code.
    fetch('/api/users/sync', { method: 'POST' }).catch((error) => {
      console.error('Error syncing user with Supabase:', error)
    })
  }, [userId, isLoaded])

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
