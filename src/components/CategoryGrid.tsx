import React from 'react'
import Link from 'next/link'

const categories = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Mua bán đồ cũ, điện tử, xe cộ',
    icon: '🛍️',
    href: '/marketplace',
    color: 'bg-blue-500',
    posts: '1,234 tin đăng',
    requiresCredits: true
  },
  {
    id: 'jobs',
    title: 'Việc làm',
    description: 'Tìm việc làm, tuyển dụng',
    icon: '💼',
    href: '/jobs',
    color: 'bg-green-500',
    posts: '856 việc làm',
    requiresCredits: true
  },
  {
    id: 'real-estate',
    title: 'Bất động sản',
    description: 'Nhà bán, cho thuê, đất đai',
    icon: '🏠',
    href: '/real-estate',
    color: 'bg-purple-500',
    posts: '432 bất động sản',
    requiresCredits: true
  },
  {
    id: 'food',
    title: 'Nhà hàng',
    description: 'Phở, bánh mì, quán ăn Việt',
    icon: '🍜',
    href: '/food',
    color: 'bg-red-500',
    posts: '289 nhà hàng',
    requiresCredits: false
  },
  {
    id: 'services',
    title: 'Dịch vụ',
    description: 'Nail, tóc, bảo hiểm, luật sư',
    icon: '🛠️',
    href: '/services',
    color: 'bg-yellow-500',
    posts: '567 dịch vụ',
    requiresCredits: false
  }
]

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Khám phá danh mục
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm những gì bạn cần trong cộng đồng Việt Nam tại Mỹ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white text-2xl mr-4`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {category.title}
                    </h3>
                    {category.requiresCredits && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        Cần credits
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.posts}
                  </span>
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300"></div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cách hoạt động
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Người dùng thường</h4>
                <p className="text-sm text-gray-600">
                  Mua credits để đăng tin trong Marketplace, Việc làm, Bất động sản. 
                  Mỗi tin = 1 credit/ngày.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Doanh nghiệp</h4>
                <p className="text-sm text-gray-600">
                  Trả 50 credits một lần để có profile vĩnh viễn trong Nhà hàng & Dịch vụ. 
                  Đăng tin không giới hạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
