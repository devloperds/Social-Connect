import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { loginSchema } from '@/lib/validations'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = getIp(request)
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { identifier, password } = loginSchema.parse(body)

    const isEmail = identifier.includes('@')
    
    let query = supabaseAdmin.from('users').select('*')
    if (isEmail) query = query.eq('email', identifier)
    else query = query.eq('username', identifier)

    const { data: user, error } = await query.single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await supabaseAdmin.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id)

    const token = await signToken({ userId: user.id, username: user.username })
    const response = NextResponse.json({ user })
    response.cookies.set('token', token, { httpOnly: true, secure: true })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
