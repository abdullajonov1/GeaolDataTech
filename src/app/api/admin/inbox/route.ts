import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { deleteInbox, listInbox, markInbox } from '@/lib/admin-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  return NextResponse.json(await listInbox())
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const body = await request.json().catch(() => ({})) as { id?: string; read?: boolean }
  if (!body.id) return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
  const row = await markInbox(body.id, body.read !== false)
  if (!row) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
  const ok = await deleteInbox(id)
  if (!ok) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
