import { NextResponse } from 'next/server'
export async function POST() { const response = NextResponse.json({ message: 'Signed out.' }); response.cookies.set('candlelight_admin', '', { httpOnly: true, path: '/', maxAge: 0 }); return response }
