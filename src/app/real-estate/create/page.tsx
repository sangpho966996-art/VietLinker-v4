'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { uploadImage, generateGalleryPath } from '@/lib/supabase-storage'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

interface RealEstateTemplate {
  title: string
  description: string
  price: string
  bedrooms: string
  bathrooms: string
  square_feet: string
  address_placeholder: string
}

export default function CreateRealEstatePage() {
  const { user, loading: authLoading } = useAuth()
  const [userCredits, setUserCredits] = useState<number>(0)
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
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const router = useRouter()

  const propertyTypes = [
    { value: 'house', label: 'Nhà' },
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'condo', label: 'Chung cư' },
    { value: 'townhouse', label: 'Nhà phố' },
    { value: 'land', label: 'Đất' },
    { value: 'commercial', label: 'Thương mại' },
    { value: 'room-rental', label: 'Cho thuê phòng' }
  ]

  const getRealEstateTemplates = (propertyType: string): RealEstateTemplate[] => {
    switch (propertyType) {
      case 'room-rental':
        return [
          {
            title: 'Cho Thuê Phòng Sạch Sẽ - Gần Trung Tâm',
            description: `🏠 CHO THUÊ PHÒNG SẠCH SẼ - GIÁ TỐT

📍 VỊ TRÍ:
• Gần trung tâm thành phố, đi làm thuận tiện
• Gần siêu thị, nhà hàng Việt Nam
• Khu vực an toàn, yên tĩnh

🏡 THÔNG TIN PHÒNG:
• Phòng riêng biệt, có khóa riêng
• Đầy đủ nội thất: giường, tủ, bàn học
• Internet WiFi tốc độ cao miễn phí
• Điều hòa, quạt trần

🚿 TIỆN ÍCH:
• Nhà bếp chung sạch sẽ
• Máy giặt, máy sấy miễn phí
• Chỗ đậu xe miễn phí
• Khu vực BBQ ngoài trời

💰 GIÁ THUÊ: $[GIÁ]/tháng (bao điện nước)
📞 Liên hệ: [SỐ ĐIỆN THOẠI]
💬 Text/Call: Tiếng Việt & English OK

⭐ Ưu tiên người Việt, sinh viên, người đi làm`,
            price: '800',
            bedrooms: '1',
            bathrooms: '1',
            square_feet: '150',
            address_placeholder: '[ĐỊA CHỈ CHI TIẾT]'
          },
          {
            title: 'Phòng Trọ Sinh Viên - Giá Rẻ, Tiện Nghi',
            description: `🎓 PHÒNG TRỌ DÀNH CHO SINH VIÊN

📚 ĐẶC BIỆT PHÙNG HỢP:
• Gần trường đại học, thư viện
• Môi trường học tập yên tĩnh
• Nhiều bạn sinh viên Việt Nam

🏠 NỘI THẤT:
• Giường đơn, nệm mới
• Bàn học rộng, ghế ergonomic
• Tủ quần áo lớn
• Kệ sách, đèn học

🌐 TIỆN ÍCH:
• WiFi tốc độ cao 24/7
• Máy lạnh, quạt trần
• Tủ lạnh mini trong phòng
• Khu vực nấu ăn chung

💡 ƯU ĐÃI:
• Miễn phí tháng đầu tiên
• Không cần deposit cho sinh viên
• Hỗ trợ giấy tờ thuê nhà

💰 CHỈ: $[GIÁ]/tháng
📱 Liên hệ ngay: [SỐ ĐIỆN THOẠI]`,
            price: '650',
            bedrooms: '1',
            bathrooms: '1',
            square_feet: '120',
            address_placeholder: '[ĐỊA CHỈ GẦN TRƯỜNG]'
          }
        ]
      case 'commercial':
        return [
          {
            title: 'Sang Nhượng Tiệm Nails - Khách Quen Đông',
            description: `💅 SANG NHƯỢNG TIỆM NAILS ĐANG KINH DOANH

🏪 THÔNG TIN TIỆM:
• Hoạt động 5 năm, khách quen đông đảo
• Vị trí đắc địa, dễ nhìn thấy
• Khu vực người Mỹ đông, thu nhập cao
• Parking rộng rãi cho khách

💺 TRANG THIẾT BỊ:
• 8 ghế pedicure cao cấp
• 6 bàn manicure
• Đầy đủ dụng cụ, máy móc hiện đại
• Hệ thống thông gió tốt

💰 DOANH THU:
• Trung bình $[DOANH THU]/tháng
• Khách walk-in và appointment
• Giá dịch vụ cao, lợi nhuận tốt

📋 BAO GỒM:
• Toàn bộ thiết bị, nội thất
• Danh sách khách hàng
• Training 2 tuần
• Hỗ trợ giấy phép

💵 GIÁ: $[GIÁ] (có thể thương lượng)
📞 Liên hệ: [SỐ ĐIỆN THOẠI]
🤝 Chỉ bán cho người Việt có kinh nghiệm`,
            price: '85000',
            bedrooms: '',
            bathrooms: '2',
            square_feet: '1200',
            address_placeholder: '[ĐỊA CHỈ TIỆM]'
          },
          {
            title: 'Sang Nhượng Nhà Hàng Việt Nam - Setup Hoàn Chỉnh',
            description: `🍜 SANG NHƯỢNG NHÀ HÀNG VIỆT NAM

🏮 ĐẶC ĐIỂM NỔI BẬT:
• Nhà hàng Phở, Cơm, Bánh mì
• Khu vực đông người Việt và Mỹ
• Đã có license đầy đủ
• Yelp 4.5 sao, Google reviews tốt

🍽️ TRANG THIẾT BỊ:
• Bếp công nghiệp hoàn chỉnh
• 40 chỗ ngồi, decor Việt Nam
• Hệ thống POS hiện đại
• Tủ lạnh, freezer công nghiệp

📈 KINH DOANH:
• Doanh thu ổn định $[DOANH THU]/tháng
• Khách quen nhiều, delivery tốt
• Menu đa dạng, giá cạnh tranh
• Staff đã được training

🎁 CHUYỂN GIAO:
• Toàn bộ recipes bí mật
• Training 1 tháng
• Giới thiệu suppliers Việt
• Hỗ trợ marketing

💰 GIÁ: $[GIÁ] + rent $3,500/tháng
☎️ Gọi ngay: [SỐ ĐIỆN THOẠI]`,
            price: '120000',
            bedrooms: '',
            bathrooms: '2',
            square_feet: '2000',
            address_placeholder: '[ĐỊA CHỈ NHÀ HÀNG]'
          }
        ]
      case 'house':
        return [
          {
            title: 'Bán Nhà Đẹp - Khu Người Việt Đông',
            description: `🏡 BÁN NHÀ ĐẸP - KHU NGƯỜI VIỆT

🌟 ĐẶC ĐIỂM NỔI BẬT:
• Khu vực nhiều gia đình Việt Nam
• Gần chợ Việt, nhà hàng Phở
• Trường học tốt, an toàn cho trẻ em
• Giao thông thuận tiện đi làm

🏠 THÔNG TIN NHÀ:
• Xây dựng năm 2015, còn mới
• Sân trước và sân sau rộng
• Garage 2 xe, driveway rộng
• Flooring gỗ, kitchen granite

🌳 KHUÔN VIÊN:
• Sân sau có thể làm vườn rau
• BBQ area cho gia đình
• Hàng rào riêng tư
• Cây ăn quả: xoài, ổi

💡 TIỆN ÍCH:
• Central AC/Heat
• Washer/Dryer hookup
• Dishwasher, microwave
• Walk-in closets

💰 GIÁ: $[GIÁ] (có thể thương lượng)
📞 Chủ nhà: [SỐ ĐIỆN THOẠI]
👨‍👩‍👧‍👦 Ưu tiên bán cho gia đình Việt`,
            price: '650000',
            bedrooms: '4',
            bathrooms: '3',
            square_feet: '2200',
            address_placeholder: '[ĐỊA CHỈ NHÀ]'
          }
        ]
      default:
        return []
    }
  }

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
    
    if (name === 'property_type') {
      setShowTemplates(value !== '' && getRealEstateTemplates(value).length > 0)
    }
  }

  const handleTemplateSelect = (template: RealEstateTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      price: template.price,
      bedrooms: template.bedrooms,
      bathrooms: template.bathrooms,
      square_feet: template.square_feet,
      address: template.address_placeholder
    }))
    setShowTemplates(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      if (fileList.length > 10) {
        setError('Tối đa 10 ảnh')
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

      if (!formData.title || !formData.description || !formData.property_type) {
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
        .from('real_estate_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          property_type: formData.property_type,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          images: imageUrls,
          admin_status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })

      if (insertError) throw insertError

      const { data: creditResult } = await supabase.rpc('deduct_credits_for_post', {
        user_uuid: user.id,
        post_type: 'real_estate',
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng tin Bất động sản</h1>
            <p className="text-gray-600">Đăng tin mua bán, cho thuê bất động sản</p>
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

              {showTemplates && formData.property_type && getRealEstateTemplates(formData.property_type).length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                    ✨ Mẫu tin đăng có sẵn - Chỉ cần sửa thông tin là đăng ngay!
                  </h3>
                  <div className="space-y-3">
                    {getRealEstateTemplates(formData.property_type).map((template, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{template.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">
                              💰 ${template.price ? `${parseInt(template.price).toLocaleString()}` : 'Liên hệ'} • 
                              {template.bedrooms && ` ${template.bedrooms} phòng ngủ •`}
                              {template.bathrooms && ` ${template.bathrooms} phòng tắm •`}
                              {template.square_feet && ` ${template.square_feet} sq ft`}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {template.description.substring(0, 100)}...
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTemplateSelect(template)}
                            className="ml-3 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                          >
                            📝 Dùng mẫu này
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 mt-3">
                    💡 <strong>Lưu ý:</strong> Sau khi chọn mẫu, bạn chỉ cần thay đổi địa chỉ, giá cả, số điện thoại là có thể đăng tin ngay!
                  </p>
                </div>
              )}

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
                  />
                </div>
                <div>
                  <label htmlFor="square_feet" className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích (sq ft)
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

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh (tối đa 10 ảnh)
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
