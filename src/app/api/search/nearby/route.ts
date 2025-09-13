import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const radius = parseInt(searchParams.get('radius') || '10') // miles
  const type = searchParams.get('type') || 'all'
  const query = searchParams.get('q') || ''

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  const results: {
    id: string
    title: string
    description: string
    location: string
    type: string
    distance: number
    price?: number
    address?: string
    phone?: string
    website?: string
    image_url?: string
  }[] = []

  try {
    
    if (type === 'all' || type === 'business') {
      const { data: businesses } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('admin_status', 'approved')
        .ilike('name', `%${query}%`)

      if (businesses) {
        businesses.forEach((business: {
          id: string
          name: string
          description: string
          city: string
          state: string
          address: string
          phone: string
          website: string
        }) => {
          let businessLat = 0, businessLng = 0
          
          if (business.city?.toLowerCase().includes('houston')) {
            businessLat = 29.7604
            businessLng = -95.3698
          } else if (business.city?.toLowerCase().includes('dallas')) {
            businessLat = 32.7767
            businessLng = -96.7970
          } else if (business.city?.toLowerCase().includes('austin')) {
            businessLat = 30.2672
            businessLng = -97.7431
          }

          const distance = calculateDistance(lat, lng, businessLat, businessLng)
          
          if (distance <= radius) {
            results.push({
              id: business.id,
              title: business.name,
              description: business.description,
              location: `${business.city}, ${business.state}`,
              address: business.address,
              type: 'business',
              distance: distance,
              phone: business.phone,
              website: business.website
            })
          }
        })
      }
    }

    if (type === 'all' || type === 'marketplace') {
      const { data: marketplace } = await supabase
        .from('marketplace_posts')
        .select('*')
        .eq('admin_status', 'approved')
        .ilike('title', `%${query}%`)

      if (marketplace) {
        marketplace.forEach((item: {
          id: string
          title: string
          description: string
          price: number
          location: string
          images: string[]
        }) => {
          const distance = estimateDistanceFromLocation(item.location, lat, lng)
          
          if (distance <= radius) {
            results.push({
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price,
              location: item.location,
              type: 'marketplace',
              distance: distance,
              image_url: item.images?.[0]
            })
          }
        })
      }
    }

    results.sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      results: results.slice(0, 50), // Limit to 50 results
      total: results.length,
      center: { lat, lng },
      radius
    })

  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function estimateDistanceFromLocation(location: string, userLat: number, userLng: number): number {
  let locationLat = 0, locationLng = 0
  
  if (location.toLowerCase().includes('houston')) {
    locationLat = 29.7604
    locationLng = -95.3698
  } else if (location.toLowerCase().includes('dallas')) {
    locationLat = 32.7767
    locationLng = -96.7970
  } else if (location.toLowerCase().includes('austin')) {
    locationLat = 30.2672
    locationLng = -97.7431
  } else {
    return 15
  }

  return calculateDistance(userLat, userLng, locationLat, locationLng)
}
