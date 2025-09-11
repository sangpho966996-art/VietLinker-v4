'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { copyToClipboard, shareContent, showToast } from '@/lib/contact-utils'

export const dynamic = 'force-dynamic'

type RealEstatePost = Database['public']['Tables']['real_estate_posts']['Row']
type UserProfile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
}

export default function RealEstateDetailPage() {
  const params = useParams()
  const [post, setPost] = useState<RealEstatePost | null>(null)
  const [seller, setSeller] = useState<UserProfile | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RealEstatePost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const postId = params.id as string

  const propertyTypes = [
    { value: 'house', label: 'Nhà' },
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'condo', label: 'Chung cư' },
    { value: 'townhouse', label: 'Nhà phố' },
    { value: 'land', label: 'Đất' },
    { value: 'commercial', label: 'Thương mại' },
    { value: 'room-rental', label: 'Cho thuê phòng' }
  ]

  const loadPost = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: postData, error: postError } = await supabase
        .from('real_estate_posts')
        .select('*')
        .eq('id', postId)
        .eq('status', 'active')
        .single()

      if (postError) throw postError

      if (!postData) {
        setError('Không tìm thấy tin đăng')
        return
      }

      setPost(postData)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, phone')
        .eq('id', postData.user_id)
        .single()

      if (userError) {
      } else {
        setSeller(userData)
      }

      const { data: relatedData, error: relatedError } = await supabase
        .from('real_estate_posts')
        .select('*')
        .eq('property_type', postData.property_type)
        .eq('status', 'active')
        .neq('id', postId)
        .limit(4)
        .order('created_at', { ascending: false })

      if (relatedError) {
      } else {
        setRelatedPosts(relatedData || [])
      }

    } catch {
      setError('Không thể tải tin đăng')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId, loadPost])

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPropertyTypeLabel = (value: string) => {
    const propertyType = propertyTypes.find(type => type.value === value)
    return propertyType ? propertyType.label : value
  }

  const handleContactSeller = () => {
    if (seller?.phone) {
      window.location.href = `tel:${seller.phone}`
    } else {
      window.location.href = `/contact?type=real-estate&id=${post?.id}`
    }
  }

  const handleSendMessage = () => {
    window.location.href = `/contact?type=real-estate&id=${post?.id}&subject=${encodeURIComponent(`Quan tâm đến bất động sản: ${post?.title || ''}`)}`
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href)
    if (success) {
      showToast('Đã sao chép liên kết')
    }
  }

  const handleShare = async () => {
    if (!post) return
    try {
      await shareContent(post.title, window.location.href)
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
          <p className="mt-4 text-gray-600">Đang tải tin đăng...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy tin đăng'}</p>
          <Link href="/real-estate" className="btn btn-primary bg-red-600 hover:bg-red-700">
            Quay lại Bất động sản
          </Link>
        </div>
      </div>
    )
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

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/real-estate" className="text-gray-500 hover:text-gray-700">
              Bất động sản
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {post.images && post.images.length > 0 ? (
                <div>
                  <div className="h-96 relative">
                    <Image
                      src={post.images[selectedImageIndex]}
                      alt={post.title}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {post.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {post.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedImageIndex === index ? 'border-red-600' : 'border-gray-200'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${post.title} ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Không có ảnh</span>
                </div>
              )}
            </div>

            {/* Post Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  {getPropertyTypeLabel(post.property_type)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(post.price)}
                </span>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {post.bedrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{post.bedrooms}</div>
                    <div className="text-sm text-gray-600">Phòng ngủ</div>
                  </div>
                )}
                {post.bathrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{post.bathrooms}</div>
                    <div className="text-sm text-gray-600">Phòng tắm</div>
                  </div>
                )}
                {post.square_feet && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{post.square_feet.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                )}
              </div>

              {/* Address */}
              {(post.address || post.city) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Địa chỉ</h3>
                  <p className="text-gray-700">
                    {[post.address, post.city, post.state, post.zip_code].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Mô tả</h2>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {post.description || 'Không có mô tả'}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Đăng ngày: {formatDate(post.created_at)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin người đăng</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">
                    {seller?.full_name?.charAt(0).toUpperCase() || seller?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {seller?.full_name || seller?.email?.split('@')[0] || 'Người dùng'}
                  </p>
                  <p className="text-sm text-gray-600">Thành viên VietLinker</p>
                </div>
              </div>

              {seller?.phone && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Số điện thoại:</p>
                  <p className="font-medium">{seller.phone}</p>
                </div>
              )}

              <div className="space-y-3">
                <button 
                  onClick={handleContactSeller}
                  className="w-full btn btn-primary bg-red-600 hover:bg-red-700"
                >
                  📞 Liên hệ người đăng
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="w-full btn btn-secondary"
                >
                  💬 Gửi tin nhắn
                </button>
              </div>
              
              <div className="mt-4 flex space-x-2">
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

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Lời khuyên an toàn</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Gặp mặt tại nơi công cộng</li>
                <li>• Xem nhà vào ban ngày</li>
                <li>• Kiểm tra giấy tờ pháp lý</li>
                <li>• Không chuyển tiền trước</li>
                <li>• Tin tưởng trực giác của bạn</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bất động sản liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/real-estate/${relatedPost.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {relatedPost.images && relatedPost.images.length > 0 ? (
                      <Image
                        src={relatedPost.images[0]}
                        alt={relatedPost.title}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Không có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                    <span className="text-red-600 font-bold">
                      {formatPrice(relatedPost.price)}
                    </span>
                    {(relatedPost.address || relatedPost.city) && (
                      <p className="text-gray-500 text-sm mt-1">
                        {[relatedPost.address, relatedPost.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
