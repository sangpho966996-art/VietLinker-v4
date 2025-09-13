'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase, BusinessHours } from '@/lib/supabase'
import { copyToClipboard, shareContent, showToast } from '@/lib/contact-utils'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

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

interface BusinessPost {
  id: number
  business_profile_id: number
  title: string
  content: string
  post_type: string
  created_at: string
  updated_at: string
}

interface BusinessReview {
  id: number
  business_profile_id: number
  user_id: string
  rating: number
  comment: string
  created_at: string
  users: {
    full_name: string
    avatar_url: string
  }
}

interface BusinessGallery {
  id: number
  business_profile_id: number
  image_url: string
  caption: string
  created_at: string
}

export default function ServiceProfilePage() {
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [posts, setPosts] = useState<BusinessPost[]>([])
  const [reviews, setReviews] = useState<BusinessReview[]>([])
  const [gallery, setGallery] = useState<BusinessGallery[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  const fetchBusinessData = useCallback(async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .eq('status', 'active')
        .single()

      if (businessError) throw businessError
      setBusiness(businessData)

      const { data: postsData, error: postsError } = await supabase
        .from('business_posts')
        .select('*')
        .eq('business_profile_id', businessId)
        .order('created_at', { ascending: false })

      if (!postsError || postsError.code === 'PGRST116') {
        setPosts(postsData || [])
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

      if (!reviewsError || reviewsError.code === 'PGRST116') {
        setReviews(reviewsData || [])
      }

      const { data: galleryData, error: galleryError } = await supabase
        .from('business_gallery')
        .select('*')
        .eq('business_profile_id', businessId)
        .order('created_at', { ascending: false })

      if (!galleryError || galleryError.code === 'PGRST116') {
        setGallery(galleryData || [])
      }

    } catch {
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    if (businessId) {
      fetchBusinessData()
    }
  }, [businessId, fetchBusinessData])

  const formatHours = (hours: BusinessHours | null) => {
    if (!hours || typeof hours !== 'object') return []
    
    const dayNames = {
      monday: 'Thứ 2',
      tuesday: 'Thứ 3', 
      wednesday: 'Thứ 4',
      thursday: 'Thứ 5',
      friday: 'Thứ 6',
      saturday: 'Thứ 7',
      sunday: 'Chủ nhật'
    }
    
    return Object.entries(dayNames).map(([key, label]) => {
      const dayHours = hours[key]
      if (!dayHours) return { day: label, hours: 'Chưa cập nhật' }
      if (dayHours.closed) return { day: label, hours: 'Đóng cửa' }
      return { day: label, hours: `${dayHours.open} - ${dayHours.close}` }
    })
  }

  const handleCallNow = () => {
    if (business?.phone) {
      window.location.href = `tel:${business.phone}`
    } else {
      showToast('Không có số điện thoại')
    }
  }

  const handleSendMessage = () => {
    window.location.href = `/contact?type=service&id=${business?.id}&subject=${encodeURIComponent(`Liên hệ về dịch vụ: ${business?.business_name || ''}`)}`
  }

  const handleBookAppointment = () => {
    window.location.href = `/contact?type=service&id=${business?.id}&service=appointment&subject=${encodeURIComponent(`Đặt lịch hẹn tại ${business?.business_name || ''}`)}`
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
    } catch {
    }
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

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy dịch vụ</h1>
          <p className="text-gray-600">Dịch vụ này có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{business.business_name}</h1>
              <p className="text-red-100 mt-2">Dịch vụ chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'posts'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Bài viết
                  </button>
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'info'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'gallery'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Hình ảnh
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'reviews'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Đánh giá
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Posts Tab */}
                {activeTab === 'posts' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết từ dịch vụ</h3>
                    {posts.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-300 text-6xl mb-4">💬</div>
                        <p className="text-gray-500">Chưa có bài viết nào</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {posts.map((post) => (
                          <div key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h4>
                            <p className="text-gray-600 mb-3">{post.content}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="mr-1">📅</span>
                              <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                              <span className="mx-2">•</span>
                              <span className="capitalize">{post.post_type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Tab */}
                {activeTab === 'info' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Về {business.business_name}</h3>
                    <p className="text-gray-600 mb-6">{business.description}</p>
                    
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Giờ mở cửa</h4>
                    <div className="space-y-2 mb-6">
                      {formatHours(business.hours).map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-gray-600">{item.day}</span>
                          <span className="text-gray-900">{item.hours}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-md font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-3">📍</span>
                        <span className="text-gray-600">{business.address}</span>
                      </div>
                      {business.phone && (
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-3">📞</span>
                          <span className="text-gray-600">{business.phone}</span>
                        </div>
                      )}
                      {business.website && (
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-3">🌐</span>
                          <a href={business.website} target="_blank" rel="noopener noreferrer" 
                             className="text-red-600 hover:text-red-700">
                            {business.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh dịch vụ</h3>
                    {gallery.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-300 text-6xl mb-4">📷</div>
                        <p className="text-gray-500">Dịch vụ chưa có hình ảnh</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gallery.map((image) => (
                          <div key={image.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <Image
                              src={image.image_url}
                              alt={image.caption || 'Business image'}
                              className="w-full h-full object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá từ khách hàng</h3>
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-300 text-6xl mb-4">⭐</div>
                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                {review.users?.avatar_url ? (
                                  <Image
                                    src={review.users.avatar_url}
                                    alt={review.users.full_name}
                                    className="h-10 w-10 rounded-full"
                                    width={40}
                                    height={40}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-gray-600">👤</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {review.users?.full_name || 'Người dùng ẩn danh'}
                                  </h4>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-sm ${
                                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      >
                                        ⭐
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ</h3>
              
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleCallNow}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📞</span>
                  Gọi ngay
                </button>
                
                <button 
                  onClick={handleSendMessage}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">💬</span>
                  Nhắn tin
                </button>
                
                <button 
                  onClick={handleBookAppointment}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📅</span>
                  Đặt lịch
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin cơ bản</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Địa chỉ:</span>
                    <p>{business.address}</p>
                  </div>
                  {business.phone && (
                    <div>
                      <span className="font-medium">Điện thoại:</span>
                      <p>{business.phone}</p>
                    </div>
                  )}
                  {business.website && (
                    <div>
                      <span className="font-medium">Website:</span>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" 
                         className="text-red-600 hover:text-red-700 block">
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Chia sẻ</h4>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    📋 Copy link
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    📱 Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
