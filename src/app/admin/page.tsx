'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalUsers: number
  pendingPosts: number
  totalCredits: number
  recentActions: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingPosts: 0,
    totalCredits: 0,
    recentActions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: pendingMarketplace } = await supabase
        .from('marketplace_posts')
        .select('*', { count: 'exact', head: true })
        .eq('admin_status', 'pending')

      const { count: pendingJobs } = await supabase
        .from('job_posts')
        .select('*', { count: 'exact', head: true })
        .eq('admin_status', 'pending')

      const { count: pendingRealEstate } = await supabase
        .from('real_estate_posts')
        .select('*', { count: 'exact', head: true })
        .eq('admin_status', 'pending')

      const { count: pendingBusiness } = await supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('admin_status', 'pending')

      const { data: creditData } = await supabase
        .from('users')
        .select('credits')

      const totalCredits = creditData?.reduce((sum, user) => sum + (user.credits || 0), 0) || 0

      const { count: actionsCount } = await supabase
        .from('admin_actions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      setStats({
        totalUsers: userCount || 0,
        pendingPosts: (pendingMarketplace || 0) + (pendingJobs || 0) + (pendingRealEstate || 0) + (pendingBusiness || 0),
        totalCredits,
        recentActions: actionsCount || 0
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan hệ thống</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Posts chờ duyệt</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingPosts}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.totalCredits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoạt động tuần qua</p>
                <p className="text-2xl font-bold text-blue-600">{stats.recentActions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/posts"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">📝</span>
              <div>
                <p className="font-medium">Duyệt Posts</p>
                <p className="text-sm text-gray-600">{stats.pendingPosts} posts chờ duyệt</p>
              </div>
            </Link>
            
            <Link
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="font-medium">Quản lý Users</p>
                <p className="text-sm text-gray-600">Xem và chỉnh sửa users</p>
              </div>
            </Link>
            
            <Link
              href="/admin/credits"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">💳</span>
              <div>
                <p className="font-medium">Quản lý Credits</p>
                <p className="text-sm text-gray-600">Điều chỉnh credits users</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
