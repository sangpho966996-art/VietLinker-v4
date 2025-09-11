'use client'

import React, { Suspense } from 'react'
import Header from '@/components/Header'


export default function PrivacyPage() {
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
                Chính sách bảo mật
              </h1>
              <p className="text-lg text-gray-600">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Thông tin chúng tôi thu thập</h2>
                <p className="text-gray-600 mb-6">
                  VietLinker thu thập thông tin khi bạn đăng ký tài khoản, đăng tin, hoặc sử dụng các dịch vụ của chúng tôi:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Thông tin cá nhân: họ tên, email, số điện thoại</li>
                  <li>Thông tin đăng tin: nội dung, hình ảnh, địa chỉ</li>
                  <li>Thông tin thanh toán: qua Stripe (chúng tôi không lưu trữ thông tin thẻ)</li>
                  <li>Thông tin kỹ thuật: IP address, browser, thiết bị</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Cung cấp và cải thiện dịch vụ VietLinker</li>
                  <li>Xử lý thanh toán và quản lý credits</li>
                  <li>Gửi thông báo về tài khoản và tin đăng</li>
                  <li>Hỗ trợ khách hàng và giải quyết tranh chấp</li>
                  <li>Tuân thủ pháp luật và bảo vệ quyền lợi người dùng</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Chia sẻ thông tin</h2>
                <p className="text-gray-600 mb-6">
                  Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Với sự đồng ý của bạn</li>
                  <li>Với các nhà cung cấp dịch vụ (Supabase, Stripe, Vercel)</li>
                  <li>Khi pháp luật yêu cầu</li>
                  <li>Để bảo vệ quyền lợi và an toàn của VietLinker và người dùng</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Bảo mật thông tin</h2>
                <p className="text-gray-600 mb-6">
                  Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để bảo vệ thông tin của bạn, bao gồm mã hóa SSL, xác thực hai yếu tố, và kiểm soát truy cập nghiêm ngặt.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Quyền của bạn</h2>
                <p className="text-gray-600 mb-6">
                  Bạn có quyền truy cập, chỉnh sửa, xóa thông tin cá nhân và yêu cầu ngừng xử lý dữ liệu. Liên hệ support@vietlinker.com để thực hiện các quyền này.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Liên hệ</h2>
                <p className="text-gray-600">
                  Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ: support@vietlinker.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
