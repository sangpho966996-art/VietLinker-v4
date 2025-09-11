import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Some features may not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          address: string | null
          avatar_url: string | null
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      marketplace_posts: {
        Row: {
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
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description?: string | null
          price?: number | null
          category: string
          condition?: string | null
          location?: string | null
          images?: string[] | null
          status?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          description?: string | null
          price?: number | null
          category?: string
          condition?: string | null
          location?: string | null
          images?: string[] | null
          status?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      job_posts: {
        Row: {
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
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description?: string | null
          company?: string | null
          location?: string | null
          salary_min?: number | null
          salary_max?: number | null
          job_type: string
          category?: string | null
          images?: string[] | null
          status?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          description?: string | null
          company?: string | null
          location?: string | null
          salary_min?: number | null
          salary_max?: number | null
          job_type?: string
          category?: string | null
          images?: string[] | null
          status?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      real_estate_posts: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string | null
          price: number | null
          property_type: 'sale' | 'rent' | 'room-rental'
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          images: string[] | null
          status: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description?: string | null
          price?: number | null
          property_type: 'sale' | 'rent' | 'room-rental'
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          images?: string[] | null
          status?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          description?: string | null
          price?: number | null
          property_type?: 'sale' | 'rent' | 'room-rental'
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          images?: string[] | null
          status?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_profiles: {
        Row: {
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
          hours: Record<string, unknown> | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          business_name: string
          business_type: 'food' | 'service'
          description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          cover_image?: string | null
          logo?: string | null
          hours?: Record<string, unknown> | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          business_name?: string
          business_type?: 'food' | 'service'
          description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          cover_image?: string | null
          logo?: string | null
          hours?: Record<string, unknown> | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: number
          user_id: string
          amount: number
          type: 'purchase' | 'deduction' | 'refund'
          description: string
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          amount: number
          type: 'purchase' | 'deduction' | 'refund'
          description: string
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          amount?: number
          type?: 'purchase' | 'deduction' | 'refund'
          description?: string
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: number
          business_profile_id: number
          name: string
          description: string | null
          price: number | null
          category: string
          available: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          business_profile_id: number
          name: string
          description?: string | null
          price?: number | null
          category: string
          available?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          business_profile_id?: number
          name?: string
          description?: string | null
          price?: number | null
          category?: string
          available?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_reviews: {
        Row: {
          id: number
          business_profile_id: number
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          business_profile_id: number
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          business_profile_id?: number
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
