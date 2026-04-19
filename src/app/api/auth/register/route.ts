import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { registerSchema } from '@/lib/validations'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = getIp(request)
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many registration attempts, please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, username, password, firstName, lastName } = registerSchema.parse(body)

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const token = await signToken({ userId: user.id, username: user.username })
    const response = NextResponse.json({ user })
    response.cookies.set('token', token, { httpOnly: true, secure: true })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
