'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, BusinessHours } from '@/lib/supabase'

interface BusinessProfile {
  id: number
  business_name: string
  description: string
  phone: string
  address: string
  city: string
  state: string
  cover_image: string
  logo: string
  hours: BusinessHours | null
  created_at: string
}

export default function FoodDirectoryPage() {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [sortByDistance, setSortByDistance] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('userLocation')
    if (stored) {
      setUserLocation(JSON.parse(stored))
    }
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_type', 'food')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        setError('Không thể tải danh sách nhà hàng')
        return
      }

      setBusinesses(data || [])
    } catch {
      setError('Không thể tải danh sách nhà hàng')
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = !selectedCity || business.city === selectedCity
    return matchesSearch && matchesCity
  })

  const cities = [...new Set(businesses.map(b => b.city).filter(Boolean))]

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getBusinessCoordinates = (city: string) => {
    const cityLower = city.toLowerCase()
    if (cityLower.includes('houston')) return { lat: 29.7604, lng: -95.3698 }
    if (cityLower.includes('dallas')) return { lat: 32.7767, lng: -96.7970 }
    if (cityLower.includes('austin')) return { lat: 30.2672, lng: -97.7431 }
    if (cityLower.includes('san antonio')) return { lat: 29.4241, lng: -98.4936 }
    return { lat: 29.7604, lng: -95.3698 } // default to Houston
  }

  const sortBusinessesByDistance = () => {
    if (!userLocation) return

    const businessesWithDistance = businesses.map(business => {
      const businessCoords = getBusinessCoordinates(business.city || '')
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        businessCoords.lat, businessCoords.lng
      )
      return { ...business, distance }
    })

    businessesWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    setBusinesses(businessesWithDistance)
  }

  const formatHours = (hours: BusinessHours | null) => {
    if (!hours) return 'Chưa cập nhật giờ mở cửa'
    
    const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
    const todayHours = hours[today]
    
    if (!todayHours) return 'Chưa cập nhật giờ mở cửa'
    if (todayHours.closed) return 'Đóng cửa hôm nay'
    
    return `${todayHours.open} - ${todayHours.close}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách nhà hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Nhà hàng &amp; Quán ăn Việt Nam
            </h1>
            <p className="text-lg text-gray-600">
              Khám phá những nhà hàng Việt Nam tuyệt vời trong cộng đồng
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm nhà hàng
                </label>
                <input
                  type="text"
                  placeholder="Tên nhà hàng, món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành phố
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Tất cả thành phố</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {userLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp theo khoảng cách
                  </label>
                  <button
                    onClick={() => {
                      setSortByDistance(!sortByDistance)
                      if (!sortByDistance) {
                        sortBusinessesByDistance()
                      } else {
                        loadBusinesses() // Reset to original order
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                      sortByDistance 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {sortByDistance ? '🎯 Gần nhất' : '📍 Sắp xếp theo khoảng cách'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Business Grid */}
          {filteredBusinesses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có nhà hàng nào
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCity ? 'Không tìm thấy nhà hàng phù hợp với tìm kiếm của bạn' : 'Chưa có nhà hàng nào đăng ký'}
              </p>
              <Link
                href="/business/register"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Đăng ký nhà hàng của bạn
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/food/${business.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Cover Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {business.cover_image ? (
                      <Image
                        src={business.cover_image}
                        alt={business.business_name}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Logo overlay */}
                    {business.logo && (
                      <div className="absolute bottom-2 left-2">
                        <Image
                          src={business.logo}
                          alt={`${business.business_name} logo`}
                          className="w-12 h-12 rounded-full border-2 border-white object-cover"
                          width={48}
                          height={48}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {business.business_name}
                    </h3>
                    
                    {business.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-500">
                      {business.address && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">
                            {business.address}, {business.city}, {business.state}
                          </span>
                          {(business as BusinessProfile & { distance?: number }).distance && (
                            <span className="ml-2 text-green-600 font-medium">
                              • {(business as BusinessProfile & { distance?: number }).distance!.toFixed(1)} miles
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatHours(business.hours)}</span>
                      </div>

                      {business.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{business.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bạn có nhà hàng Việt Nam?
              </h2>
              <p className="text-gray-600 mb-6">
                Tham gia cộng đồng VietLinker để tiếp cận khách hàng Việt Nam tại Mỹ
              </p>
              <Link
                href="/business/register"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Đăng ký ngay - Chỉ 50 Credits
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
