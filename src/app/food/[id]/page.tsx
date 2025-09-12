'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, BusinessHours } from '@/lib/supabase'
import { copyToClipboard, shareContent, showToast } from '@/lib/contact-utils'

interface BusinessProfile {
  id: number
  user_id: string
  business_name: string
  description: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  state: string
  zip_code: string
  cover_image: string
  logo: string
  hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  created_at: string
}

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image_url: string
}

interface Review {
  id: number
  user_id: string
  rating: number
  comment: string
  created_at: string
  users: {
    full_name: string
    avatar_url: string
  }
}

interface GalleryImage {
  id: string
  file_path: string
  caption: string
  uploaded_at: string
}

export default function FoodBusinessPage() {
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('menu')

  const loadBusinessData = useCallback(async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .eq('business_type', 'food')
        .eq('status', 'active')
        .single()

      if (businessError) {
        setError('Không tìm thấy nhà hàng')
        return
      }

      setBusiness(businessData)

      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_profile_id', businessId)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (!menuError && menuData) {
        setMenuItems(menuData)
      }

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('business_reviews')
        .select(`
          *,
          users (
            full_name,
            avatar_url
          )
        `)
        .eq('business_profile_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData)
      }

      const { data: galleryData, error: galleryError } = await supabase
        .from('business_gallery')
        .select('*')
        .eq('user_id', businessData.user_id)
        .order('uploaded_at', { ascending: false })

      if (!galleryError && galleryData) {
        setGallery(galleryData)
      }

    } catch {
      setError('Không thể tải thông tin nhà hàng')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    if (businessId) {
      loadBusinessData()
    }
  }, [businessId, loadBusinessData])

  const formatHours = (hours: BusinessHours | null): Array<{ day: string; hours: string }> => {
    if (!hours) return []
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    
    return daysOfWeek.map((day, index) => {
      const dayHours = hours[day]
      return {
        day: dayNames[index],
        hours: dayHours?.closed ? 'Đóng cửa' : `${dayHours?.open || '00:00'} - ${dayHours?.close || '00:00'}`
      }
    })
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const handleReservation = () => {
    window.location.href = `/contact?type=food&id=${business?.id}&service=reservation&subject=${encodeURIComponent(`Đặt bàn tại ${business?.business_name || ''}`)}`
  }

  const handleDirections = () => {
    if (business?.address) {
      const encodedAddress = encodeURIComponent(business.address)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
    } else {
      showToast('Không có thông tin địa chỉ')
    }
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href)
    if (success) {
      showToast('Đã sao chép liên kết')
    }
  }

  const handleShare = async () => {
    if (!business) return
    try {
      await shareContent(business.business_name, window.location.href)
      if (!navigator.share) {
        showToast('Đã sao chép liên kết')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin nhà hàng...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy nhà hàng</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/food" className="btn btn-primary">
            Quay lại danh sách nhà hàng
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80">
        {business.cover_image ? (
          <Image
            src={business.cover_image}
            alt={business.business_name}
            className="w-full h-full object-cover"
            fill
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-600"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-end space-x-4">
              {business.logo && (
                <Image
                  src={business.logo}
                  alt={`${business.business_name} logo`}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  width={80}
                  height={80}
                  unoptimized
                />
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{business.business_name}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  {averageRating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{averageRating.toFixed(1)} ({reviews.length} đánh giá)</span>
                    </div>
                  )}
                  <span>Nhà hàng Việt Nam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex space-x-8">
            {['menu', 'about', 'photos', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'menu' && 'Thực đơn'}
                {tab === 'about' && 'Thông tin'}
                {tab === 'photos' && 'Hình ảnh'}
                {tab === 'reviews' && 'Đánh giá'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                {Object.keys(groupedMenuItems).length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Thực đơn đang được cập nhật
                    </h3>
                    <p className="text-gray-600">
                      Vui lòng liên hệ trực tiếp với nhà hàng để biết thêm thông tin về món ăn
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMenuItems).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {category}
                      </h2>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-start space-x-4 p-4 rounded-lg ${
                              item.available ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                            }`}
                          >
                            {item.image_url && (
                              <div className="flex-shrink-0">
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded-lg"
                                  unoptimized
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`font-medium ${
                                  item.available ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {item.name}
                                </h3>
                                {!item.available && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    Hết hàng
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className={`text-sm ${
                                  item.available ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 text-right">
                              <span className={`text-lg font-bold ${
                                item.available ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Về {business.business_name}
                </h2>
                {business.description ? (
                  <p className="text-gray-600 mb-6 whitespace-pre-line">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-gray-500 mb-6">
                    Nhà hàng chưa cập nhật mô tả
                  </p>
                )}

                {/* Business Hours */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Giờ mở cửa</h3>
                  <div className="space-y-2">
                    {formatHours(business.hours).map((dayInfo: { day: string; hours: string }, index: number) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-gray-700">{dayInfo.day}</span>
                        <span className="text-gray-600">
                          {dayInfo.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin liên hệ</h3>
                  <div className="space-y-2">
                    {business.address && (
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">
                          {business.address}, {business.city}, {business.state} {business.zip_code}
                        </span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${business.phone}`} className="text-red-600 hover:text-red-700">
                          {business.phone}
                        </a>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                        <a 
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700"
                        >
                          {business.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Hình ảnh nhà hàng
                </h2>
                {gallery.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Nhà hàng chưa có hình ảnh</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((image) => (
                      <div key={image.id} className="aspect-square">
                        <Image
                          src={image.file_path}
                          alt={image.caption || 'Hình ảnh nhà hàng'}
                          className="w-full h-full object-cover rounded-lg"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Đánh giá từ khách hàng
                </h2>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">Chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {review.users?.avatar_url ? (
                              <Image
                                src={review.users.avatar_url}
                                alt={review.users.full_name || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                                width={40}
                                height={40}
                                unoptimized
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 text-sm font-medium">
                                  {review.users?.full_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {review.users?.full_name || 'Khách hàng'}
                              </span>
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>
                                    {i < review.rating ? '★' : '☆'}
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ</h3>
              <div className="space-y-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Gọi ngay
                  </a>
                )}
                <button 
                  onClick={handleReservation}
                  className="w-full btn btn-secondary"
                >
                  Đặt bàn
                </button>
                <button 
                  onClick={handleDirections}
                  className="w-full btn btn-secondary"
                >
                  Chỉ đường
                </button>
              </div>
            </div>

            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá tổng quan</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">
                        {i < Math.round(averageRating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Dựa trên {reviews.length} đánh giá
                  </p>
                </div>
              </div>
            )}
            
            {/* Share Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chia sẻ</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCopyLink}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  📋 Copy link
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  📱 Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
