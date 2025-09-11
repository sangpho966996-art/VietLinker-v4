'use client'

import React, { Suspense } from 'react'
import Header from '@/components/Header'


export default function TermsPage() {
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
                Điều khoản sử dụng
              </h1>
              <p className="text-lg text-gray-600">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Chấp nhận điều khoản</h2>
                <p className="text-gray-600 mb-6">
                  Bằng việc sử dụng VietLinker, bạn đồng ý tuân thủ các điều khoản và điều kiện này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Mô tả dịch vụ</h2>
                <p className="text-gray-600 mb-6">
                  VietLinker là nền tảng kết nối cộng đồng Việt Nam tại Mỹ, cung cấp các dịch vụ:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Marketplace: mua bán sản phẩm</li>
                  <li>Việc làm: tìm kiếm và đăng tin tuyển dụng</li>
                  <li>Bất động sản: mua bán, cho thuê nhà đất</li>
                  <li>Nhà hàng: tìm kiếm và đánh giá nhà hàng Việt</li>
                  <li>Dịch vụ: các dịch vụ chuyên nghiệp</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Tài khoản người dùng</h2>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Bạn phải cung cấp thông tin chính xác khi đăng ký</li>
                  <li>Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu</li>
                  <li>Một người chỉ được tạo một tài khoản</li>
                  <li>Chúng tôi có quyền đình chỉ tài khoản vi phạm điều khoản</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Nội dung và tin đăng</h2>
                <p className="text-gray-600 mb-4">Nội dung không được phép:</p>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Vi phạm pháp luật Mỹ hoặc Việt Nam</li>
                  <li>Lừa đảo, gian lận, thông tin sai lệch</li>
                  <li>Nội dung khiêu dâm, bạo lực, phân biệt chủng tộc</li>
                  <li>Spam, quảng cáo không liên quan</li>
                  <li>Vi phạm bản quyền, sở hữu trí tuệ</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Hệ thống Credits</h2>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Credits được mua qua Stripe với giá cố định</li>
                  <li>Credits không thể hoàn lại sau khi sử dụng</li>
                  <li>Mỗi tin đăng tiêu tốn credits theo thời gian hiển thị</li>
                  <li>Credits không có giá trị tiền tệ và không thể chuyển nhượng</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Thanh toán và hoàn tiền</h2>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Thanh toán được xử lý qua Stripe</li>
                  <li>Hoàn tiền chỉ trong trường hợp lỗi hệ thống</li>
                  <li>Không hoàn tiền cho credits đã sử dụng</li>
                  <li>Tranh chấp thanh toán được giải quyết qua Stripe</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mb-4">7. Trách nhiệm và giới hạn</h2>
                <p className="text-gray-600 mb-6">
                  VietLinker không chịu trách nhiệm cho các giao dịch giữa người dùng. Chúng tôi chỉ cung cấp nền tảng kết nối và không đảm bảo tính chính xác của thông tin đăng tải.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-4">8. Thay đổi điều khoản</h2>
                <p className="text-gray-600 mb-6">
                  Chúng tôi có quyền thay đổi điều khoản bất kỳ lúc nào. Thay đổi sẽ có hiệu lực ngay khi đăng tải trên website.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-4">9. Liên hệ</h2>
                <p className="text-gray-600">
                  Câu hỏi về điều khoản sử dụng, liên hệ: support@vietlinker.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
