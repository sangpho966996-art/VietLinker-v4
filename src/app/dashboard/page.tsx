'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          throw new Error(`Failed to get user: ${userError.message}`)
        }

        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError.message)
        } else if (profileData) {
          setProfile(profileData)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('Dashboard error:', errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

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

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Người dùng'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VietLinker</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Xin chào, {displayName}</span>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <p className="text-sm text-gray-600">Đăng ký doanh nghiệp</p>
              </div>
            </div>
            <Link href="/business/register" className="btn btn-secondary w-full">
              Đăng ký ngay
            </Link>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có hoạt động nào</p>
            <p className="text-sm text-gray-400 mt-2">
              Bắt đầu bằng cách đăng tin hoặc tìm kiếm dịch vụ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
