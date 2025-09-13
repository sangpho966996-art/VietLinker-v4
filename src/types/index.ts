export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  credits: number
  role: 'user' | 'admin' | 'moderator'
  created_at: string
  updated_at: string
}

export interface MarketplacePost {
  id: number
  user_id: string
  title: string
  description: string | null
  price: number | null
  category: string
  condition: string | null
  location: string | null
  images: string[] | null
  status: string
  admin_status: 'pending' | 'approved' | 'rejected'
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface BusinessProfile {
  id: number
  user_id: string
  business_name: string
  business_type: 'food' | 'service'
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  cover_image: string | null
  logo: string | null
  hours: Record<string, { open: string; close: string; closed: boolean }> | null
  status: string
  admin_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface JobPost {
  id: number
  user_id: string
  title: string
  description: string | null
  company: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  job_type: string
  category: string | null
  images: string[] | null
  status: string
  admin_status: 'pending' | 'approved' | 'rejected'
  expires_at: string | null
  created_at: string
  updated_at: string
}
