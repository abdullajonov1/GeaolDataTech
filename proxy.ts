import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from './src/lib/i18n'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next()
  const hasLocale = locales.some(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
  if (hasLocale) {
    const response = NextResponse.next()
    const locale = pathname.split('/')[1]
    response.cookies.set('gdt-locale', locale, { maxAge: 31536000, sameSite: 'lax' })
    return response
  }
  const saved = request.cookies.get('gdt-locale')?.value
  const browser = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale = locales.includes(saved as never) ? saved : locales.includes(browser as never) ? browser : defaultLocale
  const destination = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
  return NextResponse.redirect(new URL(destination, request.url))
}

export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
