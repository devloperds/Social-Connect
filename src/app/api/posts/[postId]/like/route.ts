import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: post, error: pError } = await supabaseAdmin.from('posts').select('like_count').eq('id', params.postId).single()
    if (pError || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const { error } = await supabaseAdmin.from('likes').insert({ user_id: payload.userId, post_id: params.postId })
    if (error && error.code !== '23505') throw error

    // Even if it's already liked, returning idempotent successful state is standard
    let newCount = post.like_count
    if (!error) {
       newCount += 1
       await supabaseAdmin.from('posts').update({ like_count: newCount }).eq('id', params.postId)
    }

    return NextResponse.json({ success: true, has_liked: true, like_count: newCount })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: post, error: pError } = await supabaseAdmin.from('posts').select('like_count').eq('id', params.postId).single()
    if (pError || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const { data: existingLike } = await supabaseAdmin.from('likes').select('id').match({ user_id: payload.userId, post_id: params.postId }).single()

    let newCount = post.like_count
    if (existingLike) {
      await supabaseAdmin.from('likes').delete().eq('id', existingLike.id)
      newCount = Math.max(0, newCount - 1)
      await supabaseAdmin.from('posts').update({ like_count: newCount }).eq('id', params.postId)
    }

    return NextResponse.json({ success: true, has_liked: false, like_count: newCount })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
