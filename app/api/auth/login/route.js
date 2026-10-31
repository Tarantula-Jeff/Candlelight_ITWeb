import { NextResponse } from 'next/server'

export async function POST(request) {
  const { email, password } = await request.json()
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_TOKEN || !process.env.ADMIN_EMAIL) return NextResponse.json({ message: 'Admin authentication is not configured yet. Add your values to .env.local.' }, { status: 503 })
  if (email?.trim().toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase() || password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ message: 'Incorrect email or password.' }, { status: 401 })
  const response = NextResponse.json({ message: 'Signed in.' })
  response.cookies.set('candlelight_admin', process.env.ADMIN_SESSION_TOKEN, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 })
  return response
}
