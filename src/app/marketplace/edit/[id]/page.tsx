'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { uploadImage, generateGalleryPath } from '@/lib/supabase-storage'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function EditMarketplacePage() {
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
  })
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

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

  const conditions = [
    { value: 'new', label: 'Mới' },
    { value: 'like-new', label: 'Như mới' },
    { value: 'good', label: 'Tốt' },
    { value: 'fair', label: 'Khá' },
    { value: 'poor', label: 'Cũ' }
  ]

  const loadPost = useCallback(async (userId: string) => {
    try {
      const { data: post, error } = await supabase
        .from('marketplace_posts')
        .select('*')
        .eq('id', postId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      if (post) {
        setFormData({
          title: post.title || '',
          description: post.description || '',
          price: post.price ? post.price.toString() : '',
          category: post.category || '',
          condition: post.condition || '',
          location: post.location || '',
        })
        setExistingImages(post.images || [])
      }
    } catch {
      setError('Không thể tải thông tin tin đăng')
    }
  }, [postId])

  useEffect(() => {
    const getUser = async () => {
      if (authLoading) return
      
      if (!user) {
        router.push('/login')
        return
      }

      await loadPost(user.id)
    }

    getUser()
  }, [router, postId, loadPost, user, authLoading])

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
      if (existingImages.length + fileList.length > 5) {
        setError('Tối đa 5 ảnh')
        return
      }
      setNewImages(fileList)
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

      if (!formData.title || !formData.description || !formData.category) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const imageUrls: string[] = [...existingImages]
      for (const image of newImages) {
        const imagePath = generateGalleryPath(user.id, image.name)
        const uploadResult = await uploadImage(image, 'business-images', imagePath)
        if (uploadResult.success && uploadResult.url) {
          imageUrls.push(uploadResult.url)
        }
      }

      const { error: updateError } = await supabase
        .from('marketplace_posts')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          category: formData.category,
          condition: formData.condition,
          location: formData.location,
          images: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      router.push('/my-posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
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
            <Link href="/my-posts" className="btn btn-secondary">
              Quay lại Tin đăng
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa tin Marketplace</h1>
            <p className="text-gray-600">Cập nhật thông tin tin đăng của bạn</p>
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
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Chọn tình trạng</option>
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
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

              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh hiện tại
                  </label>
                  <div className="flex space-x-2 mb-4">
                    {existingImages.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Existing ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm hình ảnh mới (tối đa {5 - existingImages.length} ảnh)
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {newImages.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Đã chọn {newImages.length} ảnh mới
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-6">
                <Link href="/my-posts" className="btn btn-secondary">
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật tin đăng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
