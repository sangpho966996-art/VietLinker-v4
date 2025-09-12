'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { stripePromise } from '@/lib/stripe'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@supabase/supabase-js'

interface CreditPackage {
  credits: number
  price: number
  popular?: boolean
}

const creditPackages: CreditPackage[] = [
  { credits: 10, price: 10 },
  { credits: 25, price: 25, popular: true },
  { credits: 50, price: 50 },
  { credits: 100, price: 100 },
]

function CreditsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<{
    id: string
    email: string
    full_name?: string
    credits: number
    created_at: string
    updated_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (authLoading) return
        
        if (!user) {
          router.push('/login')
          return
        }

        const response = await fetch(`/api/user/profile`)
        if (response.ok) {
          const profile = await response.json()
          setUserProfile(profile)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success) {
      router.replace('/credits?message=success')
    } else if (canceled) {
      router.replace('/credits?message=canceled')
    }
  }, [router, searchParams])

  const handlePurchase = async (credits: number) => {
    if (!user) return

    setPurchasing(credits)

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits,
          userId: user.id,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        return
      }

      const stripe = await stripePromise
      if (!stripe) {
        return
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
      }
    } catch {
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Mua Credits
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Credits được sử dụng để đăng tin trong Marketplace, Việc làm và Bất động sản
              </p>
              
              {userProfile && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Credits hiện tại</p>
                      <p className="text-3xl font-bold text-red-600">
                        {userProfile.credits || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`bg-white rounded-lg shadow-md p-6 relative ${
                    pkg.popular ? 'ring-2 ring-red-600' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Phổ biến
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {pkg.credits} Credits
                    </h3>
                    <p className="text-3xl font-bold text-red-600 mb-4">
                      ${pkg.price}
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </p>
                    
                    <button
                      onClick={() => handlePurchase(pkg.credits)}
                      disabled={purchasing === pkg.credits}
                      className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing === pkg.credits ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang xử lý...
                        </div>
                      ) : (
                        'Mua ngay'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cách sử dụng Credits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">🛒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Marketplace</h3>
                  <p className="text-sm text-gray-600">
                    1 credit/ngày cho mỗi tin đăng bán hàng
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 text-xl">💼</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Việc làm</h3>
                  <p className="text-sm text-gray-600">
                    1 credit/ngày cho mỗi tin tuyển dụng
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 text-xl">🏠</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bất động sản</h3>
                  <p className="text-sm text-gray-600">
                    1 credit/ngày cho mỗi tin bất động sản
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <CreditsPageContent />
    </Suspense>
  )
}
