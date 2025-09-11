'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { uploadImage, deleteImage, generateGalleryPath, getImageUrl } from '@/lib/supabase-storage'
import type { User } from '@supabase/supabase-js'

interface GalleryImage {
  id: string
  file_path: string
  url: string
  caption: string
  uploaded_at: string
}

export default function ManageGalleryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [businessProfile, setBusinessProfile] = useState<{
    id: number
    business_name: string
    business_type: string
    description: string
    phone: string
    website?: string
    address: string
    city: string
    state: string
    zip_code?: string
    hours?: {
      [key: string]: {
        open: string
        close: string
        closed: boolean
      }
    }
    cover_image?: string
    logo?: string
    created_at: string
    updated_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const router = useRouter()

  const loadGalleryImages = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('business_gallery')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error loading gallery images:', error)
        return
      }

      const imagesWithUrls = data.map(img => ({
        ...img,
        url: getImageUrl('business-images', img.file_path)
      }))

      setImages(imagesWithUrls)
    } catch (error) {
      console.error('Error in loadGalleryImages:', error)
    }
  }, [user])

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          return
        }

        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching business profile:', profileError)
          router.push('/business/register')
          return
        }

        setBusinessProfile(profile)
      } catch (error) {
        console.error('Error in checkUserAndLoadProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  useEffect(() => {
    if (user) {
      loadGalleryImages()
    }
  }, [user, loadGalleryImages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh.')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !user) return

    setUploading(true)

    try {
      const filePath = generateGalleryPath(user.id, selectedFile.name)
      const uploadResult = await uploadImage(selectedFile, 'business-images', filePath)
      
      if (!uploadResult.success) {
        alert(`Lỗi tải ảnh: ${uploadResult.error}`)
        setUploading(false)
        return
      }

      const { data, error } = await supabase
        .from('business_gallery')
        .insert({
          user_id: user.id,
          file_path: filePath,
          caption: caption
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving to database:', error)
        alert('Có lỗi xảy ra khi lưu thông tin ảnh.')
        await deleteImage('business-images', filePath)
        setUploading(false)
        return
      }

      const newImage: GalleryImage = {
        ...data,
        url: uploadResult.url!
      }

      setImages([newImage, ...images])
      setSelectedFile(null)
      setCaption('')
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Có lỗi xảy ra khi tải ảnh lên.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return

    const imageToDelete = images.find(img => img.id === id)
    if (!imageToDelete) return

    try {
      const { error } = await supabase
        .from('business_gallery')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting from database:', error)
        alert('Có lỗi xảy ra khi xóa ảnh.')
        return
      }

      await deleteImage('business-images', imageToDelete.file_path)
      
      const updatedImages = images.filter(img => img.id !== id)
      setImages(updatedImages)
    } catch (error) {
      console.error('Error in handleDelete:', error)
      alert('Có lỗi xảy ra khi xóa ảnh.')
    }
  }

  const handleUpdateCaption = async (id: string, newCaption: string) => {
    try {
      const { error } = await supabase
        .from('business_gallery')
        .update({ caption: newCaption })
        .eq('id', id)

      if (error) {
        console.error('Error updating caption:', error)
        return
      }

      const updatedImages = images.map(img =>
        img.id === id ? { ...img, caption: newCaption } : img
      )
      setImages(updatedImages)
    } catch (error) {
      console.error('Error in handleUpdateCaption:', error)
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý thư viện ảnh - {businessProfile?.business_name}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tải ảnh mới
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ảnh *
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả ảnh
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Nhập mô tả cho ảnh..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tải...
                    </div>
                  ) : (
                    'Tải ảnh lên'
                  )}
                </button>
              </div>
            </form>
          </div>

          {images.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có ảnh nào trong thư viện
              </h3>
              <p className="text-gray-600 mb-4">
                Bắt đầu bằng cách tải ảnh đầu tiên lên thư viện của bạn
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thư viện ảnh ({images.length} ảnh)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-square relative">
                    <Image
                        src={image.url}
                        alt={image.caption || 'Gallery image'}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-3">
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) => handleUpdateCaption(image.id, e.target.value)}
                        placeholder="Thêm mô tả..."
                        className="w-full text-sm border-none focus:outline-none focus:ring-0 p-0 mb-2"
                      />
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {new Date(image.uploaded_at).toLocaleDateString('vi-VN')}
                        </span>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/business/dashboard')}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
