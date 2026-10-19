import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'

const types: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Rasm tanlanmagan' }, { status: 400 })
  const ext = types[file.type]
  if (!ext) return NextResponse.json({ error: 'Faqat JPG, PNG yoki WebP' }, { status: 400 })
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: 'Rasm 6 MB dan katta' }, { status: 400 })
  const dir = path.join(process.cwd(), 'public', 'uploads', 'projects')
  await mkdir(dir, { recursive: true })
  const name = `${randomUUID()}.${ext}`
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
  return NextResponse.json({ url: `/uploads/projects/${name}` })
}
