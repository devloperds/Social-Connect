import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let authorIds: string[] = []

    if (payload && payload.userId) {
      const { data: follows } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', payload.userId)

      if (follows && follows.length > 0) {
        authorIds = follows.map(f => f.following_id)
        authorIds.push(payload.userId as string) // Typically people want to see their own posts too
      }
    }

    let query = supabaseAdmin
      .from('posts')
      .select('*, author:users!author_id(id, username, avatar_url, first_name, last_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (authorIds.length > 0) {
      query = query.in('author_id', authorIds)
    }

    const { data: posts, error } = await query

    if (error) throw error

    return NextResponse.json(posts || [])
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
