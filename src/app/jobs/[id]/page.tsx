'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { copyToClipboard, shareContent, saveToBookmarks, removeFromBookmarks, isBookmarked, showToast } from '@/lib/contact-utils'

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
}

interface User {
  full_name: string | null
  email: string
  phone: string | null
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  
  const [post, setPost] = useState<JobPost | null>(null)
  const [seller, setSeller] = useState<User | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  const categories = [
    { value: 'nails', label: 'Tiệm Nails' },
    { value: 'restaurant', label: 'Nhà hàng Việt Nam' },
    { value: 'medical', label: 'Văn phòng bác sĩ' },
    { value: 'insurance', label: 'Bảo hiểm' },
    { value: 'retail', label: 'Bán lẻ' },
    { value: 'office', label: 'Văn phòng' },
    { value: 'other', label: 'Khác' }
  ]

  const loadPost = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: postData, error: postError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', jobId)
        .eq('status', 'active')
        .single()

      if (postError) {
        setError('Không tìm thấy tin đăng')
        return
      }

      setPost(postData)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name, email, phone')
        .eq('id', postData.user_id)
        .single()

      if (!userError && userData) {
        setSeller(userData)
      }

      const { data: relatedData, error: relatedError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('status', 'active')
        .neq('id', jobId)
        .eq('category', postData.category)
        .limit(3)

      if (!relatedError && relatedData) {
        setRelatedPosts(relatedData)
      }

    } catch {
      setError('Không thể tải thông tin tin đăng')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    if (jobId) {
      loadPost()
    }
  }, [jobId, loadPost])

  useEffect(() => {
    if (post) {
      setBookmarked(isBookmarked(post.id.toString(), 'jobs'))
    }
  }, [post])

  const handleContactEmployer = () => {
    if (seller?.phone) {
      window.location.href = `tel:${seller.phone}`
    } else {
      window.location.href = `/contact?type=job&id=${post?.id}`
    }
  }

  const handleSendMessage = () => {
    window.location.href = `/contact?type=job&id=${post?.id}&subject=${encodeURIComponent(`Quan tâm đến công việc: ${post?.title || ''}`)}`
  }

  const handleSaveJob = () => {
    if (!post) return
    if (bookmarked) {
      removeFromBookmarks(post.id.toString(), 'jobs')
      setBookmarked(false)
      showToast('Đã bỏ lưu công việc')
    } else {
      saveToBookmarks(post.id.toString(), 'jobs', post.title)
      setBookmarked(true)
      showToast('Đã lưu công việc')
    }
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
    }
  }

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
          <Link href="/jobs" className="btn btn-primary bg-red-600 hover:bg-red-700">
            Quay lại Việc làm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-red-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/jobs" className="text-gray-700 hover:text-red-600">
                  Việc làm
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{post.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="relative">
                  <div className="aspect-video relative">
                    <Image
                      src={post.images[selectedImageIndex]}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {post.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
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
                              className="object-cover w-full h-full"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Job Details */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded">
                    {getCategoryLabel(post.category)}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded">
                    {getJobTypeLabel(post.job_type)}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-red-600">
                    {formatSalary(post.salary_min, post.salary_max)}
                  </span>
                </div>

                {/* Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {post.company && (
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">🏢</span>
                      <span className="text-gray-900">{post.company}</span>
                    </div>
                  )}
                  {post.location && (
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">📍</span>
                      <span className="text-gray-900">{post.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">📅</span>
                    <span className="text-gray-900">Đăng ngày {formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">⏰</span>
                    <span className="text-gray-900">{getJobTypeLabel(post.job_type)}</span>
                  </div>
                </div>

                {/* Description */}
                {post.description && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả công việc</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhà tuyển dụng</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">
                    {seller?.full_name?.charAt(0).toUpperCase() || seller?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {seller?.full_name || 'Người dùng'}
                  </p>
                  <p className="text-sm text-gray-600">{seller?.email}</p>
                </div>
              </div>

              {seller?.phone && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">📞 {seller.phone}</p>
                </div>
              )}

              <div className="space-y-3">
                <button 
                  onClick={handleContactEmployer}
                  className="w-full btn btn-primary bg-red-600 hover:bg-red-700"
                >
                  📞 Liên hệ nhà tuyển dụng
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="w-full btn btn-secondary"
                >
                  💬 Gửi tin nhắn
                </button>
                <button 
                  onClick={handleSaveJob}
                  className={`w-full btn ${bookmarked ? 'btn-primary bg-yellow-600 hover:bg-yellow-700' : 'btn-secondary'}`}
                >
                  {bookmarked ? '⭐ Đã lưu' : '❤️ Lưu tin đăng'}
                </button>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chia sẻ tin đăng</h3>
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

        {/* Related Jobs */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Việc làm liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/jobs/${relatedPost.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {relatedPost.images && relatedPost.images.length > 0 && (
                      <div className="relative h-48">
                        <Image
                          src={relatedPost.images[0]}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                      <span className="text-red-600 font-bold">
                        {formatSalary(relatedPost.salary_min, relatedPost.salary_max)}
                      </span>
                      {relatedPost.company && (
                        <p className="text-gray-500 text-sm mt-1">
                          🏢 {relatedPost.company}
                        </p>
                      )}
                      {relatedPost.location && (
                        <p className="text-gray-500 text-sm">
                          📍 {relatedPost.location}
                        </p>
                      )}
                    </div>
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
