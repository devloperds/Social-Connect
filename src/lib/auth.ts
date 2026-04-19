import { jwtVerify, SignJWT } from 'jose'
import type { NextRequest } from 'next/server'

const secretKey = process.env.JWT_SECRET || 'super-secret-jwt-key'
const key = new TextEncoder().encode(secretKey)

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest | Request) {
  let token = ''
  
  if ('cookies' in request) {
    const nextReq = request as NextRequest
    token = nextReq.cookies.get('token')?.value || ''
  }

  if (!token) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  if (!token) return null
  return await verifyToken(token)
}
