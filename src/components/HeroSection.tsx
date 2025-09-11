'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (location.trim()) params.set('location', location.trim())
    
    router.push(`/search?${params.toString()}`)
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          
          if (!response.ok) {
            throw new Error('Failed to get location data')
          }
          
          const data = await response.json()
          const locationString = `${data.city}, ${data.principalSubdivision}`
          setLocation(locationString)
        } catch (_error) {
        }
      },
      (_error) => {
      }
    )
  }

  return (
    <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Kết nối cộng đồng Việt
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Tìm kiếm việc làm, nhà hàng, dịch vụ và nhiều hơn nữa trong cộng đồng Việt Nam tại Mỹ
        </p>

        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhà hàng, dịch vụ, việc làm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Vị trí (ví dụ: Houston, TX)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 pr-12 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
                  title="Sử dụng vị trí hiện tại"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <button
                type="submit"
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <span className="opacity-75">Tìm kiếm phổ biến:</span>
          <button
            onClick={() => setSearchQuery('phở')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Phở
          </button>
          <button
            onClick={() => setSearchQuery('nail salon')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Nail Salon
          </button>
          <button
            onClick={() => setSearchQuery('bảo hiểm')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Bảo hiểm
          </button>
          <button
            onClick={() => setSearchQuery('việc làm')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Việc làm
          </button>
        </div>
      </div>
    </section>
  )
}
