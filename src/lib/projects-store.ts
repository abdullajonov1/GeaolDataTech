import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { projects as seedProjects } from '@/data/site'
import { defaultLook, embedSrc, fontFaces, httpsUrl, storyId, videoSrc, type MapPoint, type SidecarPanel, type StoryBlock, type StoryForm, type StoryLook, type StoryMotion, type StoryPlay, type StoryProject, type StoryText } from '@/lib/story'

export type StoredProject = StoryProject

const filePath = () => path.join(process.env.PROJECTS_DATA_DIR || path.join(process.cwd(), 'storage'), 'projects.json')

let queue: Promise<unknown> = Promise.resolve()

function withLock<T>(task: () => Promise<T>) {
  const run = queue.then(task, task)
  queue = run.then(() => undefined, () => undefined)
  return run
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function text(value: unknown): StoryText {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const uz = asText(row.uz)
  const ru = asText(row.ru) || uz
  const en = asText(row.en) || uz
  return { uz, ru, en }
}

function hasText(value: StoryText) {
  return Boolean(value.uz || value.ru || value.en)
}

function point(value: unknown): MapPoint | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const lat = Number(row.lat)
  const lng = Number(row.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { id: asText(row.id) || storyId('p'), lat, lng, title: text(row.title), text: text(row.text) }
}

function panel(value: unknown): SidecarPanel | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const points = Array.isArray(row.points) ? row.points.map(point).filter((item): item is MapPoint => Boolean(item)) : []
  return {
    id: asText(row.id) || storyId('s'),
    heading: text(row.heading),
    body: text(row.body),
    media: row.media === 'map' ? 'map' : 'image',
    src: asText(row.src),
    points,
  }
}

function imagesOf(value: unknown) {
  return Array.isArray(value) ? value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const src = asText((item as { src?: unknown }).src)
    return src ? [{ src, caption: text((item as { caption?: unknown }).caption) }] : []
  }) : []
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, number))
}

function lookOf(value: unknown): StoryLook {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const motion = row.motion
  const background = asText(row.background)
  const font = asText(row.font)
  const motions: StoryMotion[] = ['none', 'fade', 'slide', 'left', 'rise', 'zoom', 'flip', 'bounce']
  return {
    motion: motions.includes(motion as StoryMotion) ? motion as StoryMotion : 'rise',
    dur: clamp(row.dur, 200, 3000, 600),
    play: (['none', 'count', 'type', 'words', 'blur'] as StoryPlay[]).includes(row.play as StoryPlay) ? row.play as StoryPlay : 'none',
    playDur: clamp(row.playDur, 200, 4000, 1200),
    align: row.align === 'center' || row.align === 'right' ? row.align : 'left',
    background: /^#[0-9a-fA-F]{6}$/.test(background) ? background : '',
    color: /^#[0-9a-fA-F]{6}$/.test(asText(row.color)) ? asText(row.color) : '',
    font: fontFaces.includes(font) ? font : '',
    size: clamp(row.size, 0, 96, 0),
    radius: clamp(row.radius, 0, 80, 0),
    bg: /^(https:\/\/|\/)/.test(asText(row.bg)) ? asText(row.bg) : '',
    host: /^[a-z0-9_-]{0,40}$/i.test(asText(row.host)) ? asText(row.host) : '',
    y: clamp(row.y, 0, 100, 0),
    py: clamp(row.py, 0, 4000, 0),
    z: clamp(row.z, 0, 40, 1),
    width: clamp(row.width, 8, 100, 100),
    x: Math.min(100 - clamp(row.width, 8, 100, 100), clamp(row.x, 0, 100, 0)),
    h: clamp(row.h, 0, 1600, 0),
    pad: clamp(row.pad, 0, 80, 0),
    margin: clamp(row.margin, 0, 80, 0),
    gap: clamp(row.gap, 0, 80, 12),
    flow: row.flow === 'column' ? 'column' : 'row',
    form: (['round', 'pill', 'circle', 'diamond', 'oval'] as StoryForm[]).includes(row.form as StoryForm) ? row.form as StoryForm : '',
    border: clamp(row.border, 0, 24, 0),
    line: /^#[0-9a-fA-F]{6}$/.test(asText(row.line)) ? asText(row.line) : '',
    shadow: clamp(row.shadow, 0, 48, 0),
    opacity: clamp(row.opacity, 10, 100, 100),
    rotate: clamp(row.rotate, -180, 180, 0),
  }
}

