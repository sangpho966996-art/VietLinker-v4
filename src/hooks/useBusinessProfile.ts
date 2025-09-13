import { useQuery } from '@tanstack/react-query'

export function useBusinessProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['business-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')
      
      const response = await fetch(`/api/business-profiles?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch business profile')
      
      const result = await response.json()
      return result.data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUserCredits(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-credits', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')
      
      const response = await fetch(`/api/user/credits?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user credits')
      
      const result = await response.json()
      return result.credits
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useMarketplacePosts(filters?: { category?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['marketplace-posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.page) params.set('page', filters.page.toString())
      
      const response = await fetch(`/api/marketplace-posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch marketplace posts')
      
      const result = await response.json()
      return result.data
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useJobPosts(filters?: { category?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['job-posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.page) params.set('page', filters.page.toString())
      
      const response = await fetch(`/api/job-posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch job posts')
      
      const result = await response.json()
      return result.data
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useRealEstatePosts(filters?: { propertyType?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['real-estate-posts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.propertyType) params.set('property_type', filters.propertyType)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.page) params.set('page', filters.page.toString())
      
      const response = await fetch(`/api/real-estate-posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch real estate posts')
      
      const result = await response.json()
      return result.data
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
