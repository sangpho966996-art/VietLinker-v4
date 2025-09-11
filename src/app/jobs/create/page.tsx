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
  const [showTemplates, setShowTemplates] = useState(false)
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

  interface JobTemplate {
    title: string
    description: string
    salary_min: string
    salary_max: string
    job_type: string
    company_placeholder: string
  }

  const getJobTemplates = (category: string): JobTemplate[] => {
    const templates: Record<string, JobTemplate[]> = {
      'nails': [
        {
          title: 'Tuyển Thợ Nails Có Kinh Nghiệm - Lương Cao + Tip',
          description: `🔍 TUYỂN THỢ NAILS CÓ KINH NGHIỆM

📋 MÔ TẢ CÔNG VIỆC:
• Làm nails, pedicure, manicure chuyên nghiệp
• Phục vụ khách hàng thân thiện, tận tình
• Giữ gìn vệ sinh và sạch sẽ nơi làm việc
• Hỗ trợ đồng nghiệp khi cần thiết

✅ YÊU CẦU:
• Có kinh nghiệm làm nails tối thiểu 2 năm
• Biết tiếng Anh cơ bản để giao tiếp với khách
• Thái độ tích cực, chăm chỉ, trung thực
• Có thể làm việc cuối tuần

💰 QUYỀN LỢI:
• Lương $18-25/giờ + tip hậu hĩnh (trung bình $200-300/ngày)
• Làm việc trong môi trường thân thiện, vui vẻ
• Có cơ hội thăng tiến lên vị trí quản lý
• Nghỉ chủ nhật hoặc thứ 2 (tùy chọn)
• Được training kỹ thuật mới

📞 LIÊN HỆ NGAY:
• Gọi: [SỐ ĐIỆN THOẠI]
• Text: [SỐ ĐIỆN THOẠI] 
• Đến trực tiếp: [ĐỊA CHỈ TIỆM]`,
          salary_min: '18',
          salary_max: '25',
          job_type: 'full-time',
          company_placeholder: 'VD: Happy Nails Salon'
        },
        {
          title: 'Tuyển Receptionist Tiệm Nails - Part Time',
          description: `📞 TUYỂN RECEPTIONIST TIỆM NAILS

📋 MÔ TẢ CÔNG VIỆC:
• Tiếp đón khách hàng, đặt lịch hẹn
• Thu ngân, xử lý thanh toán
• Trả lời điện thoại, tư vấn dịch vụ
• Hỗ trợ thợ nails khi cần thiết
• Giữ gìn sạch sẽ khu vực tiếp đón

✅ YÊU CẦU:
• Tiếng Anh tốt (nói và viết)
• Thái độ thân thiện, chuyên nghiệp
• Có kinh nghiệm customer service (ưu tiên)
• Biết sử dụng máy tính cơ bản

💰 QUYỀN LỢI:
• Lương $15-18/giờ
• Giờ làm việc linh hoạt
• Môi trường làm việc thoải mái
• Được training đầy đủ

📞 LIÊN HỆ:
• Call/Text: [SỐ ĐIỆN THOẠI]
• Email: [EMAIL]`,
          salary_min: '15',
          salary_max: '18',
          job_type: 'part-time',
          company_placeholder: 'VD: Luxury Nails Spa'
        }
      ],
      'restaurant': [
        {
          title: 'Tuyển Đầu Bếp Việt Nam - Kinh Nghiệm Phở/Bún',
          description: `👨‍🍳 TUYỂN ĐẦU BẾP VIỆT NAM

📋 MÔ TẢ CÔNG VIỆC:
• Nấu các món ăn Việt Nam truyền thống (phở, bún, cơm)
• Chuẩn bị nguyên liệu, gia vị theo công thức
• Đảm bảo chất lượng và vệ sinh thực phẩm
• Phối hợp với team bếp và phục vụ
• Kiểm soát tồn kho và đặt hàng nguyên liệu

✅ YÊU CẦU:
• Có kinh nghiệm nấu ăn Việt Nam tối thiểu 3 năm
• Biết nấu phở, bún bò Huế, cơm tấm
• Biết tiếng Anh cơ bản
• Có thể làm việc cuối tuần và ngày lễ
• Sức khỏe tốt, chịu được áp lực cao

💰 QUYỀN LỢI:
• Lương $18-22/giờ (tùy kinh nghiệm)
• Được ăn uống tại chỗ
• Overtime pay x1.5
• Môi trường làm việc năng động
• Cơ hội thăng tiến lên head chef

📞 LIÊN HỆ NGAY:
• Gọi: [SỐ ĐIỆN THOẠI]
• Đến trực tiếp: [ĐỊA CHỈ NHÀ HÀNG]`,
          salary_min: '18',
          salary_max: '22',
          job_type: 'full-time',
          company_placeholder: 'VD: Phở Saigon Restaurant'
        },
        {
          title: 'Tuyển Phục Vụ Nhà Hàng - Biết Tiếng Việt/Anh',
          description: `🍽️ TUYỂN PHỤC VỤ NHÀ HÀNG

📋 MÔ TẢ CÔNG VIỆC:
• Tiếp đón và phục vụ khách hàng
• Nhận order, tư vấn món ăn
• Dọn dẹp bàn ghế, khu vực phục vụ
• Hỗ trợ thu ngân khi cần
• Đảm bảo khách hàng hài lòng

✅ YÊU CẦU:
• Biết tiếng Việt và tiếng Anh
• Thái độ thân thiện, nhiệt tình
• Có kinh nghiệm phục vụ (ưu tiên)
• Có thể làm việc cuối tuần
• Nhanh nhẹn, chịu được áp lực

💰 QUYỀN LỢI:
• Lương $15-17/giờ + tips
• Được ăn uống tại chỗ
• Giờ làm việc linh hoạt
• Môi trường thân thiện
• Thưởng cuối năm

📞 LIÊN HỆ:
• Call/Text: [SỐ ĐIỆN THOẠI]
• Đến trực tiếp: [ĐỊA CHỈ]`,
          salary_min: '15',
          salary_max: '17',
          job_type: 'part-time',
          company_placeholder: 'VD: Bún Bò Huế Sài Gòn'
        }
      ],
      'medical': [
        {
          title: 'Tuyển Medical Assistant - Phòng Khám Đa Khoa',
          description: `⚕️ TUYỂN MEDICAL ASSISTANT

📋 MÔ TẢ CÔNG VIỆC:
• Hỗ trợ bác sĩ trong khám chữa bệnh
• Đo huyết áp, cân nặng, chiều cao bệnh nhân
• Chuẩn bị dụng cụ y tế, phòng khám
• Hướng dẫn bệnh nhân về thuốc và chế độ
• Cập nhật hồ sơ bệnh án điện tử

✅ YÊU CẦU:
• Có chứng chỉ Medical Assistant
• Biết tiếng Việt và tiếng Anh thành thạo
• Có kinh nghiệm làm việc trong phòng khám
• Kỹ năng giao tiếp tốt với bệnh nhân
• Biết sử dụng phần mềm EMR

💰 QUYỀN LỢI:
• Lương $18-22/giờ
• Bảo hiểm y tế đầy đủ
• 401K matching
• Paid time off
• Môi trường làm việc chuyên nghiệp
• Cơ hội học hỏi và phát triển

📞 LIÊN HỆ:
• Email resume: [EMAIL]
• Fax: [FAX NUMBER]
• Gọi: [SỐ ĐIỆN THOẠI]`,
          salary_min: '18',
          salary_max: '22',
          job_type: 'full-time',
          company_placeholder: 'VD: ABC Medical Clinic'
        },
        {
          title: 'Tuyển Receptionist Phòng Khám - Biết Tiếng Việt',
          description: `📋 TUYỂN RECEPTIONIST PHÒNG KHÁM

📋 MÔ TẢ CÔNG VIỆC:
• Tiếp đón bệnh nhân, đặt lịch hẹn
• Xử lý bảo hiểm và thanh toán
• Trả lời điện thoại, tư vấn dịch vụ
• Cập nhật thông tin bệnh nhân
• Hỗ trợ bác sĩ và y tá khi cần

✅ YÊU CẦU:
• Biết tiếng Việt và tiếng Anh thành thạo
• Có kinh nghiệm customer service
• Biết sử dụng máy tính và phần mềm y tế
• Thái độ thân thiện, kiên nhẫn
• Có thể làm việc trong môi trường y tế

💰 QUYỀN LỢI:
• Lương $16-19/giờ
• Bảo hiểm y tế
• Paid sick leave
• Môi trường làm việc ổn định
• Training về quy trình y tế

📞 LIÊN HỆ:
• Email: [EMAIL]
• Gọi: [SỐ ĐIỆN THOẠI]
• Đến trực tiếp: [ĐỊA CHỈ PHÒNG KHÁM]`,
          salary_min: '16',
          salary_max: '19',
          job_type: 'full-time',
          company_placeholder: 'VD: Phòng Khám Gia Đình'
        }
      ],
      'office-insurance': [
        {
          title: 'Tuyển Insurance Agent - Cộng Đồng Việt Nam',
          description: `🛡️ TUYỂN INSURANCE AGENT

📋 MÔ TẢ CÔNG VIỆC:
• Tư vấn bảo hiểm cho cộng đồng Việt Nam
• Bán các sản phẩm: auto, home, life, health insurance
• Xử lý claims và customer service
• Xây dựng mối quan hệ với khách hàng
• Tham gia các sự kiện cộng đồng

✅ YÊU CẦU:
• Có license bảo hiểm California (hoặc sẵn sàng học)
• Biết tiếng Việt và tiếng Anh thành thạo
• Kỹ năng bán hàng và giao tiếp tốt
• Có kinh nghiệm sales (ưu tiên)
• Có xe và bằng lái hợp lệ

💰 QUYỀN LỢI:
• Base salary + commission (unlimited earning)
• $40,000-$80,000+ năm đầu
• Training đầy đủ về sản phẩm
• Leads được cung cấp
• Thưởng performance
• Benefits package

📞 LIÊN HỆ:
• Email: [EMAIL]
• Call: [SỐ ĐIỆN THOẠI]
• Office: [ĐỊA CHỈ VĂN PHÒNG]`,
          salary_min: '40000',
          salary_max: '80000',
          job_type: 'full-time',
          company_placeholder: 'VD: Viet Insurance Services'
        },
        {
          title: 'Tuyển Customer Service Rep - Văn Phòng Bảo Hiểm',
          description: `📞 TUYỂN CUSTOMER SERVICE REPRESENTATIVE

📋 MÔ TẢ CÔNG VIỆC:
• Hỗ trợ khách hàng qua điện thoại và email
• Xử lý claims và thay đổi policy
• Giải thích các sản phẩm bảo hiểm
• Cập nhật thông tin khách hàng
• Hỗ trợ agent trong công việc bán hàng

✅ YÊU CẦU:
• Biết tiếng Việt và tiếng Anh
• Có kinh nghiệm customer service
• Kỹ năng giao tiếp tốt qua điện thoại
• Biết sử dụng máy tính thành thạo
• Kiên nhẫn và tỉ mỉ trong công việc

💰 QUYỀN LỢI:
• Lương $17-20/giờ
• Bảo hiểm y tế và dental
• 401K plan
• Paid vacation
• Môi trường làm việc văn phòng
• Cơ hội thăng tiến

📞 LIÊN HỆ:
• Email resume: [EMAIL]
• Call: [SỐ ĐIỆN THOẠI]`,
          salary_min: '17',
          salary_max: '20',
          job_type: 'full-time',
          company_placeholder: 'VD: ABC Insurance Agency'
        }
      ]
    }
    return templates[category] || []
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
      setShowTemplates(value !== '')
    }
  }

  const handleTitleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion
    }))
    setShowTitleSuggestions(false)
  }

  const handleTemplateSelect = (template: JobTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      salary_min: template.salary_min,
      salary_max: template.salary_max,
      job_type: template.job_type
    }))
    setShowTemplates(false)
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
                <li>• Viết tiêu đề rõ ràng: &quot;Tuyển thợ nails có kinh nghiệm - $15-20/giờ&quot;</li>
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

              {showTemplates && formData.category && getJobTemplates(formData.category).length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    ✨ Mẫu tin đăng có sẵn - Chỉ cần sửa tên tiệm là đăng ngay!
                  </h3>
                  <div className="space-y-3">
                    {getJobTemplates(formData.category).map((template, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{template.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">
                              💰 ${template.salary_min}-${template.salary_max}/giờ • {template.job_type === 'full-time' ? 'Toàn thời gian' : 'Bán thời gian'}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {template.description.substring(0, 100)}...
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTemplateSelect(template)}
                            className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            📝 Dùng mẫu này
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    💡 <strong>Lưu ý:</strong> Sau khi chọn mẫu, bạn chỉ cần thay đổi tên tiệm, địa chỉ, số điện thoại là có thể đăng tin ngay!
                  </p>
                </div>
              )}

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
                💡 Mẹo: Ghi rõ &quot;$/giờ + tip&quot; hoặc &quot;$/tháng + benefits&quot; để thu hút ứng viên
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
