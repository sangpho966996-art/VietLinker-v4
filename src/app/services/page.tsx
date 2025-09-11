'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { supabase, BusinessHours } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

interface BusinessProfile {
  id: number
  business_name: string
  business_type: string
  description: string
  address: string
  phone: string
  website: string
  hours: BusinessHours | null
  status: string
  created_at: string
}

export default function ServicesPage() {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    fetchServiceBusinesses()
  }, [])

  const fetchServiceBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_type', 'service')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBusinesses(data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = !selectedCity || business.address.toLowerCase().includes(selectedCity.toLowerCase())
    return matchesSearch && matchesCity
  })

  const formatHours = (hours: BusinessHours | null) => {
    if (!hours || typeof hours !== 'object') return 'Chưa cập nhật'
    
    const today = new Date().getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = dayNames[today]
    const todayHours = hours[todayKey]
    
    if (!todayHours) return 'Chưa cập nhật'
    if (todayHours.closed) return 'Đóng cửa hôm nay'
    
    return `${todayHours.open} - ${todayHours.close}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Dịch vụ Việt Nam</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Khám phá các dịch vụ chuyên nghiệp từ cộng đồng Việt Nam
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ, tên công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tất cả thành phố</option>
                <option value="houston">Houston, TX</option>
                <option value="dallas">Dallas, TX</option>
                <option value="austin">Austin, TX</option>
                <option value="san antonio">San Antonio, TX</option>
                <option value="california">California</option>
                <option value="new york">New York</option>
                <option value="florida">Florida</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCity 
                ? 'Không tìm thấy dịch vụ phù hợp với tìm kiếm của bạn.'
                : 'Hãy là người đầu tiên đăng ký dịch vụ của bạn!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/services/${business.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <p className="text-sm text-gray-500">Dịch vụ chuyên nghiệp</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {business.business_name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2 flex-shrink-0">📍</span>
                      <span className="line-clamp-1">{business.address}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="mr-2 flex-shrink-0">🕐</span>
                      <span>{formatHours(business.hours)}</span>
                    </div>
                    
                    {business.phone && (
                      <div className="flex items-center">
                        <span className="mr-2 flex-shrink-0">📞</span>
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-sm text-gray-600">Chưa có đánh giá</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(business.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
