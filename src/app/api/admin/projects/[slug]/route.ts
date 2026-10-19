import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { deleteProject, getProject, saveProject, setPublished } from '@/lib/projects-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const { slug } = await context.params
  const project = await getProject(slug, true)
  if (!project) return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const { slug } = await context.params
  try {
    const project = await saveProject(await request.json(), slug)
    return NextResponse.json(project)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Saqlab bo‘lmadi'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const { slug } = await context.params
  const body = await request.json().catch(() => ({})) as { published?: boolean }
  if (typeof body.published !== 'boolean') return NextResponse.json({ error: 'Nashr holati kerak' }, { status: 400 })
  const project = await setPublished(slug, body.published)
  if (!project) return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 })
  return NextResponse.json(project)
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const { slug } = await context.params
  const removed = await deleteProject(slug)
  if (!removed) return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
