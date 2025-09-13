'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const { user } = await response.json()
          setUser(user)
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
