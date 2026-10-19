import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE = 'gdt_admin'

function secret() {
  return (process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '').replace(/\r/g, '').trim()
}

export function adminConfigured() {
  return Boolean((process.env.ADMIN_PASSWORD || '').replace(/\r/g, '').trim() && secret())
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

export function createAdminToken() {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7
  const body = Buffer.from(JSON.stringify({ exp })).toString('base64url')
  return `${body}.${sign(body)}`
}

export function readAdminToken(token: string | undefined) {
  if (!token || !secret()) return false
  const [body, mac] = token.split('.')
  if (!body || !mac) return false
  const expected = sign(body)
  const left = Buffer.from(mac)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as { exp?: number }
    return typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

export async function isAdmin() {
  const jar = await cookies()
  return readAdminToken(jar.get(COOKIE)?.value)
}

export function adminCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  }
}
