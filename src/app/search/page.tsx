'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, Database } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

interface SearchResult {
  id: string
  title: string
  description: string
  price?: number | null
  location: string
  address?: string | null
  city?: string | null
  state?: string | null
  type: 'marketplace' | 'job' | 'real_estate' | 'business'
  image_url?: string | null
  distance?: number
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  const geocodeLocation = async (locationStr: string) => {
    try {
      if (locationStr.toLowerCase().includes('houston')) {
        setUserLocation({ lat: 29.7604, lng: -95.3698 })
      } else if (locationStr.toLowerCase().includes('dallas')) {
        setUserLocation({ lat: 32.7767, lng: -96.7970 })
      } else if (locationStr.toLowerCase().includes('austin')) {
        setUserLocation({ lat: 30.2672, lng: -97.7431 })
      }
    } catch (error) {
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const searchAll = useCallback(async () => {
    setLoading(true)
    const allResults: SearchResult[] = []

    try {
      const { data: marketplaceData } = await supabase
        .from('marketplace_posts')
        .select('*')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (marketplaceData) {
        marketplaceData.forEach((item: Database['public']['Tables']['marketplace_posts']['Row']) => {
          allResults.push({
            id: item.id.toString(),
            title: item.title || '',
            description: item.description || '',
            price: item.price,
            location: item.location || '',
            type: 'marketplace',
            image_url: item.images?.[0]
          })
        })
      }

      const { data: jobData } = await supabase
        .from('job_posts')
        .select('*')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (jobData) {
        jobData.forEach((item: Database['public']['Tables']['job_posts']['Row']) => {
          allResults.push({
            id: item.id.toString(),
            title: item.title || '',
            description: item.description || '',
            location: item.location || '',
            type: 'job'
          })
        })
      }

      const { data: realEstateData } = await supabase
        .from('real_estate_posts')
        .select('*')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (realEstateData) {
        realEstateData.forEach((item: Database['public']['Tables']['real_estate_posts']['Row']) => {
          allResults.push({
            id: item.id.toString(),
            title: item.title || '',
            description: item.description || '',
            price: item.price,
            location: `${item.city || ''}, ${item.state || ''}`,
            address: item.address,
            city: item.city,
            state: item.state,
            type: 'real_estate',
            image_url: item.images?.[0]
          })
        })
      }

      const { data: businessData } = await supabase
        .from('business_profiles')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (businessData) {
        businessData.forEach((item: Database['public']['Tables']['business_profiles']['Row']) => {
          allResults.push({
            id: item.id.toString(),
            title: item.business_name || '',
            description: item.description || '',
            location: `${item.city || ''}, ${item.state || ''}`,
            address: item.address,
            city: item.city,
            state: item.state,
            type: 'business'
          })
        })
      }

      if (userLocation) {
        allResults.forEach(result => {
          if (result.city?.toLowerCase().includes('houston')) {
            result.distance = calculateDistance(userLocation.lat, userLocation.lng, 29.7604, -95.3698)
          } else if (result.city?.toLowerCase().includes('dallas')) {
            result.distance = calculateDistance(userLocation.lat, userLocation.lng, 32.7767, -96.7970)
          } else if (result.city?.toLowerCase().includes('austin')) {
            result.distance = calculateDistance(userLocation.lat, userLocation.lng, 30.2672, -97.7431)
          }
        })

        allResults.sort((a, b) => (a.distance || 999) - (b.distance || 999))
      }

      setResults(allResults)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [query, userLocation])

  useEffect(() => {
    const performSearch = async () => {
      if (location && location !== '') {
        await geocodeLocation(location)
      }
      await searchAll()
    }
    performSearch()
  }, [query, location, searchAll])

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'marketplace':
        return `/marketplace/${result.id}`
      case 'job':
        return `/jobs/${result.id}`
      case 'real_estate':
        return `/real-estate/${result.id}`
      case 'business':
        return `/food/${result.id}`
      default:
        return '#'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'marketplace':
        return 'Marketplace'
      case 'job':
        return 'Việc làm'
      case 'real_estate':
        return 'Bất động sản'
      case 'business':
        return 'Doanh nghiệp'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
        <Header />
      </Suspense>
      
      {/* Search Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-gray-600">
            {query && `Tìm kiếm: "${query}"`}
            {location && ` tại ${location}`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Không tìm thấy kết quả nào</p>
            <Link 
              href="/"
              className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Quay về trang chủ
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {result.image_url && (
                    <div className="flex-shrink-0">
                      <Image
                        src={result.image_url}
                        alt={result.title}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.distance && (
                        <span className="text-sm text-gray-500">
                          {result.distance.toFixed(1)} miles
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link 
                        href={getResultLink(result)}
                        className="hover:text-red-600 transition-colors"
                      >
                        {result.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {result.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        📍 {result.location}
                      </div>
                      {result.price && (
                        <div className="text-lg font-semibold text-red-600">
                          ${result.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
