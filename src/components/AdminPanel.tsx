'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { InboxMessage, JobApplication, MediaFile, StoredJob } from '@/lib/admin-store'
import { blankStory, type StoryProject } from '@/lib/story'
import { AdminPasswordField } from './AdminPasswordField'

type Tab = 'home' | 'stories' | 'inbox' | 'apps' | 'jobs' | 'media'
type Stats = {
  projects: number
  published: number
  inbox: number
  inboxNew: number
  applications: number
  applicationsNew: number
  jobs: number
  jobsOpen: number
  media: number
}

const emptyJob = (): StoredJob => ({
  id: '',
  open: true,
  title: { uz: '', ru: '', en: '' },
  type: { uz: 'To‘liq stavka', ru: 'Полная занятость', en: 'Full-time' },
  location: { uz: 'Toshkent / Gibrid', ru: 'Ташкент / Гибрид', en: 'Tashkent / Hybrid' },
})

function when(value: string) {
  try { return new Date(value).toLocaleString('uz-UZ') } catch { return value }
}

function bytes(value: number) {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminPanel() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('home')
  const [query, setQuery] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [projects, setProjects] = useState<StoryProject[]>([])
  const [inbox, setInbox] = useState<InboxMessage[]>([])
  const [apps, setApps] = useState<JobApplication[]>([])
  const [jobs, setJobs] = useState<StoredJob[]>([])
  const [media, setMedia] = useState<MediaFile[]>([])
  const [jobForm, setJobForm] = useState<StoredJob>(emptyJob())
  const [openId, setOpenId] = useState('')

  async function load() {
    const [sessionProjects, overview, messages, applications, vacancies, files] = await Promise.all([
      fetch('/api/admin/projects'),
      fetch('/api/admin/overview'),
      fetch('/api/admin/inbox'),
      fetch('/api/admin/applications'),
      fetch('/api/admin/jobs'),
      fetch('/api/admin/media'),
    ])
    if (sessionProjects.status === 401) { setAuthed(false); return }
    setProjects(await sessionProjects.json())
    setStats(await overview.json())
    setInbox(await messages.json())
    setApps(await applications.json())
    setJobs(await vacancies.json())
    setMedia(await files.json())
    setAuthed(true)
  }

  useEffect(() => {
    fetch('/api/admin/session').then(response => response.json()).then(async data => {
      if (data.ok) await load()
      setReady(true)
    })
  }, [])

  async function login(event: FormEvent) {
    event.preventDefault()
    setError('')
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Kirib bo‘lmadi'); return }
    setPassword('')
    await load()
  }

  async function createStory() {
    const response = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blankStory()) })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Yaratib bo‘lmadi'); return }
    router.push(`/admin/stories/${data.slug}`)
  }

  async function remove(slug: string) {
    if (!confirm('Bu loyihani o‘chirasizmi?')) return
    await fetch(`/api/admin/projects/${slug}`, { method: 'DELETE' })
    await load()
  }

  async function duplicate(slug: string) {
    const response = await fetch(`/api/admin/projects/${slug}/duplicate`, { method: 'POST' })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Nusxa olinmadi'); return }
    await load()
    router.push(`/admin/stories/${data.slug}`)
  }

  async function publish(slug: string, published: boolean) {
    await fetch(`/api/admin/projects/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published }) })
    await load()
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...projects]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    setProjects(next)
    await fetch('/api/admin/projects/reorder', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slugs: next.map(project => project.slug) }) })
  }

  async function saveJob(event: FormEvent) {
    event.preventDefault()
    const method = jobForm.id ? 'PUT' : 'POST'
    const response = await fetch('/api/admin/jobs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jobForm) })
    if (!response.ok) { setError('Vakansiyani saqlab bo‘lmadi'); return }
    setJobForm(emptyJob())
    await load()
  }

  const shownProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(project => `${project.title.uz} ${project.slug} ${project.category} ${project.year}`.toLowerCase().includes(q))
  }, [projects, query])

  if (!ready) return <main className="admin-login"><p>Yuklanmoqda…</p></main>
  if (!authed) {
    return <main className="admin-login">
      <span className="admin-kicker">GEOAIDATA TECH</span>
      <h1>Boshqaruv paneli</h1>
      <p>Loyihalar, xabarlar, ish arizalari, vakansiyalar va fayllar shu yerda yig‘iladi.</p>
      <form onSubmit={login}>
        <AdminPasswordField value={password} onChange={setPassword} autoFocus/>
        {error && <div className="admin-error">{error}</div>}
        <button type="submit">Kirish</button>
      </form>
      <Link href="/uz" className="admin-link">Saytga qaytish</Link>
    </main>
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'home', label: 'Boshqaruv' },
    { id: 'stories', label: 'Loyihalar', count: projects.length },
    { id: 'inbox', label: 'Xabarlar', count: stats?.inboxNew },
    { id: 'apps', label: 'Arizalar', count: stats?.applicationsNew },
    { id: 'jobs', label: 'Vakansiyalar', count: stats?.jobsOpen },
    { id: 'media', label: 'Fayllar', count: media.length },
  ]
  const titles: Record<Tab, string> = {
    home: 'Boshqaruv',
    stories: 'Loyihalar',
    inbox: 'Xabarlar',
    apps: 'Arizalar',
    jobs: 'Vakansiyalar',
    media: 'Fayllar',
  }

  return <div className="admin-desk">
    <aside className="admin-side">
      <div className="admin-brand"><small>GEOAIDATA</small><strong>Panel</strong></div>
      <nav>{tabs.map(item => <button key={item.id} type="button" className={tab === item.id ? 'on' : ''} onClick={() => setTab(item.id)}>{item.label}{item.count ? <i>{item.count}</i> : null}</button>)}</nav>
      <div className="admin-side-foot">
        <Link href="/uz" className="ghost">Saytga qaytish</Link>
        <button type="button" className="ghost" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); setAuthed(false) }}>Chiqish</button>
      </div>
    </aside>
    <main className="admin-shell">
    <div className="admin-head">
      <div><span className="admin-kicker">PANEL</span><h1>{titles[tab]}</h1></div>
      <div className="admin-actions">
        {tab === 'stories' && <button type="button" onClick={createStory}>Yangi hikoya</button>}
        <button type="button" className="ghost" onClick={() => load()}>Yangilash</button>
      </div>
    </div>
    {error && <div className="admin-error">{error}</div>}

    {tab === 'home' && stats && <section className="admin-home">
      <div className="admin-stats">
        <button type="button" onClick={() => setTab('stories')}><b>{stats.published}/{stats.projects}</b><span>Nashr / loyiha</span></button>
        <button type="button" onClick={() => setTab('inbox')}><b>{stats.inboxNew}</b><span>Yangi xabar</span></button>
        <button type="button" onClick={() => setTab('apps')}><b>{stats.applicationsNew}</b><span>Yangi ariza</span></button>
        <button type="button" onClick={() => setTab('jobs')}><b>{stats.jobsOpen}</b><span>Ochiq vakansiya</span></button>
        <button type="button" onClick={() => setTab('media')}><b>{stats.media}</b><span>Yuklangan fayl</span></button>
      </div>
      <p className="admin-note">Saytdan kelgan xabar va arizalar shu yerda ochiladi. Hikoya nashr qilinsa, loyihalar sahifasida chiqadi.</p>
    </section>}

    {tab === 'stories' && <>
      <div className="admin-toolbar">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Loyiha qidirish"/>
      </div>
      <p className="admin-note">Har bir loyiha bloklardan yig‘iladi. Nusxa olish qoralama ochadi.</p>
      <div className="admin-list">{shownProjects.map(project => <article className="admin-row" key={project.slug}>
        <div className="admin-row-info">
          <b>{project.title.uz}</b>
          <small><em className={project.published ? 'is-on' : ''}>{project.published ? 'Nashr' : 'Qoralama'}</em> {project.blocks.length} blok · {project.category} · {project.year}</small>
        </div>
        <div className="admin-row-tools">
          <button type="button" className="ghost" onClick={() => move(projects.findIndex(item => item.slug === project.slug), -1)}>Yuqoriga</button>
          <button type="button" className="ghost" onClick={() => move(projects.findIndex(item => item.slug === project.slug), 1)}>Pastga</button>
          <button type="button" className="ghost" onClick={() => publish(project.slug, !project.published)}>{project.published ? 'Yashirish' : 'Nashr'}</button>
          <button type="button" className="ghost" onClick={() => duplicate(project.slug)}>Nusxa</button>
          <button type="button" onClick={() => router.push(`/admin/stories/${project.slug}`)}>Ochish</button>
          <button type="button" className="warn" onClick={() => remove(project.slug)}>O‘chirish</button>
        </div>
      </article>)}</div>
    </>}

    {tab === 'inbox' && <div className="admin-list">{inbox.length === 0 && <p className="admin-note">Hozircha xabar yo‘q.</p>}{inbox.map(item => <article className={item.read ? 'admin-row' : 'admin-row is-new'} key={item.id}>
      <div className="admin-row-info">
        <b>{item.name}{item.company ? ` · ${item.company}` : ''}</b>
        <small>{when(item.at)} · {item.email} · {item.phone}</small>
        {(openId === item.id) && <p className="admin-body">{item.message}</p>}
      </div>
      <div className="admin-row-tools">
        <button type="button" className="ghost" onClick={() => setOpenId(openId === item.id ? '' : item.id)}>{openId === item.id ? 'Yopish' : 'O‘qish'}</button>
        <button type="button" className="ghost" onClick={async () => { await fetch('/api/admin/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, read: !item.read }) }); await load() }}>{item.read ? 'O‘qilmagan' : 'O‘qildi'}</button>
        <a className="admin-link" href={`mailto:${item.email}`}>Javob</a>
        <button type="button" className="warn" onClick={async () => { if (!confirm('Xabarni o‘chirasizmi?')) return; await fetch(`/api/admin/inbox?id=${item.id}`, { method: 'DELETE' }); await load() }}>O‘chirish</button>
      </div>
    </article>)}</div>}

    {tab === 'apps' && <div className="admin-list">{apps.length === 0 && <p className="admin-note">Hozircha ariza yo‘q.</p>}{apps.map(item => <article className={item.read ? 'admin-row' : 'admin-row is-new'} key={item.id}>
      <div className="admin-row-info">
        <b>{item.name} · {item.position}</b>
        <small>{when(item.at)} · {item.email} · {item.phone}{item.experience ? ` · ${item.experience} yil` : ''}</small>
        {(openId === item.id) && <p className="admin-body">{item.about}{item.linkedin ? `\nLinkedIn: ${item.linkedin}` : ''}{item.portfolio ? `\nPortfolio: ${item.portfolio}` : ''}</p>}
      </div>
      <div className="admin-row-tools">
        <button type="button" className="ghost" onClick={() => setOpenId(openId === item.id ? '' : item.id)}>{openId === item.id ? 'Yopish' : 'O‘qish'}</button>
        <a className="admin-link" href={`/api/admin/applications/cv?id=${item.id}`}>CV</a>
        <button type="button" className="ghost" onClick={async () => { await fetch('/api/admin/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, read: !item.read }) }); await load() }}>{item.read ? 'O‘qilmagan' : 'O‘qildi'}</button>
        <button type="button" className="warn" onClick={async () => { if (!confirm('Arizani o‘chirasizmi?')) return; await fetch(`/api/admin/applications?id=${item.id}`, { method: 'DELETE' }); await load() }}>O‘chirish</button>
      </div>
    </article>)}</div>}

    {tab === 'jobs' && <section>
      <form className="admin-job" onSubmit={saveJob}>
        <div className="admin-grid">
          <label>Nomi (UZ)<input value={jobForm.title.uz} onChange={event => setJobForm({ ...jobForm, title: { ...jobForm.title, uz: event.target.value } })} required/></label>
          <label>Nomi (RU)<input value={jobForm.title.ru} onChange={event => setJobForm({ ...jobForm, title: { ...jobForm.title, ru: event.target.value } })}/></label>
          <label>Nomi (EN)<input value={jobForm.title.en} onChange={event => setJobForm({ ...jobForm, title: { ...jobForm.title, en: event.target.value } })}/></label>
          <label>Tur (UZ)<input value={jobForm.type.uz} onChange={event => setJobForm({ ...jobForm, type: { ...jobForm.type, uz: event.target.value } })}/></label>
          <label>Manzil (UZ)<input value={jobForm.location.uz} onChange={event => setJobForm({ ...jobForm, location: { ...jobForm.location, uz: event.target.value } })}/></label>
          <label className="admin-check"><input type="checkbox" checked={jobForm.open} onChange={event => setJobForm({ ...jobForm, open: event.target.checked })}/>Saytda ochiq</label>
        </div>
        <div className="admin-actions">
          <button type="submit">{jobForm.id ? 'Vakansiyani saqlash' : 'Vakansiya qo‘shish'}</button>
          {jobForm.id && <button type="button" className="ghost" onClick={() => setJobForm(emptyJob())}>Bekor</button>}
        </div>
      </form>
      <div className="admin-list">{jobs.map(job => <article className="admin-row" key={job.id}>
        <div className="admin-row-info">
          <b>{job.title.uz}</b>
          <small><em className={job.open ? 'is-on' : ''}>{job.open ? 'Ochiq' : 'Yopiq'}</em> {job.type.uz} · {job.location.uz}</small>
        </div>
        <div className="admin-row-tools">
          <button type="button" className="ghost" onClick={() => setJobForm(job)}>Tahrir</button>
          <button type="button" className="warn" onClick={async () => { if (!confirm('Vakansiyani o‘chirasizmi?')) return; await fetch(`/api/admin/jobs?id=${job.id}`, { method: 'DELETE' }); await load() }}>O‘chirish</button>
        </div>
      </article>)}</div>
    </section>}

    {tab === 'media' && <div className="admin-preview">{media.length === 0 && <p className="admin-note">Hikoyalarga yuklangan rasm yo‘q.</p>}{media.map(file => <figure key={file.name}>
      <img src={file.url} alt=""/>
      <figcaption>{bytes(file.size)} · {when(file.at)}</figcaption>
      <button type="button" className="warn" onClick={async () => { if (!confirm('Faylni o‘chirasizmi?')) return; await fetch(`/api/admin/media?name=${encodeURIComponent(file.name)}`, { method: 'DELETE' }); await load() }}>O‘chirish</button>
    </figure>)}</div>}
  </main>
  </div>
}
