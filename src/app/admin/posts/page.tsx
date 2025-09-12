'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'


interface PendingPost {
  id: string
  title: string
  description: string
  user_id: string
  user_email: string
  user_name: string
  created_at: string
  table_name: string
  admin_status: 'pending' | 'approved' | 'rejected'
  users?: {
    email: string
    full_name: string | null
  } | {
    email: string
    full_name: string | null
  }[]
}

export default function AdminPosts() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PendingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const loadPosts = useCallback(async () => {
    try {
      const tables = ['marketplace_posts', 'job_posts', 'real_estate_posts', 'business_profiles']
      const allPosts: PendingPost[] = []

      for (const table of tables) {
        let selectFields = `
          id, title, description, user_id, admin_status, created_at,
          users(email, full_name)
        `
        
        if (table === 'business_profiles') {
          selectFields = `
            id, business_name, description, user_id, admin_status, created_at,
            users(email, full_name)
          `
        }

        const query = supabase
          .from(table)
          .select(selectFields)
          .order('created_at', { ascending: false })

        if (filter !== 'all') {
          query.eq('admin_status', filter)
        }

        const { data } = await query

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const postsWithTable = data.map((post: any): PendingPost => ({
            id: post.id,
            title: table === 'business_profiles' ? (post.business_name || '') : (post.title || ''),
            description: post.description || '',
            user_id: post.user_id,
            admin_status: post.admin_status,
            created_at: post.created_at,
            table_name: table,
            user_email: Array.isArray(post.users) ? post.users[0]?.email || '' : post.users?.email || '',
            user_name: Array.isArray(post.users) ? (post.users[0]?.full_name || post.users[0]?.email || 'Unknown User') : (post.users?.full_name || post.users?.email || 'Unknown User')
          }))
          allPosts.push(...postsWithTable)
        }
      }

      allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setPosts(allPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadPosts()
  }, [filter, loadPosts])

  const handleApprovePost = async (post: PendingPost) => {
    try {
      const { error } = await supabase
        .from(post.table_name)
        .update({ 
          admin_status: 'approved',
          status: 'active'
        })
        .eq('id', post.id)

      if (error) throw error

      if (user) {
        await supabase.from('admin_actions').insert({
          admin_user_id: user.id,
          action_type: 'approve_post',
          target_type: post.table_name,
          target_id: post.id,
          details: { title: post.title }
        })
      }

      loadPosts()
    } catch (error) {
      console.error('Error approving post:', error)
    }
  }

  const handleRejectPost = async (post: PendingPost) => {
    try {
      const { error } = await supabase
        .from(post.table_name)
        .update({ admin_status: 'rejected' })
        .eq('id', post.id)

      if (error) throw error

      if (user) {
        await supabase.from('admin_actions').insert({
          admin_user_id: user.id,
          action_type: 'reject_post',
          target_type: post.table_name,
          target_id: post.id,
          details: { title: post.title }
        })
      }

      loadPosts()
    } catch (error) {
      console.error('Error rejecting post:', error)
    }
  }

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case 'marketplace_posts': return 'Marketplace'
      case 'job_posts': return 'Việc làm'
      case 'real_estate_posts': return 'Bất động sản'
      case 'business_profiles': return 'Doanh nghiệp'
      default: return tableName
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Posts</h2>
          
          <div className="flex space-x-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'Tất cả' : 
                 status === 'pending' ? 'Chờ duyệt' :
                 status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={`${post.table_name}-${post.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {post.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{post.user_name}</div>
                      <div className="text-sm text-gray-500">{post.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getTableDisplayName(post.table_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        post.admin_status === 'approved' ? 'bg-green-100 text-green-800' :
                        post.admin_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.admin_status === 'approved' ? 'Đã duyệt' :
                         post.admin_status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {post.admin_status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprovePost(post)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectPost(post)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có posts nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
