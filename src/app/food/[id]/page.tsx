'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, BusinessHours } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { copyToClipboard, shareContent, showToast } from '@/lib/contact-utils'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

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
  const { user: currentUser } = useAuth()

  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showFullMenu, setShowFullMenu] = useState(false)

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


  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const handleCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`
    }
  }

  const handleBooking = (businessName: string, phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`
    }
  }


  const handleDirections = (address?: string) => {
    const targetAddress = address || business?.address
    if (targetAddress) {
      const encodedAddress = encodeURIComponent(targetAddress)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
    } else {
      showToast('Không có thông tin địa chỉ')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname)
      return
    }

    setSubmittingReview(true)
    try {
      const { error } = await supabase
        .from('business_reviews')
        .insert({
          business_profile_id: parseInt(businessId),
          user_id: currentUser.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })

      if (error) throw error

      await loadBusinessData()
      setShowReviewModal(false)
      setReviewForm({ rating: 5, comment: '' })
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmittingReview(false)
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
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      {/* Yelp-Inspired Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        {business.cover_image ? (
          <Image
            src={business.cover_image}
            alt={`${business.business_name} cover`}
            className="w-full h-full object-cover"
            fill
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
        
        {/* Business Info Overlay - Yelp Style */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                {business.business_name}
              </h1>
              
              {/* Rating and Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${
                        star <= (averageRating || 4.5) ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-lg font-medium">
                    {averageRating ? averageRating.toFixed(1) : '4.5'}
                  </span>
                  <span className="text-gray-300">
                    ({reviews.length || 0} đánh giá)
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-lg">Nhà hàng Việt Nam</span>
                <span className="text-gray-300">•</span>
                <span className="text-lg">$$</span>
              </div>

              {/* Business Details */}
              <div className="flex flex-wrap items-center text-lg space-x-6 mb-6">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {business?.address || 'Địa chỉ đang cập nhật'}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {business?.phone || 'Số điện thoại đang cập nhật'}
                </span>
                <span className="flex items-center text-green-400">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Đang mở cửa
                </span>
              </div>

              {/* Action Buttons - Yelp Style */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Viết đánh giá
                </button>
                
                {currentUser && business && currentUser.id === business.user_id && (
                  <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/30 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Thêm ảnh
                  </button>
                )}
                
                <button 
                  onClick={() => shareContent(business.business_name, window.location.href)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/30 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Chia sẻ
                </button>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/30 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Yelp Style Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Menu Section - Yelp Style */}
            {menuItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                    {menuItems.length > 6 && (
                      <button 
                        onClick={() => setShowFullMenu(!showFullMenu)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        {showFullMenu ? 'Thu gọn ←' : 'Xem menu đầy đủ →'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {showFullMenu ? 'Menu đầy đủ' : 'Món phổ biến'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(showFullMenu ? menuItems : menuItems.slice(0, 6)).map((item) => (
                      <div
                        key={item.id}
                        className={`flex space-x-4 p-4 rounded-lg border hover:shadow-md transition-shadow ${
                          item.available ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        {item.image_url && (
                          <div className="flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="w-24 h-24 object-cover rounded-lg"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-semibold text-lg ${
                              item.available ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {item.name}
                            </h4>
                            <span className={`font-bold text-lg ml-2 ${
                              item.available ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {item.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          {item.description && (
                            <p className={`text-sm line-clamp-2 ${
                              item.available ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {item.description}
                            </p>
                          )}
                          {!item.available && (
                            <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!showFullMenu && menuItems.length > 6 && (
                    <div className="mt-6 text-center">
                      <button 
                        onClick={() => setShowFullMenu(true)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Xem thêm {menuItems.length - 6} món khác
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Section - Yelp Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Về {business.business_name}
              </h2>
              {business.description ? (
                <p className="text-gray-600 mb-6 whitespace-pre-line leading-relaxed">
                  {business.description}
                </p>
              ) : (
                <p className="text-gray-500 mb-6">
                  Nhà hàng chưa cập nhật mô tả
                </p>
              )}

              {/* Business Hours */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Giờ mở cửa</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {formatHours(business.hours).map((dayInfo: { day: string; hours: string }, index: number) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-gray-700 font-medium">{dayInfo.day}</span>
                        <span className="text-gray-600">
                          {dayInfo.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Section - Yelp Style */}
            {gallery.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hình ảnh ({gallery.length})
                  </h2>
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Xem tất cả →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {gallery.slice(0, 8).map((image) => (
                    <div key={image.id} className="aspect-square">
                      <Image
                        src={image.file_path}
                        alt={image.caption || 'Hình ảnh nhà hàng'}
                        className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section - Yelp Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Đánh giá và nhận xét
                </h2>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Viết đánh giá
                </button>
              </div>
              
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá nào</h3>
                  <p className="text-gray-500">Hãy là người đầu tiên đánh giá nhà hàng này!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {review.users?.avatar_url ? (
                            <Image
                              src={review.users.avatar_url}
                              alt={review.users.full_name || 'User'}
                              className="w-12 h-12 rounded-full object-cover"
                              width={48}
                              height={48}
                              unoptimized
                            />
                          ) : (
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 text-lg font-semibold">
                                {review.users?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {review.users?.full_name || 'Khách hàng'}
                            </span>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d={i < review.rating 
                                    ? "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    : "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                  } />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {reviews.length > 3 && (
                    <div className="text-center pt-4">
                      <button className="text-red-600 hover:text-red-700 font-medium">
                        Xem thêm {reviews.length - 3} đánh giá khác
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar - Yelp Style */}
          <div className="space-y-6">
            {/* Order/Contact Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Đặt món</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian giao hàng</span>
                  <span className="font-medium">25-40 phút</span>
                </div>
              </div>

              <button
                onClick={() => handleBooking(business.business_name, business.phone)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-lg font-bold text-lg transition-colors mb-4"
              >
                Bắt đầu đặt món
              </button>

              <div className="space-y-2">
                <button
                  onClick={() => handleCall(business.phone)}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Gọi ngay
                </button>
                <button
                  onClick={() => handleDirections(business.address)}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Chỉ đường
                </button>
              </div>
            </div>

            {/* Rating Summary - Yelp Style */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá tổng quan</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d={i < Math.round(averageRating) 
                          ? "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          : "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        } />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Dựa trên {reviews.length} đánh giá
                  </p>
                </div>
              </div>
            )}

            {/* Business Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin</h3>
              <div className="space-y-3 text-sm">
                {business.website && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                      {business.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-700">{business.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 mr-3 mt-0.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{business.address || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chia sẻ</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => copyToClipboard(window.location.href)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy link
                </button>
                <button
                  onClick={() => shareContent(business.business_name, window.location.href)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Đánh giá {business?.business_name}</h3>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
