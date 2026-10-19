import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { jobs as seedJobs, type Localized } from '@/data/site'
import { storyId } from '@/lib/story'

const root = () => process.env.PROJECTS_DATA_DIR || path.join(process.cwd(), 'storage')
const inboxFile = () => path.join(root(), 'inbox.json')
const appsFile = () => path.join(root(), 'applications.json')
const jobsFile = () => path.join(root(), 'jobs.json')
const cvDir = () => path.join(root(), 'cv')
const uploadsDir = () => path.join(process.cwd(), 'public', 'uploads', 'projects')

let queue: Promise<unknown> = Promise.resolve()
function withLock<T>(task: () => Promise<T>) {
  const run = queue.then(task, task)
  queue = run.then(() => undefined, () => undefined)
  return run
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function localized(value: unknown, fallback = ''): Localized {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const uz = asText(row.uz) || fallback
  return { uz, ru: asText(row.ru) || uz, en: asText(row.en) || uz }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T
  } catch {
    return fallback
  }
}

async function writeJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(value, null, 2))
}

export type InboxMessage = {
  id: string
  at: string
  read: boolean
  name: string
  company: string
  email: string
  phone: string
  message: string
  locale: string
}

export type JobApplication = {
  id: string
  at: string
  read: boolean
  name: string
  email: string
  phone: string
  position: string
  experience: string
  linkedin: string
  portfolio: string
  about: string
  locale: string
  cvName: string
  cvFile: string
}

export type StoredJob = {
  id: string
  open: boolean
  title: Localized
  type: Localized
  location: Localized
}

export type MediaFile = {
  name: string
  url: string
  size: number
  at: string
}

export function addInbox(input: Omit<InboxMessage, 'id' | 'at' | 'read'>) {
  return withLock(async () => {
    const items = await readJson<InboxMessage[]>(inboxFile(), [])
    const row: InboxMessage = { ...input, id: storyId('m'), at: new Date().toISOString(), read: false }
    items.unshift(row)
    await writeJson(inboxFile(), items.slice(0, 400))
    return row
  })
}

export function listInbox() {
  return withLock(() => readJson<InboxMessage[]>(inboxFile(), []))
}

export function markInbox(id: string, read: boolean) {
  return withLock(async () => {
    const items = await readJson<InboxMessage[]>(inboxFile(), [])
    const row = items.find(item => item.id === id)
    if (!row) return null
    row.read = read
    await writeJson(inboxFile(), items)
    return row
  })
}

export function deleteInbox(id: string) {
  return withLock(async () => {
    const items = await readJson<InboxMessage[]>(inboxFile(), [])
    const next = items.filter(item => item.id !== id)
    if (next.length === items.length) return false
    await writeJson(inboxFile(), next)
    return true
  })
}

export function addApplication(input: Omit<JobApplication, 'id' | 'at' | 'read' | 'cvFile'> & { cvFile?: string }) {
  return withLock(async () => {
    const items = await readJson<JobApplication[]>(appsFile(), [])
    const row: JobApplication = {
      ...input,
      id: storyId('a'),
      at: new Date().toISOString(),
      read: false,
      cvFile: input.cvFile || '',
    }
    items.unshift(row)
    await writeJson(appsFile(), items.slice(0, 400))
    return row
  })
}

export function setApplicationCv(id: string, cvFile: string, cvName: string) {
  return withLock(async () => {
    const items = await readJson<JobApplication[]>(appsFile(), [])
    const row = items.find(item => item.id === id)
    if (!row) return null
    row.cvFile = cvFile
    row.cvName = cvName
    await writeJson(appsFile(), items)
    return row
  })
}

export function listApplications() {
  return withLock(() => readJson<JobApplication[]>(appsFile(), []))
}

export function markApplication(id: string, read: boolean) {
  return withLock(async () => {
    const items = await readJson<JobApplication[]>(appsFile(), [])
    const row = items.find(item => item.id === id)
    if (!row) return null
    row.read = read
    await writeJson(appsFile(), items)
    return row
  })
}

