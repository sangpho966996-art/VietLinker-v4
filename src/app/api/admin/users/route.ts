import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search') || ''
    const roleFilter = searchParams.get('role') || 'all'

    let query = supabase
      .from('users')
      .select('id, email, full_name, phone, credits, role, created_at')
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    }

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
