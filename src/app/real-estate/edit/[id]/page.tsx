'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { uploadImage, generateGalleryPath } from '@/lib/supabase-storage'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function EditRealEstatePage() {
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  })
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const propertyTypes = [
    { value: 'sale', label: 'Bán' },
    { value: 'rent', label: 'Cho thuê' },
    { value: 'room-rental', label: 'Cho thuê phòng' }
  ]

  const loadPost = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/real-estate-posts/${postId}?user_id=${userId}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Failed to load post')
      
      const post = result.data

      if (post) {
        setFormData({
          title: post.title || '',
          description: post.description || '',
          price: post.price ? post.price.toString() : '',
          property_type: post.property_type || '',
          bedrooms: post.bedrooms ? post.bedrooms.toString() : '',
          bathrooms: post.bathrooms ? post.bathrooms.toString() : '',
          square_feet: post.square_feet ? post.square_feet.toString() : '',
          address: post.address || '',
          city: post.city || '',
          state: post.state || '',
          zip_code: post.zip_code || '',
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

      if (!formData.title || !formData.description || !formData.property_type) {
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

      const response = await fetch(`/api/real-estate-posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          property_type: formData.property_type as 'sale' | 'rent' | 'room-rental',
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          images: imageUrls,
          updated_at: new Date().toISOString()
        }),
      })

      const updateResult = await response.json()
      if (!response.ok) throw new Error(updateResult.error || 'Failed to update post')

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa tin Bất động sản</h1>
            <p className="text-gray-600">Cập nhật thông tin bất động sản của bạn</p>
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
                  placeholder="Nhập tiêu đề bất động sản"
                  required
                />
              </div>

              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Loại bất động sản *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Chọn loại bất động sản</option>
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ngủ
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng tắm
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label htmlFor="square_feet" className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích (ft²)
                  </label>
                  <input
                    type="number"
                    id="square_feet"
                    name="square_feet"
                    value={formData.square_feet}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Số nhà, tên đường"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Thành phố"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Bang
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Bang"
                  />
                </div>
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã ZIP
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="12345"
                  />
                </div>
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
                  placeholder="Mô tả chi tiết bất động sản"
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
