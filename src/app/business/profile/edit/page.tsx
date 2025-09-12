'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import type { User } from '@supabase/supabase-js'

interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

const defaultHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '17:00', closed: false },
  sunday: { open: '09:00', close: '17:00', closed: true },
}

const dayNames = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
}

export default function EditBusinessProfilePage() {
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
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  })
  const [hours, setHours] = useState<BusinessHours>(defaultHours)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          return
        }

        setUser(user)

        const { data: profiles, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)

        if (profileError) {
          console.error('Error fetching business profiles:', profileError)
        } else if (profiles && profiles.length > 0) {
          const profile = profiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          setBusinessProfile(profile)
          setFormData({
            business_name: profile.business_name || '',
            description: profile.description || '',
            phone: profile.phone || '',
            website: profile.website || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            zip_code: profile.zip_code || '',
          })

          if (profile.hours) {
            setHours({ ...defaultHours, ...profile.hours })
          }
          return
        }
        
        router.push('/business/register')
        return
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !businessProfile) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          ...formData,
          hours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessProfile.id)

      if (error) {
        return
      }

      router.push('/business/dashboard')
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
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
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Chỉnh sửa hồ sơ doanh nghiệp
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Tên doanh nghiệp *
                    </label>
                    <input
                      type="text"
                      id="business_name"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả doanh nghiệp *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Mô tả về doanh nghiệp của bạn..."
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Bang *
                  </label>
                  <input
                    type="text"
                    id="state"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã ZIP
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Giờ hoạt động</h3>
                <div className="space-y-4">
                  {Object.entries(dayNames).map(([day, dayName]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="text-sm font-medium text-gray-700">{dayName}</span>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours[day].closed}
                          onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Đóng cửa</span>
                      </label>

                      {!hours[day].closed && (
                        <>
                          <input
                            type="time"
                            value={hours[day].open}
                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">đến</span>
                          <input
                            type="time"
                            value={hours[day].close}
                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/business/dashboard')}
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
    </div>
  )
}
