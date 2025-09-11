'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface JobPost {
  id: number
  title: string
  description: string | null
  company: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  job_type: string
  category: string | null
  images: string[] | null
  status: string | null
  created_at: string
  user_id: string
  users?: {
    full_name: string | null
    email: string
  }
}

export default function JobsPage() {
  const [posts, setPosts] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { value: 'all', label: 'Tất cả ngành nghề' },
    { value: 'nails', label: 'Tiệm Nails' },
    { value: 'restaurant', label: 'Nhà hàng Việt Nam' },
    { value: 'medical', label: 'Văn phòng bác sĩ' },
    { value: 'insurance', label: 'Bảo hiểm' },
    { value: 'retail', label: 'Bán lẻ' },
    { value: 'office', label: 'Văn phòng' },
    { value: 'other', label: 'Khác' }
  ]

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('job_posts')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        setError('Không thể tải danh sách việc làm')
        return
      }

      setPosts(data || [])
    } catch {
      setError('Không thể tải danh sách việc làm')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Thỏa thuận'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `Từ $${min.toLocaleString()}`
    if (max) return `Đến $${max.toLocaleString()}`
    return 'Thỏa thuận'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getCategoryLabel = (category: string | null) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : 'Khác'
  }

  const getJobTypeLabel = (jobType: string) => {
    const types: { [key: string]: string } = {
      'full-time': 'Toàn thời gian',
      'part-time': 'Bán thời gian',
      'contract': 'Hợp đồng',
      'temporary': 'Tạm thời',
      'internship': 'Thực tập'
    }
    return types[jobType] || jobType
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách việc làm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Việc làm VietLinker</h1>
          <p className="text-xl mb-8">Tìm việc làm trong cộng đồng Việt Nam tại Mỹ</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm kiếm theo vị trí, công ty, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngành nghề</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Job Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không có tin đăng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/jobs/${post.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {post.images && post.images.length > 0 && (
                    <div className="relative h-48">
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {getJobTypeLabel(post.job_type)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                    {post.company && (
                      <p className="text-gray-600 text-sm mb-2">🏢 {post.company}</p>
                    )}
                    {post.location && (
                      <p className="text-gray-600 text-sm mb-2">📍 {post.location}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-red-600 font-bold">
                        {formatSalary(post.salary_min, post.salary_max)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <div className="mt-3 text-right">
                      <span className="text-red-600 text-sm font-medium hover:underline">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn muốn đăng tin tuyển dụng?</h2>
            <p className="text-gray-600 mb-6">Đăng tin tuyển dụng để tìm nhân viên phù hợp ngay hôm nay</p>
            <Link href="/jobs/create" className="btn btn-primary bg-red-600 hover:bg-red-700">
              Đăng tin ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
