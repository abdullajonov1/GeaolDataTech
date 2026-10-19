import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { deleteMedia, listMedia } from '@/lib/admin-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  return NextResponse.json(await listMedia())
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const name = new URL(request.url).searchParams.get('name') || ''
  const ok = await deleteMedia(name)
  if (!ok) return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
