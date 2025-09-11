'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { uploadImage, generateGalleryPath } from '@/lib/supabase-storage'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default function CreateJobPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary_min: '',
    salary_max: '',
    job_type: '',
    category: '',
  })
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const jobTypes = [
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' },
    { value: 'contract', label: 'Hợp đồng' },
    { value: 'internship', label: 'Thực tập' }
  ]

  const jobCategories = [
    { value: 'nails', label: '💅 Tiệm Nails', description: 'Thợ nails, receptionist, manager' },
    { value: 'restaurant', label: '🍜 Nhà hàng Việt Nam', description: 'Đầu bếp, phục vụ, cashier, manager' },
    { value: 'office-tax', label: '📊 Văn phòng Thuế', description: 'Tax preparer, receptionist, assistant' },
    { value: 'office-insurance', label: '🛡️ Văn phòng Bảo hiểm', description: 'Insurance agent, customer service' },
    { value: 'medical', label: '⚕️ Y tế/Bác sĩ', description: 'Medical assistant, receptionist, nurse' },
    { value: 'retail', label: '🏪 Bán lẻ', description: 'Sales associate, cashier, manager' },
    { value: 'other', label: '📋 Khác', description: 'Các ngành nghề khác' }
  ]

  const getJobTitleSuggestions = (category: string): string[] => {
    const suggestions: Record<string, string[]> = {
      'nails': [
        'Thợ Nails có kinh nghiệm',
        'Nail Technician - Full time',
        'Receptionist tiệm Nails',
        'Manager tiệm Nails',
        'Thợ Nails part-time'
      ],
      'restaurant': [
        'Đầu bếp Việt Nam',
        'Phục vụ nhà hàng',
        'Cashier/Thu ngân',
        'Kitchen Helper',
        'Manager nhà hàng',
        'Bartender',
        'Host/Hostess'
      ],
      'office-tax': [
        'Tax Preparer',
        'Receptionist văn phòng thuế',
        'Tax Assistant',
        'Customer Service Rep',
        'Office Manager'
      ],
      'office-insurance': [
        'Insurance Agent',
        'Customer Service Representative',
        'Office Assistant',
        'Claims Processor',
        'Receptionist'
      ],
      'medical': [
        'Medical Assistant',
        'Receptionist phòng khám',
        'Dental Assistant',
        'Medical Receptionist',
        'Patient Coordinator'
      ],
      'retail': [
        'Sales Associate',
        'Cashier',
        'Store Manager',
        'Customer Service',
        'Inventory Clerk'
      ]
    }
    return suggestions[category] || []
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

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
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'category') {
      setShowTitleSuggestions(value !== '')
    }
  }

  const handleTitleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion
    }))
    setShowTitleSuggestions(false)
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

      if (!formData.title || !formData.description || !formData.job_type || !formData.category) {
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
        .from('job_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          company: formData.company,
          location: formData.location,
          salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
          job_type: formData.job_type,
          category: formData.category,
          images: imageUrls,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })

      if (insertError) throw insertError

      const { data: creditResult } = await supabase.rpc('deduct_credits_for_post', {
        user_uuid: user.id,
        post_type: 'job',
        days: 30
      })

      if (!creditResult) {
        setError('Không thể trừ credits')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Error creating job post:', err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Tuyển Dụng Nhân Viên</h1>
            <p className="text-gray-600">Đăng tin tuyển dụng cho tiệm nails, nhà hàng, văn phòng và các doanh nghiệp Việt</p>
            <p className="text-sm text-gray-500 mt-2">💰 Chi phí: 30 credits cho 30 ngày hiển thị</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Mẹo đăng tin hiệu quả:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Viết tiêu đề rõ ràng: "Tuyển thợ nails có kinh nghiệm - $15-20/giờ"</li>
                <li>• Ghi rõ yêu cầu: kinh nghiệm, giờ làm việc, ngôn ngữ</li>
                <li>• Nêu quyền lợi: lương, tip, bảo hiểm, nghỉ phép</li>
                <li>• Thêm ảnh tiệm/văn phòng để thu hút ứng viên</li>
              </ul>
            </div>
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
                  Tiêu đề công việc *
                  <span className="text-xs text-gray-500 ml-2">Viết rõ ràng để thu hút ứng viên</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="VD: Tuyển thợ nails có kinh nghiệm - Lương cao + tip"
                  required
                />
                
                {showTitleSuggestions && formData.category && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">💡 Gợi ý tiêu đề phổ biến:</p>
                    <div className="space-y-1">
                      {getJobTitleSuggestions(formData.category).map((suggestion: string, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTitleSuggestionClick(suggestion)}
                          className="block w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          📝 {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiệm/công ty
                  <span className="text-xs text-gray-500 ml-2">Tên doanh nghiệp của bạn</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={
                    formData.category === 'nails' ? 'VD: Happy Nails Salon' :
                    formData.category === 'restaurant' ? 'VD: Phở Saigon Restaurant' :
                    formData.category === 'medical' ? 'VD: ABC Medical Clinic' :
                    formData.category === 'office-tax' ? 'VD: Viet Tax Services' :
                    formData.category === 'office-insurance' ? 'VD: ABC Insurance Agency' :
                    'Tên tiệm/công ty của bạn'
                  }
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngành nghề * 
                  <span className="text-xs text-gray-500 ml-2">Chọn loại hình kinh doanh của bạn</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">👆 Chọn ngành nghề của bạn</option>
                  {jobCategories.map(cat => (
                    <option key={cat.value} value={cat.value} title={cat.description}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {formData.category && (
                  <p className="text-xs text-gray-600 mt-1">
                    💼 {jobCategories.find(cat => cat.value === formData.category)?.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Loại công việc *
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Chọn loại công việc</option>
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Lương tối thiểu ($/giờ hoặc $/tháng)
                  </label>
                  <input
                    type="number"
                    id="salary_min"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={
                      formData.category === 'nails' ? '15' :
                      formData.category === 'restaurant' ? '14' :
                      formData.category === 'medical' ? '16' :
                      '15'
                    }
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Lương tối đa ($/giờ hoặc $/tháng)
                  </label>
                  <input
                    type="number"
                    id="salary_max"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={
                      formData.category === 'nails' ? '25' :
                      formData.category === 'restaurant' ? '18' :
                      formData.category === 'medical' ? '22' :
                      '20'
                    }
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Mẹo: Ghi rõ "$/giờ + tip" hoặc "$/tháng + benefits" để thu hút ứng viên
              </p>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Địa điểm làm việc
                  <span className="text-xs text-gray-500 ml-2">Địa chỉ tiệm/văn phòng</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="VD: San Jose, CA hoặc 123 Main St, San Jose, CA"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Mô tả công việc *
                  <span className="text-xs text-gray-500 ml-2">Viết chi tiết để thu hút ứng viên phù hợp</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={
                    formData.category === 'nails' ? 
`Mô tả công việc:
• Làm nails, pedicure, manicure
• Phục vụ khách hàng thân thiện
• Giữ gìn vệ sinh và sạch sẽ

Yêu cầu:
• Có kinh nghiệm làm nails tối thiểu 1 năm
• Biết tiếng Anh cơ bản
• Thái độ tích cực, chăm chỉ

Quyền lợi:
• Lương $15-25/giờ + tip
• Làm việc trong môi trường thân thiện
• Có cơ hội thăng tiến` :
                    formData.category === 'restaurant' ?
`Mô tả công việc:
• Nấu các món ăn Việt Nam truyền thống
• Chuẩn bị nguyên liệu, giữ vệ sinh bếp
• Phối hợp với team phục vụ

Yêu cầu:
• Có kinh nghiệm nấu ăn Việt Nam
• Biết tiếng Anh cơ bản
• Có thể làm việc cuối tuần

Quyền lợi:
• Lương $16-20/giờ
• Được ăn uống tại chỗ
• Môi trường làm việc vui vẻ` :
`Mô tả chi tiết:
• Nhiệm vụ công việc
• Yêu cầu kinh nghiệm và kỹ năng
• Giờ làm việc
• Quyền lợi và phúc lợi
• Cơ hội phát triển

Liên hệ:
• Số điện thoại
• Email
• Địa chỉ`
                  }
                  required
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 <strong>Mẹo viết mô tả hay:</strong> Ghi rõ công việc cụ thể → Yêu cầu kinh nghiệm → Quyền lợi hấp dẫn → Thông tin liên hệ
                </div>
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
