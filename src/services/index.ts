import { supabase } from '../lib/supabase'
import type { User, MarketplacePost, BusinessProfile, JobPost } from '../types'

export class ApiService {
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getMarketplacePosts(): Promise<MarketplacePost[]> {
    const { data, error } = await supabase
      .from('marketplace_posts')
      .select('*')
      .eq('status', 'active')
      .eq('admin_status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getBusinessProfiles(): Promise<BusinessProfile[]> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('status', 'active')
      .eq('admin_status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getJobPosts(): Promise<JobPost[]> {
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('status', 'active')
      .eq('admin_status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
