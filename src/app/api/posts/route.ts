import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*, author:users!author_id(id, username, avatar_url, first_name, last_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json(posts || [])
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const content = formData.get('content') as string || ''
    const file = formData.get('file') as File | null

    if (!content && !file) {
      return NextResponse.json({ error: 'Post must contain text or an image' }, { status: 400 })
    }
    if (content.length > 280) {
      return NextResponse.json({ error: 'Content exceeds 280 characters' }, { status: 400 })
    }

    let imageUrl = null
    if (file && file.size > 0) {
      if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 })
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      const fileType = file.type || 'image/jpeg'
      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json({ error: 'Only JPEG, PNG and WebP are allowed' }, { status: 400 })
      }

      // Convert File to ArrayBuffer for reliable upload in Next.js
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `${payload.userId}/${Date.now()}.${ext}`

      const { data, error: uploadError } = await supabaseAdmin.storage
        .from('post-images')
        .upload(filePath, buffer, { contentType: fileType, upsert: false })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 400 })
      }

      const { data: publicData } = supabaseAdmin.storage.from('post-images').getPublicUrl(data.path)
      imageUrl = publicData.publicUrl
      console.log('Image uploaded successfully:', imageUrl)
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({ author_id: payload.userId, content, image_url: imageUrl })
      .select('*, author:users!author_id(id, username, avatar_url, first_name, last_name)')
      .single()

    if (error) throw error

    try { await supabaseAdmin.rpc('increment_post_count', { row_id: payload.userId }) } catch(e) {}

    return NextResponse.json(post)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
