'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Business {
  id: number
  business_name: string
  business_type: string
  description: string | null
  city: string | null
  state: string | null
}

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('id, business_name, business_type, description, city, state')
          .eq('status', 'active')
          .limit(6)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to fetch businesses: ${error.message}`)
        }

        setBusinesses(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Doanh nghiệp nổi bật
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Doanh nghiệp nổi bật
            </h2>
            <p className="text-red-600">Không thể tải danh sách doanh nghiệp</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Doanh nghiệp nổi bật
          </h2>
          <p className="text-lg text-gray-600">
            Khám phá những doanh nghiệp Việt uy tín tại Mỹ
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Chưa có doanh nghiệp nào đăng ký</p>
            <Link
              href="/business/register"
              className="btn btn-primary"
            >
              Đăng ký doanh nghiệp đầu tiên
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/business/${business.id}`}
                  className="group bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-red-500 to-red-600">
                    <div className="flex items-center justify-center">
                      <span className="text-white text-4xl">
                        {business.business_type === 'food' ? '🍜' : '🛠️'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {business.business_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        business.business_type === 'food' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {business.business_type === 'food' ? 'Nhà hàng' : 'Dịch vụ'}
                      </span>
                    </div>
                    
                    {business.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    
                    {(business.city || business.state) && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {business.city && business.state 
                          ? `${business.city}, ${business.state}`
                          : business.city || business.state
                        }
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/business"
                className="btn btn-secondary"
              >
                Xem tất cả doanh nghiệp
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
