import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { deleteJob, listJobs, saveJob } from '@/lib/admin-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  return NextResponse.json(await listJobs())
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  try {
    return NextResponse.json(await saveJob(await request.json()))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Saqlab bo‘lmadi' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const body = await request.json().catch(() => ({})) as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
  try {
    return NextResponse.json(await saveJob(body, body.id))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Saqlab bo‘lmadi' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
  const ok = await deleteJob(id)
  if (!ok) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
