'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type MarketplacePost = Database['public']['Tables']['marketplace_posts']['Row']

export default function MarketplacePage() {
  const [posts, setPosts] = useState<MarketplacePost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories = [
    { value: '', label: 'Tất cả danh mục' },
    { value: 'electronics', label: 'Điện tử' },
    { value: 'furniture', label: 'Nội thất' },
    { value: 'clothing', label: 'Quần áo' },
    { value: 'books', label: 'Sách' },
    { value: 'sports', label: 'Thể thao' },
    { value: 'automotive', label: 'Ô tô' },
    { value: 'home-garden', label: 'Nhà & Vườn' },
    { value: 'toys', label: 'Đồ chơi' },
    { value: 'other', label: 'Khác' }
  ]

  useEffect(() => {
    loadPosts()
  }, [selectedCategory, searchQuery])

  const loadPosts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('marketplace_posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setPosts(data || [])
    } catch (err) {
      console.error('Error loading marketplace posts:', err)
      setError('Không thể tải tin đăng')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Liên hệ'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryLabel = (value: string) => {
    const category = categories.find(cat => cat.value === value)
    return category ? category.label : value
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Đăng nhập
              </Link>
              <Link href="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Marketplace VietLinker</h1>
          <p className="text-xl mb-8">Mua bán sản phẩm trong cộng đồng Việt Nam tại Mỹ</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tìm kiếm sản phẩm..."
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải tin đăng...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Không có tin đăng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {post.images && post.images.length > 0 ? (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">Không có ảnh</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      {getCategoryLabel(post.category)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-red-600 font-bold text-lg">
                      {formatPrice(post.price)}
                    </span>
                    {post.location && (
                      <span className="text-gray-500 text-sm">{post.location}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(post.created_at)}</span>
                    <Link 
                      href={`/marketplace/${post.id}`}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn muốn đăng tin?</h2>
            <p className="text-gray-600 mb-6">Đăng tin mua bán sản phẩm của bạn ngay hôm nay</p>
            <Link href="/marketplace/create" className="btn btn-primary">
              Đăng tin ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
