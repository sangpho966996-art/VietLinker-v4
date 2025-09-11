'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface MarketplacePost {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  images: string[]
  created_at: string
}

interface JobPost {
  id: string
  title: string
  description: string
  company: string
  location: string
  salary_min: number | null
  salary_max: number | null
  job_type: string
  category: string | null
  images: string[]
  created_at: string
}

interface RealEstatePost {
  id: string
  title: string
  description: string
  price: number
  property_type: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  address: string
  city: string
  state: string
  zip_code: string
  images: string[]
  created_at: string
}

export default function MyPostsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [marketplacePosts, setMarketplacePosts] = useState<MarketplacePost[]>([])
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [realEstatePosts, setRealEstatePosts] = useState<RealEstatePost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'marketplace' | 'jobs' | 'real-estate'>('marketplace')
  const router = useRouter()

  const loadPosts = useCallback(async (userId: string) => {
    try {
      const { data: marketplaceData, error: marketplaceError } = await supabase
        .from('marketplace_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (marketplaceError) {
        console.error('Error loading marketplace posts:', marketplaceError)
      } else {
        setMarketplacePosts(marketplaceData || [])
      }

      const { data: jobData, error: jobError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (jobError) {
        console.error('Error loading job posts:', jobError)
      } else {
        setJobPosts(jobData || [])
      }

      const { data: realEstateData, error: realEstateError } = await supabase
        .from('real_estate_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (realEstateError) {
        console.error('Error loading real estate posts:', realEstateError)
      } else {
        setRealEstatePosts(realEstateData || [])
      }
    } catch (err) {
      console.error('Error loading posts:', err)
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Failed to get user:', userError.message)
          router.push('/login')
          return
        }

        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
        await loadPosts(user.id)
      } catch (err) {
        console.error('Error loading user data:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, loadPosts])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const handleEditPost = (type: 'marketplace' | 'jobs' | 'real-estate', id: string) => {
    router.push(`/${type}/edit/${id}`)
  }

  const handleDeletePost = async (type: 'marketplace' | 'jobs' | 'real-estate', id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
      return
    }

    try {
      const tableName = type === 'marketplace' ? 'marketplace_posts' : 
                       type === 'jobs' ? 'job_posts' : 'real_estate_posts'
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      if (user) {
        await loadPosts(user.id)
      }
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Có lỗi xảy ra khi xóa tin đăng')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link href="/dashboard" className="btn btn-secondary">
              Quay lại Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin đăng của tôi</h1>
          <p className="text-gray-600">Quản lý tất cả tin đăng của bạn</p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'marketplace'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Marketplace ({marketplacePosts.length})
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Việc làm ({jobPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('real-estate')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'real-estate'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bất động sản ({realEstatePosts.length})
              </button>
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'marketplace' && (
            <div>
              {marketplacePosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Chưa có tin đăng marketplace nào</p>
                  <Link href="/marketplace/create" className="btn btn-primary">
                    Đăng tin mới
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplacePosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {post.images && post.images.length > 0 && (
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold text-red-600">{formatPrice(post.price)}</span>
                          <span className="text-sm text-gray-500">{post.condition}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>{post.category}</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPost('marketplace', post.id)}
                            className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleDeletePost('marketplace', post.id)}
                            className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              {jobPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Chưa có tin đăng việc làm nào</p>
                  <Link href="/jobs/create" className="btn btn-primary">
                    Đăng việc làm
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-gray-600">{post.company}</p>
                        </div>
                        <div className="text-right">
                          {post.salary_min && post.salary_max && (
                            <p className="text-lg font-bold text-green-600">
                              {formatPrice(post.salary_min)} - {formatPrice(post.salary_max)}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">{post.job_type}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <span>{post.location}</span>
                          {post.category && <span>{post.category}</span>}
                        </div>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="mt-4 flex space-x-2">
                          {post.images.slice(0, 3).map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`${post.title} ${index + 1}`}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                          {post.images.length > 3 && (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-sm text-gray-600">+{post.images.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEditPost('jobs', post.id)}
                          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeletePost('jobs', post.id)}
                          className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'real-estate' && (
            <div>
              {realEstatePosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Chưa có tin đăng bất động sản nào</p>
                  <Link href="/real-estate/create" className="btn btn-primary">
                    Đăng bất động sản
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {realEstatePosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {post.images && post.images.length > 0 && (
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold text-red-600">{formatPrice(post.price)}</span>
                          <span className="text-sm text-gray-500">{post.property_type}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                          <div className="flex space-x-4">
                            {post.bedrooms && <span>{post.bedrooms} phòng ngủ</span>}
                            {post.bathrooms && <span>{post.bathrooms} phòng tắm</span>}
                            {post.square_feet && <span>{post.square_feet} ft²</span>}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>{post.city}, {post.state}</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPost('real-estate', post.id)}
                            className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleDeletePost('real-estate', post.id)}
                            className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Xóa
                          </button>
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
  )
}
