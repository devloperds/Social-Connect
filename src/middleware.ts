import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  const pathname = request.nextUrl.pathname
  const isAuthApi = pathname.startsWith('/api/auth')
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Protect backend API routes
  if (isApiRoute && !isAuthApi) {
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  // Protect frontend pages
  if (!isApiRoute) {
    // If no valid token and trying to access a secure page (not auth, not root)
    if (!token && !isAuthPage && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token) {
      const payload = await verifyToken(token)
      if (!payload && !isAuthPage && pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      if (payload && isAuthPage) {
        return NextResponse.redirect(new URL('/feed', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
