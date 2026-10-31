import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('candlelight_admin')?.value
  if (token && process.env.ADMIN_SESSION_TOKEN && token === process.env.ADMIN_SESSION_TOKEN) return NextResponse.next()
  const login = new URL('/login', request.url)
  login.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(login)
}

export const config = { matcher: ['/admin/:path*'] }
