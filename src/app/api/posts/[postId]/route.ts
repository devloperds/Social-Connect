import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*, author:users!author_id(id, username, avatar_url, first_name, last_name)')
      .eq('id', params.postId)
      .eq('is_active', true)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await request.json()
    if (!content || content.length > 280) return NextResponse.json({ error: 'Invalid content' }, { status: 400 })

    const { data: currentPost, error: fetchError } = await supabaseAdmin.from('posts').select('author_id').eq('id', params.postId).single()
    if (fetchError || !currentPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (currentPost.author_id !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: updatedPost, error } = await supabaseAdmin
      .from('posts')
      .update({ content })
      .eq('id', params.postId)
      .select('*, author:users!author_id(id, username, avatar_url, first_name, last_name)')
      .single()

    if (error) throw error
    return NextResponse.json(updatedPost)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: currentPost, error: fetchError } = await supabaseAdmin.from('posts').select('author_id').eq('id', params.postId).single()
    if (fetchError || !currentPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (currentPost.author_id !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabaseAdmin
      .from('posts')
      .update({ is_active: false })
      .eq('id', params.postId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
