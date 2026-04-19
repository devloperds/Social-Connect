import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('follows')
      .select('following_id, following:users!follows_following_id_fkey(id, username, first_name, last_name, avatar_url, bio)')
      .eq('follower_id', params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Flatten to just user objects
    const following = data.map(item => item.following)

    return NextResponse.json(following)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
