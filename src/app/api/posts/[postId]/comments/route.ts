import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { commentSchema } from '@/lib/validations'

const COMMENT_SELECT = '*, author:users!comments_author_id_fkey(id, username, avatar_url, first_name, last_name)'

export async function GET(request: Request, { params }: { params: { postId: string } }) {
  try {
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(COMMENT_SELECT)
      .eq('post_id', params.postId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(comments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { content } = commentSchema.parse(body)

    const { data: post, error: pError } = await supabaseAdmin.from('posts').select('comment_count').eq('id', params.postId).single()
    if (pError || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({ post_id: params.postId, author_id: payload.userId, content })
      .select(COMMENT_SELECT)
      .single()

    if (error) {
      console.error('Comment insert error:', error)
      throw error
    }

    await supabaseAdmin.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', params.postId)

    return NextResponse.json(comment)
  } catch (error: unknown) {
    console.error('Comment POST error:', (error as Error).message)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
