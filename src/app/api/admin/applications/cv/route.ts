import { readFile } from 'node:fs/promises'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { cvPath, listApplications } from '@/lib/admin-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id') || ''
  const row = (await listApplications()).find(item => item.id === id)
  if (!row?.cvFile) return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 })
  const file = await cvPath(row.cvFile)
  if (!file) return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 })
  const buffer = await readFile(file)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${row.cvName || row.cvFile}"`,
    },
  })
}
