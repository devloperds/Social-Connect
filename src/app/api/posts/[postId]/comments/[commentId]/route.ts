import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest, { params }: { params: { postId: string, commentId: string } }) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: comment, error: fetchError } = await supabaseAdmin.from('comments').select('author_id').eq('id', params.commentId).single()
    if (fetchError || !comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    if (comment.author_id !== payload.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabaseAdmin.from('comments').delete().eq('id', params.commentId)
    if (error) throw error

    const { data: post } = await supabaseAdmin.from('posts').select('comment_count').eq('id', params.postId).single()
    if (post) {
      await supabaseAdmin.from('posts').update({ comment_count: Math.max(0, post.comment_count - 1) }).eq('id', params.postId)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
