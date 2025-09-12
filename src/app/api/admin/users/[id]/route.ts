import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { role } = body
    const resolvedParams = await params
    const userId = resolvedParams.id

    console.log('PATCH /api/admin/users/[id] - Received body:', body)
    console.log('PATCH /api/admin/users/[id] - Role value:', role, 'Type:', typeof role)

    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      console.log('PATCH /api/admin/users/[id] - Invalid role rejected:', role)
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in user update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
