import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { listProjects, saveProject } from '@/lib/projects-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function guard() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  return null
}

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  return NextResponse.json(await listProjects(true))
}

export async function POST(request: Request) {
  const denied = await guard()
  if (denied) return denied
  try {
    const project = await saveProject(await request.json())
    return NextResponse.json(project)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Saqlab bo‘lmadi'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
