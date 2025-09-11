'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          return
        }
        setUser(user)
      } catch (_error) {
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null)
          if (event === 'SIGNED_OUT') {
            router.refresh()
          }
        } catch (_error) {
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return
      }
      router.push('/')
    } catch (_error) {
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VietLinker</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace" className="text-gray-700 hover:text-red-600 font-medium">
              Marketplace
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-red-600 font-medium">
              Việc làm
            </Link>
            <Link href="/real-estate" className="text-gray-700 hover:text-red-600 font-medium">
              Bất động sản
            </Link>
            <Link href="/food" className="text-gray-700 hover:text-red-600 font-medium">
              Nhà hàng
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-red-600 font-medium">
              Dịch vụ
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-red-600 font-medium">
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Hồ sơ
                      </Link>
                      <Link
                        href="/credits"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Credits
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSignOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-red-600 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-red-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/marketplace" className="text-gray-700 hover:text-red-600 font-medium">
                Marketplace
              </Link>
              <Link href="/jobs" className="text-gray-700 hover:text-red-600 font-medium">
                Việc làm
              </Link>
              <Link href="/real-estate" className="text-gray-700 hover:text-red-600 font-medium">
                Bất động sản
              </Link>
              <Link href="/food" className="text-gray-700 hover:text-red-600 font-medium">
                Nhà hàng
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-red-600 font-medium">
                Dịch vụ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
