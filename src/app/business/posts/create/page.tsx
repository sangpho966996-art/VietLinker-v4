'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface BusinessProfile {
  id: number
  business_name: string
  business_type: 'food' | 'service'
}

export default function CreateBusinessPostPage() {
  const [user, setUser] = useState<User | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'general',
    featured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const postTypes = [
    { value: 'general', label: 'Bài viết chung' },
    { value: 'promotion', label: 'Khuyến mãi' },
    { value: 'announcement', label: 'Thông báo' },
    { value: 'news', label: 'Tin tức' },
  ]

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/login')
          return
        }

        setUser(user)

        const { data: profiles, error: profileError } = await supabase
          .from('business_profiles')
          .select('id, business_name, business_type, created_at')
          .eq('user_id', user.id)

        if (profileError) {
          console.error('Error fetching business profiles:', profileError)
        } else if (profiles && profiles.length > 0) {
          const profile = profiles.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          setBusinessProfile(profile)
          return
        }
        
        router.push('/business/register')
      } catch {
        router.push('/login')
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user || !businessProfile) {
        router.push('/login')
        return
      }

      if (!formData.title || !formData.content) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const { error: insertError } = await supabase
        .from('business_posts')
        .insert({
          business_profile_id: businessProfile.id,
          title: formData.title,
          content: formData.content,
          post_type: formData.post_type,
          featured: formData.featured,
        })

      if (insertError) throw insertError

      router.push('/business/dashboard')
    } catch {
      setError('Có lỗi xảy ra khi tạo bài đăng')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !businessProfile) {
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
              <Link href="/business/dashboard" className="btn btn-secondary">
                Quay lại Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo bài đăng mới</h1>
            <p className="text-gray-600">Tạo bài đăng cho {businessProfile.business_name}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập tiêu đề bài đăng"
                  required
                />
              </div>

              <div>
                <label htmlFor="post_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bài đăng *
                </label>
                <select
                  id="post_type"
                  name="post_type"
                  value={formData.post_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {postTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập nội dung bài đăng"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Bài đăng nổi bật
                </label>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Link href="/business/dashboard" className="btn btn-secondary">
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang tạo...' : 'Tạo bài đăng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
