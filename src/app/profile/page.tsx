'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{
    id: string
    email: string
    full_name?: string
    credits: number
    created_at: string
    updated_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
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
          })
        }
      } catch (error) {
        console.error('Error in checkUser:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        alert('Có lỗi xảy ra khi cập nhật hồ sơ.')
        console.error('Error updating profile:', error)
        return
      }

      alert('Hồ sơ đã được cập nhật thành công!')
      
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (updatedProfile) {
        setUserProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Có lỗi xảy ra khi cập nhật hồ sơ.')
    } finally {
      setSaving(false)
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
                  disabled={saving}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
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
