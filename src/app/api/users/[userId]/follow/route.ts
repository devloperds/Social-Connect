import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (payload.userId === params.userId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

    const { error } = await supabaseAdmin.from('follows').insert({ follower_id: payload.userId, following_id: params.userId })
    if (error && error.code !== '23505') throw error // Ignore unique constraint violation (already followed)

    return NextResponse.json({ success: true, is_following: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin.from('follows').delete().match({ follower_id: payload.userId, following_id: params.userId })
    if (error) throw error

    return NextResponse.json({ success: true, is_following: false })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
