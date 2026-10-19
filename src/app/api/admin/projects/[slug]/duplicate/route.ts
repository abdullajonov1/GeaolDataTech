import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { duplicateProject } from '@/lib/projects-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const { slug } = await context.params
  const copy = await duplicateProject(slug)
  if (!copy) return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 })
  return NextResponse.json(copy)
}
