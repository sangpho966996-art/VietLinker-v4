'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

interface AdminAction {
  id: number
  action_type: string
  target_type: string
  created_at: string
  users?: {
    email: string
    full_name: string | null
  } | {
    email: string
    full_name: string | null
  }[]
}

interface AnalyticsData {
  totalUsers: number
  totalPosts: number
  totalBusinesses: number
  totalCredits: number
  newUsersThisMonth: number
  newPostsThisMonth: number
  recentActions: AdminAction[]
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalPosts: 0,
    totalBusinesses: 0,
    totalCredits: 0,
    newUsersThisMonth: 0,
    newPostsThisMonth: 0,
    recentActions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [
        { count: totalUsers },
        { count: totalMarketplace },
        { count: totalJobs },
        { count: totalRealEstate },
        { count: totalBusinesses },
        { data: creditData },
        { count: newUsersThisMonth },
        { count: newPostsThisMonth },
        { data: recentActions }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('marketplace_posts').select('*', { count: 'exact', head: true }),
        supabase.from('job_posts').select('*', { count: 'exact', head: true }),
        supabase.from('real_estate_posts').select('*', { count: 'exact', head: true }),
        supabase.from('business_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('credits'),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('marketplace_posts').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
        supabase.from('admin_actions').select(`
          id, action_type, target_type, created_at,
          users!inner(email, full_name)
        `).order('created_at', { ascending: false }).limit(10)
      ])

      const totalCredits = creditData?.reduce((sum, user) => sum + (user.credits || 0), 0) || 0
      const totalPosts = (totalMarketplace || 0) + (totalJobs || 0) + (totalRealEstate || 0)

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalPosts,
        totalBusinesses: totalBusinesses || 0,
        totalCredits,
        newUsersThisMonth: newUsersThisMonth || 0,
        newPostsThisMonth: newPostsThisMonth || 0,
        recentActions: recentActions || []
      })
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thống kê hệ thống</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                <p className="text-xs text-green-600">+{analytics.newUsersThisMonth} tháng này</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Posts</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalPosts}</p>
                <p className="text-xs text-green-600">+{analytics.newPostsThisMonth} tháng này</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh nghiệp</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBusinesses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Credits</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalCredits}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Hoạt động admin gần đây</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {analytics.recentActions.length > 0 ? (
              analytics.recentActions.map((action) => (
                <div key={action.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {Array.isArray(action.users) ? (action.users[0]?.full_name || action.users[0]?.email) : (action.users?.full_name || action.users?.email)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {action.action_type} - {action.target_type}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(action.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                Chưa có hoạt động nào
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
