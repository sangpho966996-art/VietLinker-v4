'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'


function ContactForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  useEffect(() => {
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    const recipient = searchParams.get('recipient')
    const subject = searchParams.get('subject')
    const service = searchParams.get('service')

    let message = ''
    if (type && id) {
      switch (type) {
        case 'job':
          message = `Xin chào,\n\nTôi quan tâm đến công việc này và muốn tìm hiểu thêm thông tin.\n\nCảm ơn!`
          break
        case 'marketplace':
          message = `Xin chào,\n\nTôi quan tâm đến sản phẩm này và muốn tìm hiểu thêm thông tin về giá cả và tình trạng.\n\nCảm ơn!`
          break
        case 'real-estate':
          message = `Xin chào,\n\nTôi quan tâm đến bất động sản này và muốn tìm hiểu thêm thông tin chi tiết.\n\nCảm ơn!`
          break
        case 'food':
          if (service === 'reservation') {
            message = `Xin chào,\n\nTôi muốn đặt bàn tại nhà hàng của quý vị. Xin vui lòng cho biết thời gian có sẵn.\n\nCảm ơn!`
          } else {
            message = `Xin chào,\n\nTôi muốn tìm hiểu thêm về nhà hàng của quý vị.\n\nCảm ơn!`
          }
          break
        case 'service':
          if (service === 'appointment') {
            message = `Xin chào,\n\nTôi muốn đặt lịch hẹn sử dụng dịch vụ của quý vị. Xin vui lòng cho biết thời gian có sẵn.\n\nCảm ơn!`
          } else {
            message = `Xin chào,\n\nTôi quan tâm đến dịch vụ của quý vị và muốn tìm hiểu thêm thông tin.\n\nCảm ơn!`
          }
          break
      }
    }

    if (subject) {
      message = `Chủ đề: ${decodeURIComponent(subject)}\n\n${message}`
    }

    if (recipient) {
      message = `Gửi đến: ${recipient}\n\n${message}`
    }

    setFormData(prev => ({
      ...prev,
      message: message || prev.message
    }))
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📧 Thông tin liên hệ</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600">📧</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Email</p>
              <p className="text-gray-600">support@vietlinker.com</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">🌐</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Website</p>
              <p className="text-gray-600">www.vietlinker.com</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">⏰</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Giờ hỗ trợ</p>
              <p className="text-gray-600">Thứ 2 - Chủ nhật: 9:00 AM - 9:00 PM (CST)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Gửi tin nhắn</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập họ tên của bạn"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tin nhắn</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập tin nhắn của bạn..."
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full btn btn-primary"
          >
            Gửi tin nhắn
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Liên hệ
              </h1>
              <p className="text-lg text-gray-600">
                Chúng tôi luôn sẵn sàng hỗ trợ cộng đồng Việt Nam tại Mỹ
              </p>
            </div>

            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
