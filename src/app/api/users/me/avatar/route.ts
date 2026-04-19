import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 })
    }
    
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      return NextResponse.json({ error: 'Only JPEG and PNG are allowed' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(`${payload.userId}/avatar-${Date.now()}.jpg`, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(data.path)
    const newAvatarUrl = publicUrlData.publicUrl

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', payload.userId)

    if (updateError) throw updateError

    return NextResponse.json({ avatar_url: newAvatarUrl })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
