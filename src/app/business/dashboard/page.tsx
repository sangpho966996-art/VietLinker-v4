'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Header from '@/components/Header'

interface BusinessProfile {
  id: number
  business_name: string
  business_type: 'food' | 'service'
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  cover_image: string | null
  logo: string | null
  status: string
  created_at: string
}

export default function BusinessDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)

  const checkUserAndLoadProfile = useCallback(async () => {
    try {
      if (authLoading) return
      
      if (!user) {
        router.push('/login')
        return
      }


      const response = await fetch(`/api/business/profiles?user_id=${user.id}`)
      const result = await response.json()
      
      if (!response.ok) {
        console.error('Error fetching business profiles:', result.error)
        return
      }
      
      const profiles = result.data


      if (profiles && profiles.length > 0) {
        const profile = profiles.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        setBusinessProfile(profile)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [router, user, authLoading])

  useEffect(() => {
    checkUserAndLoadProfile()
  }, [checkUserAndLoadProfile])

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

  if (!businessProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6m-6 4h6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Chưa có Business Profile
              </h1>
              <p className="text-gray-600 mb-6">
                Bạn chưa đăng ký business profile. Đăng ký ngay để có profile vĩnh viễn và đăng tin không giới hạn!
              </p>
              <Link
                href="/business/register"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                Đăng ký Business Profile (50 Credits)
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      {/* Business Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {businessProfile.business_name}
              </h1>
              <p className="text-gray-600">
                {businessProfile.business_type === 'food' ? '🍜 Nhà hàng' : '🛠️ Dịch vụ'} • 
                Đăng ký: {new Date(businessProfile.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href={`/business/profile/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa Profile
              </Link>
              <Link
                href={`/${businessProfile.business_type}/${businessProfile.id}`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Xem Public Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/business/posts/create"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Tạo bài đăng mới</h3>
                    <p className="text-sm text-gray-600">Đăng tin không giới hạn</p>
                  </div>
                </Link>

                {businessProfile.business_type === 'food' && (
                  <Link
                    href="/business/menu/manage"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">Quản lý Menu</h3>
                      <p className="text-sm text-gray-600">Cập nhật món ăn và giá cả</p>
                    </div>
                  </Link>
                )}

                <Link
                  href="/business/gallery/manage"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Quản lý Hình ảnh</h3>
                    <p className="text-sm text-gray-600">Upload và sắp xếp photos</p>
                  </div>
                </Link>

                <Link
                  href="/business/analytics"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Thống kê</h3>
                    <p className="text-sm text-gray-600">Xem views và engagement</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Bài đăng gần đây</h2>
                <Link
                  href="/business/posts"
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">Chưa có bài đăng nào</p>
                <Link
                  href="/business/posts/create"
                  className="mt-2 inline-block text-red-600 hover:text-red-700 font-medium"
                >
                  Tạo bài đăng đầu tiên
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin Profile</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Loại hình:</span>
                  <p className="font-medium">
                    {businessProfile.business_type === 'food' ? '🍜 Nhà hàng' : '🛠️ Dịch vụ'}
                  </p>
                </div>
                {businessProfile.phone && (
                  <div>
                    <span className="text-sm text-gray-600">Điện thoại:</span>
                    <p className="font-medium">{businessProfile.phone}</p>
                  </div>
                )}
                {businessProfile.email && (
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{businessProfile.email}</p>
                  </div>
                )}
                {businessProfile.address && (
                  <div>
                    <span className="text-sm text-gray-600">Địa chỉ:</span>
                    <p className="font-medium">
                      {businessProfile.address}
                      {businessProfile.city && `, ${businessProfile.city}`}
                      {businessProfile.state && `, ${businessProfile.state}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê nhanh</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng bài đăng:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lượt xem profile:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá:</span>
                  <span className="font-medium">Chưa có</span>
                </div>
              </div>
            </div>

            {/* Benefits Reminder */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Business Profile Benefits
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Đăng tin không giới hạn</li>
                      <li>Profile vĩnh viễn</li>
                      <li>Xuất hiện trong directory</li>
                      <li>Nhận reviews từ khách hàng</li>
                      <li>Analytics chi tiết</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
