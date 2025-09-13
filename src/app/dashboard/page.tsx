'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [businessProfile, setBusinessProfile] = useState<{
    id: number
    business_name: string
    business_type: string
    created_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        if (authLoading) return
        
        if (!user) {
          router.push('/login')
          return
        }

        const response = await fetch(`/api/business-profiles?user_id=${user.id}`)
        const result = await response.json()
        
        if (!response.ok) {
          setError('Không thể tải thông tin doanh nghiệp')
        } else if (result.data && result.data.length > 0) {
          const profiles = result.data

          const profile = profiles.sort((a: { created_at: string }, b: { created_at: string }) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
          setBusinessProfile(profile)
        }

      } catch {
        setError('Không thể tải thông tin người dùng')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [user, authLoading, router])

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <Link href="/login" className="btn btn-primary">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Quản lý tài khoản và hoạt động của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-2xl">🛍️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Marketplace</h3>
                <p className="text-sm text-gray-600">Đăng tin mua bán</p>
              </div>
            </div>
            <Link href="/marketplace/create" className="btn btn-primary w-full">
              Đăng tin mới
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-2xl">💼</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Việc làm</h3>
                <p className="text-sm text-gray-600">Tìm hoặc đăng việc làm</p>
              </div>
            </div>
            <Link href="/jobs/create" className="btn btn-primary w-full">
              Đăng việc làm
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bất động sản</h3>
                <p className="text-sm text-gray-600">Nhà bán, cho thuê</p>
              </div>
            </div>
            <Link href="/real-estate/create" className="btn btn-primary w-full">
              Đăng bất động sản
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Credits</h3>
                <p className="text-sm text-gray-600">Quản lý credits</p>
              </div>
            </div>
            <Link href="/credits" className="btn btn-secondary w-full">
              Mua credits
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-2xl">🏢</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Doanh nghiệp</h3>
                <p className="text-sm text-gray-600">
                  {businessProfile ? `${businessProfile.business_name}` : 'Đăng ký doanh nghiệp'}
                </p>
              </div>
            </div>
            {businessProfile ? (
              <Link href="/business/dashboard" className="btn btn-primary w-full">
                Vào Business Dashboard
              </Link>
            ) : (
              <Link href="/business/register" className="btn btn-secondary w-full">
                Đăng ký ngay
              </Link>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cài đặt</h3>
                <p className="text-sm text-gray-600">Quản lý tài khoản</p>
              </div>
            </div>
            <Link href="/profile" className="btn btn-secondary w-full">
              Cài đặt
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Tin đăng của tôi</h2>
            <Link href="/my-posts" className="btn btn-primary">
              Xem tất cả tin đăng
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Xem và quản lý tất cả tin đăng của bạn</p>
            <p className="text-sm text-gray-400 mt-2">
              Marketplace, Việc làm, Bất động sản
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
