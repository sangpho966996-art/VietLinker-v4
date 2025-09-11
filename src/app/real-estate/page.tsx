'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type RealEstatePost = Database['public']['Tables']['real_estate_posts']['Row']

export default function RealEstatePage() {
  const [posts, setPosts] = useState<RealEstatePost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [priceRange, setPriceRange] = useState<string>('')

  const propertyTypes = [
    { value: '', label: 'Tất cả loại bất động sản' },
    { value: 'house', label: 'Nhà' },
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'condo', label: 'Chung cư' },
    { value: 'townhouse', label: 'Nhà phố' },
    { value: 'land', label: 'Đất' },
    { value: 'commercial', label: 'Thương mại' },
    { value: 'room-rental', label: 'Cho thuê phòng' }
  ]

  const priceRanges = [
    { value: '', label: 'Tất cả mức giá' },
    { value: '0-100000', label: 'Dưới $100,000' },
    { value: '100000-300000', label: '$100,000 - $300,000' },
    { value: '300000-500000', label: '$300,000 - $500,000' },
    { value: '500000-800000', label: '$500,000 - $800,000' },
    { value: '800000-1000000', label: '$800,000 - $1,000,000' },
    { value: '1000000-999999999', label: 'Trên $1,000,000' }
  ]

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('real_estate_posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (selectedPropertyType) {
        query = query.eq('property_type', selectedPropertyType)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number)
        if (max === 999999999) {
          query = query.gte('price', min)
        } else {
          query = query.gte('price', min).lte('price', max)
        }
      }

      const { data, error } = await query

      if (error) throw error

      setPosts(data || [])
    } catch (_err) {
      setError('Không thể tải tin đăng bất động sản')
    } finally {
      setLoading(false)
    }
  }, [selectedPropertyType, searchQuery, priceRange])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const formatPrice = (price: number | null) => {
    if (!price) return 'Liên hệ'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPropertyTypeLabel = (value: string) => {
    const propertyType = propertyTypes.find(type => type.value === value)
    return propertyType ? propertyType.label : value
  }

  const formatPropertyDetails = (post: RealEstatePost) => {
    const details: string[] = []
    if (post.bedrooms) details.push(`${post.bedrooms} phòng ngủ`)
    if (post.bathrooms) details.push(`${post.bathrooms} phòng tắm`)
    if (post.square_feet) details.push(`${post.square_feet} sq ft`)
    return details.join(' • ')
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
          <h1 className="text-4xl font-bold mb-4">Bất động sản VietLinker</h1>
          <p className="text-xl mb-8">Mua bán, cho thuê bất động sản trong cộng đồng Việt Nam tại Mỹ</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Tìm kiếm theo địa chỉ, tiêu đề..."
              />
            </div>
            <div>
              <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-2">
                Loại bất động sản
              </label>
              <select
                id="property-type"
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <select
                id="price-range"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
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
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">Không có ảnh</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      {getPropertyTypeLabel(post.property_type)}
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
                  </div>

                  {formatPropertyDetails(post) && (
                    <p className="text-gray-500 text-sm mb-2">{formatPropertyDetails(post)}</p>
                  )}

                  {(post.address || post.city) && (
                    <p className="text-gray-500 text-sm mb-3">
                      📍 {[post.address, post.city, post.state].filter(Boolean).join(', ')}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(post.created_at)}</span>
                    <Link 
                      href={`/real-estate/${post.id}`}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn muốn đăng tin bất động sản?</h2>
            <p className="text-gray-600 mb-6">Đăng tin mua bán, cho thuê bất động sản của bạn ngay hôm nay</p>
            <Link href="/real-estate/create" className="btn btn-primary bg-red-600 hover:bg-red-700">
              Đăng tin ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
