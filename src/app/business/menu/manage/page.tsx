'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

export default function ManageMenuPage() {
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
  })
  const router = useRouter()

  const categories = [
    'Khai vị',
    'Món chính',
    'Tráng miệng',
    'Đồ uống',
    'Món chay',
    'Đặc biệt',
  ]

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          return
        }


        const { data: profile, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          router.push('/business/register')
          return
        }

        if (profile.business_type !== 'food') {
          router.push('/business/dashboard')
          return
        }

        setBusinessProfile(profile)
        loadMenuItems()
      } catch (_error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  const loadMenuItems = () => {
    const savedItems = localStorage.getItem('menuItems')
    if (savedItems) {
      setMenuItems(JSON.parse(savedItems))
    }
  }

  const saveMenuItems = (items: MenuItem[]) => {
    localStorage.setItem('menuItems', JSON.stringify(items))
    setMenuItems(items)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      const updatedItems = menuItems.map(item =>
        item.id === editingItem.id
          ? {
              ...editingItem,
              name: formData.name,
              description: formData.description,
              price: parseFloat(formData.price),
              category: formData.category,
              available: formData.available,
            }
          : item
      )
      saveMenuItems(updatedItems)
      setEditingItem(null)
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
      }
      saveMenuItems([...menuItems, newItem])
    }

    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      available: true,
    })
    setShowAddForm(false)
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
    })
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa món này?')) {
      const updatedItems = menuItems.filter(item => item.id !== id)
      saveMenuItems(updatedItems)
    }
  }

  const toggleAvailability = (id: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    )
    saveMenuItems(updatedItems)
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

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý thực đơn - {businessProfile?.business_name}
            </h1>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditingItem(null)
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  available: true,
                })
              }}
              className="btn btn-primary"
            >
              Thêm món mới
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingItem ? 'Chỉnh sửa món' : 'Thêm món mới'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên món *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Có sẵn</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingItem(null)
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm món'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {menuItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có món nào trong thực đơn
              </h3>
              <p className="text-gray-600 mb-4">
                Bắt đầu bằng cách thêm món đầu tiên vào thực đơn của bạn
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {category}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 ${
                          item.available ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-medium ${
                            item.available ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {item.name}
                          </h3>
                          <span className={`text-lg font-bold ${
                            item.available ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className={`text-sm mb-3 ${
                            item.available ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.available ? 'Có sẵn' : 'Hết hàng'}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleAvailability(item.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {item.available ? 'Hết hàng' : 'Có sẵn'}
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-xs text-green-600 hover:text-green-800"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
