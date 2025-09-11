'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { uploadImage, generateAvatarPath } from '@/lib/supabase-storage'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{
    id: string
    email: string
    full_name?: string
    phone?: string
    address?: string
    avatar_url?: string
    credits: number
    created_at: string
    updated_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  })
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          return
        }

        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
        } else {
          setUserProfile(profile)
          setFormData({
            full_name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
          })
          setAvatarPreview(profile.avatar_url || null)
        }
      } catch (error) {
        console.error('Error in checkUser:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

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
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      let avatarUrl = userProfile?.avatar_url || null

      if (selectedFile) {
        setUploading(true)
        
        const filePath = generateAvatarPath(user.id, selectedFile.name)
        const uploadResult = await uploadImage(selectedFile, 'user-images', filePath)
        
        if (!uploadResult.success) {
          alert(`Lỗi tải ảnh: ${uploadResult.error}`)
          setSaving(false)
          setUploading(false)
          return
        }
        
        avatarUrl = uploadResult.url || null
      }
      
      await updateProfile(avatarUrl)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Có lỗi xảy ra khi cập nhật hồ sơ.')
      setSaving(false)
      setUploading(false)
    }
  }

  const updateProfile = async (avatarUrl: string | null) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id)

      if (error) {
        alert('Có lỗi xảy ra khi cập nhật hồ sơ.')
        console.error('Error updating profile:', error)
        return
      }

      alert('Hồ sơ đã được cập nhật thành công!')
      
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (updatedProfile) {
        setUserProfile(updatedProfile)
        setAvatarPreview(updatedProfile.avatar_url)
      }

      setSelectedFile(null)
      const fileInput = document.getElementById('avatar-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Có lỗi xảy ra khi cập nhật hồ sơ.')
    } finally {
      setSaving(false)
      setUploading(false)
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Hồ sơ cá nhân
            </h1>

            {userProfile && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Credits hiện tại</p>
                    <p className="text-2xl font-bold text-red-600">
                      {userProfile.credits || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tham gia</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(userProfile.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="avatar-input" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    {avatarPreview ? 'Thay đổi ảnh đại diện' : 'Tải ảnh đại diện'}
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, GIF. Tối đa 5MB.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email không thể thay đổi
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại của bạn"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving || uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
                    </div>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
