import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
      }

      if (data.session) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_exception`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
