'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { uploadImage, generateGalleryPath } from '@/lib/supabase-storage'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function CreateMarketplacePage() {
  const { user, loading: authLoading } = useAuth()
  const [userCredits, setUserCredits] = useState<number>(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const categories = [
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
    const getUser = async () => {
      if (authLoading) return
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (userData) {
        setUserCredits(userData.credits || 0)
      }
    }

    getUser()
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      if (fileList.length > 5) {
        setError('Tối đa 5 ảnh')
        return
      }
      setImages(fileList)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        router.push('/login')
        return
      }

      if (userCredits < 30) {
        setError('Không đủ credits. Cần 30 credits để đăng tin 30 ngày.')
        return
      }

      if (!formData.title || !formData.description || !formData.category) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const imageUrls: string[] = []
      for (const image of images) {
        const imagePath = generateGalleryPath(user.id, image.name)
        const uploadResult = await uploadImage(image, 'business-images', imagePath)
        if (uploadResult.success && uploadResult.url) {
          imageUrls.push(uploadResult.url)
        }
      }

      const { error: insertError } = await supabase
        .from('marketplace_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          category: formData.category,
          location: formData.location,
          images: imageUrls,
          admin_status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })

      if (insertError) throw insertError

      const { data: creditResult } = await supabase.rpc('deduct_credits_for_post', {
        user_uuid: user.id,
        post_type: 'marketplace',
        days: 30
      })

      if (!creditResult) {
        setError('Không thể trừ credits')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Có lỗi xảy ra khi đăng tin')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Credits: {userCredits}</span>
              <Link href="/dashboard" className="btn btn-secondary">
                Quay lại Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng tin Marketplace</h1>
            <p className="text-gray-600">Đăng tin mua bán sản phẩm của bạn</p>
            <p className="text-sm text-gray-500 mt-2">Chi phí: 30 credits cho 30 ngày</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập tiêu đề sản phẩm"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Thành phố, Bang"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Mô tả chi tiết sản phẩm"
                  required
                />
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh (tối đa 5 ảnh)
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Đã chọn {images.length} ảnh
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-6">
                <Link href="/dashboard" className="btn btn-secondary">
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={loading || userCredits < 30}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang đăng...' : 'Đăng tin (30 credits)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
