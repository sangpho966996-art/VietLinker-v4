import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
      return NextResponse.redirect(new URL('/login?error=admin_not_configured', request.url))
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          },
          remove(name: string, options: any) {
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
              expires: new Date(0),
            })
          },
        },
      }
    )

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Middleware auth check:', { user: user?.email, authError })
      
      if (!user) {
        console.log('No user found in middleware, redirecting to login')
        return NextResponse.redirect(new URL('/login?returnUrl=' + encodeURIComponent(request.nextUrl.pathname), request.url))
      }

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('Middleware DB check:', { userData, dbError })

      if (!userData || userData.role !== 'admin') {
        console.log('User not admin or not found:', { userData })
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      console.log('Admin access granted for:', user.email)
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.redirect(new URL('/login?error=admin_check_failed', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*']
}
