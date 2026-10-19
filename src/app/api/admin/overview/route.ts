import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { adminOverview } from '@/lib/admin-store'
import { listProjects } from '@/lib/projects-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const [stats, projects] = await Promise.all([adminOverview(), listProjects(true)])
  return NextResponse.json({
    ...stats,
    projects: projects.length,
    published: projects.filter(item => item.published).length,
  })
}
