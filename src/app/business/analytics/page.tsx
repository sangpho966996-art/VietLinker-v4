'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  totalContacts: number
  weeklyViews: number[]
  topPages: { page: string; views: number }[]
  recentActivity: { date: string; action: string; count: number }[]
}

export default function BusinessAnalyticsPage() {
  const [businessProfile, setBusinessProfile] = useState<{
    id: number
    business_name: string
    business_type: string
    description: string
    phone: string
    website?: string
    address: string
    city: string
    state: string
    zip_code?: string
    hours?: {
      [key: string]: {
        open: string
        close: string
        closed: boolean
      }
    }
    cover_image?: string
    logo?: string
    created_at: string
    updated_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    totalContacts: 0,
    weeklyViews: [],
    topPages: [],
    recentActivity: [],
  })
  const router = useRouter()

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          return
        }


        const { data: profiles, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)

        if (profileError) {
          console.error('Error fetching business profiles:', profileError)
        } else if (profiles && profiles.length > 0) {
          const profile = profiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          setBusinessProfile(profile)
          loadAnalyticsData()
          return
        }
        
        router.push('/business/register')
        return
        loadAnalyticsData()
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  const loadAnalyticsData = () => {
    const mockData: AnalyticsData = {
      totalViews: Math.floor(Math.random() * 1000) + 100,
      totalClicks: Math.floor(Math.random() * 200) + 20,
      totalContacts: Math.floor(Math.random() * 50) + 5,
      weeklyViews: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10),
      topPages: [
        { page: 'Trang chủ doanh nghiệp', views: Math.floor(Math.random() * 300) + 50 },
        { page: 'Thực đơn', views: Math.floor(Math.random() * 200) + 30 },
        { page: 'Thư viện ảnh', views: Math.floor(Math.random() * 150) + 20 },
        { page: 'Liên hệ', views: Math.floor(Math.random() * 100) + 10 },
      ],
      recentActivity: [
        { date: '2024-01-15', action: 'Lượt xem trang', count: 25 },
        { date: '2024-01-14', action: 'Nhấp vào số điện thoại', count: 8 },
        { date: '2024-01-13', action: 'Xem thực đơn', count: 15 },
        { date: '2024-01-12', action: 'Lượt xem trang', count: 32 },
        { date: '2024-01-11', action: 'Nhấp vào địa chỉ', count: 6 },
      ],
    }

    setAnalyticsData(mockData)
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

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const maxViews = Math.max(...analyticsData.weeklyViews)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Thống kê doanh nghiệp - {businessProfile?.business_name}
            </h1>
            <div className="text-sm text-gray-600">
              Cập nhật: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Lượt xem</h3>
                  <p className="text-3xl font-bold text-blue-600">{analyticsData.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Tổng lượt xem trang</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Nhấp chuột</h3>
                  <p className="text-3xl font-bold text-green-600">{analyticsData.totalClicks.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Tổng lượt nhấp</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Liên hệ</h3>
                  <p className="text-3xl font-bold text-purple-600">{analyticsData.totalContacts.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Lượt liên hệ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lượt xem theo tuần
              </h2>
              <div className="flex items-end justify-between h-40 space-x-2">
                {analyticsData.weeklyViews.map((views, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-red-600 rounded-t"
                      style={{
                        height: `${(views / maxViews) * 120}px`,
                        minHeight: '4px',
                      }}
                    ></div>
                    <div className="mt-2 text-xs text-gray-600">{weekDays[index]}</div>
                    <div className="text-xs font-medium text-gray-900">{views}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Trang được xem nhiều nhất
              </h2>
              <div className="space-y-3">
                {analyticsData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-900">{page.page}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">{page.views}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hoạt động gần đây
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Ngày</th>
                    <th className="text-left py-2 text-gray-600">Hoạt động</th>
                    <th className="text-right py-2 text-gray-600">Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.recentActivity.map((activity, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">
                        {new Date(activity.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 text-gray-700">{activity.action}</td>
                      <td className="py-3 text-right font-medium text-red-600">
                        {activity.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Gợi ý cải thiện
            </h2>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Cập nhật thực đơn thường xuyên để thu hút khách hàng quay lại</li>
              <li>• Thêm ảnh chất lượng cao vào thư viện để tăng lượt xem</li>
              <li>• Phản hồi nhanh chóng các tin nhắn liên hệ để cải thiện trải nghiệm khách hàng</li>
              <li>• Cập nhật giờ hoạt động chính xác để tránh khách hàng đến nhầm giờ</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/business/dashboard')}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
