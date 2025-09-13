import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    if (!rateLimit(clientIP, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: totalJobs },
      { count: totalBusinesses },
      { count: newUsersThisMonth },
      { count: newPostsThisMonth },
      { data: recentActions }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('marketplace_posts').select('*', { count: 'exact', head: true }),
      supabase.from('job_posts').select('*', { count: 'exact', head: true }),
      supabase.from('business_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('marketplace_posts').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('admin_actions').select(`
        *,
        users (
          full_name,
          email
        )
      `).order('created_at', { ascending: false }).limit(10)
    ])

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalPosts: totalPosts || 0,
      totalJobs: totalJobs || 0,
      totalBusinesses: totalBusinesses || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      newPostsThisMonth: newPostsThisMonth || 0,
      recentActions: recentActions || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
