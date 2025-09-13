'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

interface BusinessProfile {
  id: number
  business_name: string
  business_type: 'food' | 'service'
}

interface BusinessPost {
  id: number
  title: string
  content: string
  post_type: string
  featured: boolean
  created_at: string
  updated_at: string
}

export default function BusinessPostsPage() {
  const { user, loading: authLoading } = useAuth()
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [posts, setPosts] = useState<BusinessPost[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        if (authLoading) return
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profiles, error: profileError } = await supabase
          .from('business_profiles')
          .select('id, business_name, business_type, created_at')
          .eq('user_id', user.id)

        if (profileError) {
          
        } else if (profiles && profiles.length > 0) {
          const profile = profiles.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          setBusinessProfile(profile)
          
          const { data: postsData, error: postsError } = await supabase
            .from('business_posts')
            .select('*')
            .eq('business_profile_id', profile.id)
            .order('created_at', { ascending: false })

          if (!postsError) {
            setPosts(postsData || [])
          }
          return
        }
        
        router.push('/business/register')
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserAndLoadData()
  }, [authLoading, user, router])

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return

    try {
      const { error } = await supabase
        .from('business_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      setPosts(posts.filter(post => post.id !== postId))
    } catch {
      alert('Có lỗi xảy ra khi xóa bài đăng')
    }
  }

  const getPostTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: 'Bài viết chung',
      promotion: 'Khuyến mãi',
      announcement: 'Thông báo',
      news: 'Tin tức',
    }
    return types[type] || type
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

  if (!user || !businessProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Bài đăng - {businessProfile.business_name}
              </h1>
              <div className="flex space-x-4">
                <Link
                  href="/business/posts/create"
                  className="btn btn-primary"
                >
                  Tạo bài đăng mới
                </Link>
                <Link
                  href="/business/dashboard"
                  className="btn btn-secondary"
                >
                  Quay lại Dashboard
                </Link>
              </div>
            </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài đăng nào
              </h3>
              <p className="text-gray-600 mb-4">
                Bắt đầu bằng cách tạo bài đăng đầu tiên cho doanh nghiệp của bạn
              </p>
              <Link
                href="/business/posts/create"
                className="btn btn-primary"
              >
                Tạo bài đăng đầu tiên
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                        {post.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Nổi bật
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {getPostTypeLabel(post.post_type)}
                        </span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-700">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
