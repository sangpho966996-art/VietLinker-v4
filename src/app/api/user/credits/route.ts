import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user credits:', error)
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
    }

    return NextResponse.json({ credits: data?.credits || 0 })
  } catch (error) {
    console.error('Error in user credits API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
