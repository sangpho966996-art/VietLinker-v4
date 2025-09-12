'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { uploadImage, deleteImage, generateGalleryPath } from '@/lib/supabase-storage'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

interface MenuItem {
  id: number
  business_profile_id: number
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export default function ManageMenuPage() {
  const { user, loading: authLoading } = useAuth()
  const [businessProfile, setBusinessProfile] = useState<{
    id: number
    user_id: string
    business_name: string
    business_type: string
    description: string
    phone: string
    email: string
    website: string
    address: string
    city: string
    state: string
    zip_code: string
    cover_image: string
    logo: string
    hours: {
      [key: string]: {
        open: string
        close: string
        closed: boolean
      }
    }
    created_at: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
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
    'Khác'
  ]

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        if (authLoading) return
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profiles, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)

        if (profileError) {
          console.error('Error fetching business profiles:', profileError)
        } else if (profiles && profiles.length > 0) {
          const profile = profiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          
          if (profile.business_type !== 'food') {
            router.push('/business/dashboard')
            return
          }
          
          setBusinessProfile(profile)
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

  const loadMenuItems = useCallback(async () => {
    if (!businessProfile) return
    
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('business_profile_id', businessProfile.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error loading menu items:', error)
        return
      }

      setMenuItems(data || [])
    } catch (error) {
      console.error('Error loading menu items:', error)
    }
  }, [businessProfile])

  useEffect(() => {
    if (businessProfile) {
      loadMenuItems()
    }
  }, [businessProfile, loadMenuItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessProfile) return
    
    setUploading(true)
    
    try {
      let imageUrl = editingItem?.image_url || null
      
      if (selectedImage) {
        const imagePath = generateGalleryPath(businessProfile.user_id, selectedImage.name)
        const uploadResult = await uploadImage(selectedImage, 'business-images', imagePath)
        
        if (uploadResult.success) {
          imageUrl = uploadResult.url!
          if (editingItem?.image_url) {
            const oldPath = editingItem.image_url.split('/').slice(-2).join('/')
            await deleteImage('business-images', oldPath)
          }
        }
      }
      
      const menuItemData = {
        business_profile_id: businessProfile.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        image_url: imageUrl,
      }
      
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', editingItem.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(menuItemData)
        
        if (error) throw error
      }
      
      await loadMenuItems()
      setFormData({ name: '', description: '', price: '', category: '', available: true })
      setSelectedImage(null)
      setShowAddForm(false)
      setEditingItem(null)
      
    } catch (error) {
      console.error('Error saving menu item:', error)
    } finally {
      setUploading(false)
    }
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
    setSelectedImage(null)
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món này?')) return
    
    try {
      const itemToDelete = menuItems.find(item => item.id === id)
      
      if (itemToDelete?.image_url) {
        const imagePath = itemToDelete.image_url.split('/').slice(-2).join('/')
        await deleteImage('business-images', imagePath)
      }
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadMenuItems()
    } catch (error) {
      console.error('Error deleting menu item:', error)
    }
  }

  const toggleAvailability = async (id: number) => {
    try {
      const item = menuItems.find(item => item.id === id)
      if (!item) return
      
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !item.available })
        .eq('id', id)
      
      if (error) throw error
      
      await loadMenuItems()
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
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

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <div className="py-8">
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
                setSelectedImage(null)
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên món *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Giá *
                      </label>
                      <input
                        type="number"
                        id="price"
                        required
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Mô tả về món ăn..."
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      id="category"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="Khai vị">Khai vị</option>
                      <option value="Món chính">Món chính</option>
                      <option value="Tráng miệng">Tráng miệng</option>
                      <option value="Đồ uống">Đồ uống</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh món ăn
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Chấp nhận: JPG, PNG, GIF. Tối đa 10MB.
                    </p>
                    {selectedImage && (
                      <div className="mt-2">
                        <Image src={URL.createObjectURL(selectedImage)} alt="Preview" width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
                      </div>
                    )}
                    {editingItem?.image_url && !selectedImage && (
                      <div className="mt-2">
                        <Image src={editingItem.image_url} alt="Current" width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
                        <p className="text-sm text-gray-500 mt-1">Ảnh hiện tại</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700">
                      Có sẵn
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingItem ? 'Đang cập nhật...' : 'Đang thêm...'}
                        </div>
                      ) : (
                        editingItem ? 'Cập nhật' : 'Thêm món'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {Object.keys(groupedItems).length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">Chưa có món ăn nào trong thực đơn</p>
                <p className="text-gray-400 mt-2">Nhấn &quot;Thêm món mới&quot; để bắt đầu tạo thực đơn</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map(category => {
                  const items = groupedItems[category]
                  if (!items || items.length === 0) return null

                  return (
                    <div key={category} className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`border rounded-lg overflow-hidden ${
                              item.available ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                            }`}
                          >
                            {item.image_url && (
                              <div className="aspect-video relative">
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  width={300}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-medium ${
                                  item.available ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {item.name}
                                </h3>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                              
                              <p className={`text-sm mb-2 ${
                                item.available ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {item.description}
                              </p>
                              
                              <div className="flex justify-between items-center">
                                <span className={`font-semibold ${
                                  item.available ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  ${item.price}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => toggleAvailability(item.id)}
                                    className={`text-xs px-2 py-1 rounded ${
                                      item.available 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {item.available ? 'Có sẵn' : 'Hết hàng'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