function block(value: unknown): StoryBlock | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const id = asText(row.id) || storyId()
  const look = lookOf(row.look)
  if (row.type === 'text') return { id, look, type: 'text', heading: text(row.heading), body: text(row.body) }
  if (row.type === 'image') return { id, look, type: 'image', src: asText(row.src), caption: text(row.caption) }
  if (row.type === 'gallery') return { id, look, type: 'gallery', images: imagesOf(row.images) }
  if (row.type === 'slider') return { id, look, type: 'slider', autoplay: row.autoplay !== false, every: clamp(row.every, 2, 12, 4), images: imagesOf(row.images) }
  if (row.type === 'stats') {
    const items = Array.isArray(row.items) ? row.items.flatMap(item => {
      if (!item || typeof item !== 'object') return []
      const value = asText((item as { value?: unknown }).value)
      const cell = item as { value?: unknown, label?: unknown, color?: unknown, pad?: unknown, margin?: unknown }
      const color = asText(cell.color)
      return [{ value, label: text(cell.label), color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : '', pad: clamp(cell.pad, 0, 80, 0), margin: clamp(cell.margin, 0, 80, 0) }]
    }) : []
    return { id, look, type: 'stats', items }
  }
  if (row.type === 'chart') {
    const items = Array.isArray(row.items) ? row.items.flatMap(item => {
      if (!item || typeof item !== 'object') return []
      const value = Number((item as { value?: unknown }).value)
      const color = asText((item as { color?: unknown }).color)
      if (!Number.isFinite(value)) return []
      return [{ label: text((item as { label?: unknown }).label), value, color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#0c6e9e' }]
    }) : []
    const chart = row.chart === 'line' || row.chart === 'donut' ? row.chart : 'bar'
    return { id, look, type: 'chart', chart, title: text(row.title), items }
  }
  if (row.type === 'map') {
    const points = Array.isArray(row.points) ? row.points.map(point).filter((item): item is MapPoint => Boolean(item)) : []
    return { id, look, type: 'map', points }
  }
  if (row.type === 'sidecar') {
    const panels = Array.isArray(row.panels) ? row.panels.map(panel).filter((item): item is SidecarPanel => Boolean(item)) : []
    return { id, look, type: 'sidecar', panels }
  }
  if (row.type === 'embed') return { id, look, type: 'embed', url: embedSrc(asText(row.url)), title: text(row.title) }
  if (row.type === 'quote') return { id, look, type: 'quote', text: text(row.text) }
  if (row.type === 'button') return { id, look, type: 'button', label: text(row.label), url: httpsUrl(asText(row.url)) }
  if (row.type === 'separator') return { id, look, type: 'separator' }
  if (row.type === 'video') return { id, look, type: 'video', url: videoSrc(asText(row.url)) || httpsUrl(asText(row.url)) }
  if (row.type === 'spacer') return { id, look, type: 'spacer' }
  if (row.type === 'grid') {
    const columns = row.columns === 3 || row.columns === 4 ? row.columns : 2
    const cells = Array.isArray(row.cells) ? row.cells.flatMap(item => {
      if (!item || typeof item !== 'object') return []
      const cell = item as { id?: unknown, heading?: unknown, body?: unknown, src?: unknown }
      return [{ id: asText(cell.id) || storyId('g'), heading: text(cell.heading), body: text(cell.body), src: /^(https:\/\/|\/)/.test(asText(cell.src)) ? asText(cell.src) : '' }]
    }) : []
    return { id, look, type: 'grid', columns, cells }
  }
  if (row.type === 'shape') return { id, look, type: 'shape', label: text(row.label) }
  if (row.type === 'list') {
    const items = Array.isArray(row.items) ? row.items.map(text) : []
    return { id, look, type: 'list', kind: row.kind === 'ol' ? 'ol' : 'ul', items }
  }
  if (row.type === 'table') {
    const cols = row.cols === 2 || row.cols === 4 ? row.cols : 3
    const cells = Array.isArray(row.cells) ? row.cells.map(text) : []
    return { id, look, type: 'table', cols, cells }
  }
  if (row.type === 'note') return { id, look, type: 'note', title: text(row.title), body: text(row.body) }
  return null
}

function legacyBlocks(row: Record<string, unknown>): StoryBlock[] {
  const blocks: StoryBlock[] = []
  const summary = text(row.summary)
  const features = Array.isArray(row.features) ? row.features.map(text).filter(hasText) : []
  if (hasText(summary) || features.length) {
    const body = {
      uz: [summary.uz, ...features.map(item => item.uz)].filter(Boolean).join('\n'),
      ru: [summary.ru, ...features.map(item => item.ru)].filter(Boolean).join('\n'),
      en: [summary.en, ...features.map(item => item.en)].filter(Boolean).join('\n'),
    }
    blocks.push({ id: storyId(), look: defaultLook(), type: 'text', heading: { uz: '', ru: '', en: '' }, body })
  }
  const challenge = text(row.challenge)
  if (hasText(challenge) || hasText(text(row.challengeTitle))) {
    blocks.push({ id: storyId(), look: defaultLook(), type: 'text', heading: text(row.challengeTitle), body: challenge })
  }
  const solution = text(row.solution)
  if (hasText(solution) || hasText(text(row.solutionTitle))) {
    blocks.push({ id: storyId(), look: defaultLook(), type: 'text', heading: text(row.solutionTitle), body: solution })
  }
  const images = Array.isArray(row.gallery) ? row.gallery.map(asText).filter(Boolean) : []
  if (images.length) blocks.push({ id: storyId(), look: defaultLook(), type: 'gallery', images: images.map(src => ({ src, caption: { uz: '', ru: '', en: '' } })) })
  const stats = Array.isArray(row.stats) ? row.stats.flatMap(item => {
    if (!Array.isArray(item) || item.length < 2) return []
    const value = asText(item[0])
    const label = text(item[1])
    return value ? [{ value, label, color: '', pad: 0, margin: 0 }] : []
  }) : []
  if (stats.length) blocks.push({ id: storyId(), look: defaultLook(), type: 'stats', items: stats })
  const stack = Array.isArray(row.stack) ? row.stack.map(asText).filter(Boolean) : []
  if (stack.length) {
    const line = stack.join(' · ')
    blocks.push({ id: storyId(), look: defaultLook(), type: 'text', heading: { uz: 'Texnologiyalar', ru: 'Технологии', en: 'Technology' }, body: { uz: line, ru: line, en: line } })
  }
  const flow = Array.isArray(row.flow) ? row.flow.map(text).filter(hasText) : []
  if (flow.length) {
    blocks.push({
      id: storyId(),
      look: defaultLook(),
      type: 'text',
      heading: { uz: 'Qanday ishlaydi', ru: 'Как это работает', en: 'How it works' },
      body: { uz: flow.map(item => item.uz).join('\n'), ru: flow.map(item => item.ru).join('\n'), en: flow.map(item => item.en).join('\n') },
    })
  }
  const lat = Number(row.lat)
  const lng = Number(row.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    blocks.push({ id: storyId(), look: defaultLook(), type: 'map', points: [{ id: storyId('p'), lat, lng, title: text(row.title), text: text(row.location) }] })
  }
  return blocks
}

function normalize(input: unknown): StoredProject | null {
  if (!input || typeof input !== 'object') return null
  const row = input as Record<string, unknown>
  const title = text(row.title)
  const slug = asText(row.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
  if (!slug || !title.uz) return null
  const lat = Number(row.lat)
  const lng = Number(row.lng)
  const blocks = Array.isArray(row.blocks) ? row.blocks.map(block).filter((item): item is StoryBlock => Boolean(item)) : legacyBlocks(row)
  return {
    slug,
    year: asText(row.year) || String(new Date().getFullYear()),
    title,
    location: text(row.location),
    industry: text(row.industry),
    category: asText(row.category) || 'GIS',
    result: text(row.result),
    color: /^#[0-9a-fA-F]{6}$/.test(asText(row.color)) ? asText(row.color) : '#0c3450',
    image: asText(row.image),
    client: text(row.client),
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    published: row.published !== false,
    showCover: row.showCover !== false,
    blocks,
  }
}

async function readAll() {
  try {
    const raw = await readFile(filePath(), 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return seedProjects.map(item => normalize({ ...item, published: true })!).filter(Boolean)
    const items = parsed.map(normalize).filter((item): item is StoredProject => Boolean(item))
    const stale = parsed.some(item => !item || typeof item !== 'object' || !Array.isArray((item as { blocks?: unknown }).blocks))
    if (stale) await writeAll(items)
    return items
  } catch {
    const seeded = seedProjects.map(item => normalize({ ...item, published: true })!).filter(Boolean)
    await writeAll(seeded)
    return seeded
  }
}

async function writeAll(items: StoredProject[]) {
  const file = filePath()
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(items, null, 2))
}

export function listProjects(includeHidden = false) {
  return withLock(async () => {
    const items = await readAll()
    return includeHidden ? items : items.filter(item => item.published)
  })
}

export function getProject(slug: string, includeHidden = false) {
  return withLock(async () => {
    const items = await readAll()
    return items.find(item => item.slug === slug && (includeHidden || item.published)) || null
  })
}

export function saveProject(input: unknown, previousSlug?: string) {
  return withLock(async () => {
    const items = await readAll()
    const next = normalize(input)
    if (!next) throw new Error('Loyiha ma’lumotlari to‘liq emas')
    const slot = previousSlug ? items.findIndex(item => item.slug === previousSlug) : -1
    if (items.some((item, index) => item.slug === next.slug && index !== slot)) throw new Error('Bu manzil band')
    if (slot >= 0) items[slot] = next
    else items.unshift(next)
    await writeAll(items)
    return next
  })
}

export function deleteProject(slug: string) {
  return withLock(async () => {
    const items = await readAll()
    const next = items.filter(item => item.slug !== slug)
    if (next.length === items.length) return false
    await writeAll(next)
    return true
  })
}

export function setPublished(slug: string, published: boolean) {
  return withLock(async () => {
    const items = await readAll()
    const item = items.find(row => row.slug === slug)
    if (!item) return null
    item.published = published
    await writeAll(items)
    return item
  })
}

export function duplicateProject(slug: string) {
  return withLock(async () => {
    const items = await readAll()
    const source = items.find(item => item.slug === slug)
    if (!source) return null
    const copy: StoredProject = {
      ...structuredClone(source),
      slug: `loyiha-${Date.now().toString(36)}`,
      published: false,
      title: {
        uz: `${source.title.uz} (nusxa)`,
        ru: `${source.title.ru} (копия)`,
        en: `${source.title.en} (copy)`,
      },
    }
    items.unshift(copy)
    await writeAll(items)
    return copy
  })
}

export function reorderProjects(slugs: string[]) {
  return withLock(async () => {
    const items = await readAll()
    const rank = new Map(slugs.map((slug, index) => [slug, index]))
    items.sort((a, b) => (rank.get(a.slug) ?? 999) - (rank.get(b.slug) ?? 999))
    await writeAll(items)
    return items
  })
}
