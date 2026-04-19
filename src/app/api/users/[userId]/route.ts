import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    let selectFields = 'id, username, first_name, last_name, bio, avatar_url, website, location, posts_count, created_at'
    
    const authUser = await getAuthUser(request)
    if (authUser && authUser.userId === params.userId) {
      selectFields += ', email'
    }

    const userPromise = supabaseAdmin.from('users').select(selectFields).eq('id', params.userId).single()
    const followersPromise = supabaseAdmin.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', params.userId)
    const followingPromise = supabaseAdmin.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', params.userId)
    
    let isFollowingPromise = Promise.resolve({ count: 0 })
    if (authUser) {
      isFollowingPromise = supabaseAdmin.from('follows').select('*', { count: 'exact', head: true }).match({ follower_id: authUser.userId, following_id: params.userId }) as any
    }

    const [userRes, followersRes, followingRes, isFollowingRes] = await Promise.all([userPromise, followersPromise, followingPromise, isFollowingPromise])

    if (userRes.error || !userRes.data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const user = {
      ...(userRes.data as Record<string, any>),
      followers_count: followersRes.count || 0,
      following_count: followingRes.count || 0,
      is_following: (isFollowingRes.count || 0) > 0
    }

    return NextResponse.json(user)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
