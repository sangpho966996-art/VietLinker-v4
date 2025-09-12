import React, { Suspense } from 'react'
import Header from '@/components/Header'


export default function HelpPage() {
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
                Trung tâm trợ giúp
              </h1>
              <p className="text-lg text-gray-600">
                Tìm câu trả lời cho các câu hỏi thường gặp về VietLinker
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🛍️ Marketplace</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">Làm sao để đăng tin bán hàng?</h3>
                    <p className="text-sm text-gray-600">Vào Dashboard → Marketplace → Đăng tin mới. Cần 30 credits cho 30 ngày.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Tại sao tin đăng chưa hiển thị?</h3>
                    <p className="text-sm text-gray-600">Tin đăng cần được admin duyệt trước khi hiển thị công khai.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💼 Việc làm</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">Cách đăng tin tuyển dụng?</h3>
                    <p className="text-sm text-gray-600">Vào Dashboard → Việc làm → Đăng việc làm. Chi phí 30 credits cho 30 ngày.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Có template sẵn không?</h3>
                    <p className="text-sm text-gray-600">Có nhiều template cho tiệm nails, nhà hàng, văn phòng thuế, y tế...</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 Bất động sản</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">Đăng tin bán/cho thuê nhà?</h3>
                    <p className="text-sm text-gray-600">Dashboard → Bất động sản → Đăng bất động sản. Cần 30 credits.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Có thể đăng bao nhiều ảnh?</h3>
                    <p className="text-sm text-gray-600">Tối đa 5 ảnh cho mỗi tin đăng bất động sản.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Credits</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">Credits là gì?</h3>
                    <p className="text-sm text-gray-600">Credits dùng để đăng tin. 1 credit = 1 ngày hiển thị tin đăng.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Mua credits ở đâu?</h3>
                    <p className="text-sm text-gray-600">Vào trang Credits để mua qua Stripe. Có gói 10, 25, 50, 100 credits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
