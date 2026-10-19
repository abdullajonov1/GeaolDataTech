import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { reorderProjects } from '@/lib/projects-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const body = await request.json() as { slugs?: string[] }
  if (!Array.isArray(body.slugs)) return NextResponse.json({ error: 'Noto‘g‘ri tartib' }, { status: 400 })
  return NextResponse.json(await reorderProjects(body.slugs))
}