export function deleteApplication(id: string) {
  return withLock(async () => {
    const items = await readJson<JobApplication[]>(appsFile(), [])
    const row = items.find(item => item.id === id)
    const next = items.filter(item => item.id !== id)
    if (next.length === items.length) return false
    await writeJson(appsFile(), next)
    if (row?.cvFile) await unlink(path.join(cvDir(), row.cvFile)).catch(() => undefined)
    return true
  })
}

export async function saveCv(id: string, file: File) {
  await mkdir(cvDir(), { recursive: true })
  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf'
  const name = `${id}.${ext}`
  await writeFile(path.join(cvDir(), name), Buffer.from(await file.arrayBuffer()))
  return name
}

export async function cvPath(fileName: string) {
  const safe = path.basename(fileName)
  if (!safe || safe !== fileName) return null
  const full = path.join(cvDir(), safe)
  try {
    await stat(full)
    return full
  } catch {
    return null
  }
}

function jobOf(value: unknown, index = 0): StoredJob | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const title = localized(row.title)
  if (!title.uz) return null
  return {
    id: asText(row.id) || storyId('j') + index,
    open: row.open !== false,
    title,
    type: localized(row.type, 'To‘liq stavka'),
    location: localized(row.location, 'Toshkent'),
  }
}

export function listJobs(openOnly = false) {
  return withLock(async () => {
    let items = (await readJson<unknown[]>(jobsFile(), [])).map(jobOf).filter((item): item is StoredJob => Boolean(item))
    if (!items.length) {
      items = seedJobs.map((job, index) => ({ id: `job-${index + 1}`, open: true, title: job.title, type: job.type, location: job.location }))
      await writeJson(jobsFile(), items)
    }
    return openOnly ? items.filter(item => item.open) : items
  })
}

export function saveJob(input: unknown, previousId?: string) {
  return withLock(async () => {
    const items = (await readJson<unknown[]>(jobsFile(), [])).map(jobOf).filter((item): item is StoredJob => Boolean(item))
    const next = jobOf(input)
    if (!next) throw new Error('Vakansiya to‘liq emas')
    const slot = previousId ? items.findIndex(item => item.id === previousId) : -1
    if (slot >= 0 && previousId) items[slot] = { ...next, id: previousId }
    else items.unshift(next)
    await writeJson(jobsFile(), items)
    return slot >= 0 ? items[slot] : next
  })
}

export function deleteJob(id: string) {
  return withLock(async () => {
    const items = (await readJson<unknown[]>(jobsFile(), [])).map(jobOf).filter((item): item is StoredJob => Boolean(item))
    const next = items.filter(item => item.id !== id)
    if (next.length === items.length) return false
    await writeJson(jobsFile(), next)
    return true
  })
}

export async function listMedia(): Promise<MediaFile[]> {
  try {
    const names = await readdir(uploadsDir())
    const rows = await Promise.all(names.map(async name => {
      if (name.startsWith('.')) return null
      const info = await stat(path.join(uploadsDir(), name)).catch(() => null)
      if (!info?.isFile()) return null
      return { name, url: `/uploads/projects/${name}`, size: info.size, at: info.mtime.toISOString() }
    }))
    return rows.filter((item): item is MediaFile => Boolean(item)).sort((a, b) => b.at.localeCompare(a.at))
  } catch {
    return []
  }
}

export async function deleteMedia(name: string) {
  const safe = path.basename(name)
  if (!safe || safe !== name) return false
  try {
    await unlink(path.join(uploadsDir(), safe))
    return true
  } catch {
    return false
  }
}

export async function adminOverview() {
  const [inbox, apps, jobs, media] = await Promise.all([listInbox(), listApplications(), listJobs(), listMedia()])
  return {
    inbox: inbox.length,
    inboxNew: inbox.filter(item => !item.read).length,
    applications: apps.length,
    applicationsNew: apps.filter(item => !item.read).length,
    jobs: jobs.length,
    jobsOpen: jobs.filter(item => item.open).length,
    media: media.length,
  }
}
