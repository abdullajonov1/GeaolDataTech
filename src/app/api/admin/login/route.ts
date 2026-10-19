import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { adminConfigured, adminCookie, createAdminToken } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'Admin paroli sozlanmagan' }, { status: 500 })
  }
  let password = ''
  try {
    const body = await request.json() as { password?: string }
    password = body.password || ''
  } catch {
    return NextResponse.json({ error: 'Noto‘g‘ri so‘rov' }, { status: 400 })
  }
  const expected = process.env.ADMIN_PASSWORD || ''
  const left = Buffer.from(password)
  const right = Buffer.from(expected)
  const matches = left.length === right.length && timingSafeEqual(left, right)
  if (!matches) return NextResponse.json({ error: 'Parol noto‘g‘ri' }, { status: 401 })
  const cookie = adminCookie(createAdminToken())
  const response = NextResponse.json({ ok: true })
  response.cookies.set(cookie.name, cookie.value, cookie.options)
  return response
}
