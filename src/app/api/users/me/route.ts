import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { profileSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, created_at')
      .eq('id', payload.userId)
      .single()

    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validData = profileSchema.parse(body)

    const updatePayload: any = {}
    if (validData.bio !== undefined) updatePayload.bio = validData.bio
    if (validData.website !== undefined) updatePayload.website = validData.website
    if (validData.location !== undefined) updatePayload.location = validData.location

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', payload.userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
