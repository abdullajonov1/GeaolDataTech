import type { Localized } from '@/data/site'

export type StoryText = Localized

export type MapPoint = {
  id: string
  lat: number
  lng: number
  title: StoryText
  text: StoryText
}

export type SidecarPanel = {
  id: string
  heading: StoryText
  body: StoryText
  media: 'image' | 'map'
  src: string
  points: MapPoint[]
}

export type StoryMotion = 'none' | 'rise' | 'fade' | 'slide' | 'left' | 'zoom' | 'flip' | 'bounce'
export type StoryPlay = 'none' | 'count' | 'type' | 'words' | 'blur'
export type StoryForm = '' | 'round' | 'pill' | 'circle' | 'diamond' | 'oval'

export type GridCell = {
  id: string
  heading: StoryText
  body: StoryText
  src: string
}

export type StoryLook = {
  motion: StoryMotion
  dur: number
  play: StoryPlay
  playDur: number
  align: 'left' | 'center' | 'right'
  background: string
  color: string
  width: number
  x: number
  h: number
  font: string
  size: number
  radius: number
  bg: string
  host: string
  y: number
  py: number
  z: number
  pad: number
  margin: number
  gap: number
  flow: 'row' | 'column'
  form: StoryForm
  border: number
  line: string
  shadow: number
  opacity: number
  rotate: number
}

export const fontFaces = ['Calibri', 'Segoe UI', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Courier New', 'Palatino Linotype', 'Impact']

export type ChartItem = { label: StoryText, value: number, color: string }

type BlockBase = { id: string, look: StoryLook }

export type StoryBlock = BlockBase & (
  | { type: 'text', heading: StoryText, body: StoryText }
  | { type: 'image', src: string, caption: StoryText }
  | { type: 'gallery', images: { src: string, caption: StoryText }[] }
  | { type: 'slider', autoplay: boolean, every: number, images: { src: string, caption: StoryText }[] }
  | { type: 'stats', items: { value: string, label: StoryText, color: string, pad: number, margin: number }[] }
  | { type: 'chart', chart: 'bar' | 'line' | 'donut', title: StoryText, items: ChartItem[] }
  | { type: 'map', points: MapPoint[] }
  | { type: 'sidecar', panels: SidecarPanel[] }
  | { type: 'embed', url: string, title: StoryText }
  | { type: 'quote', text: StoryText }
  | { type: 'button', label: StoryText, url: string }
  | { type: 'separator' }
  | { type: 'video', url: string }
  | { type: 'spacer' }
  | { type: 'grid', columns: 2 | 3 | 4, cells: GridCell[] }
  | { type: 'shape', label: StoryText }
  | { type: 'list', kind: 'ul' | 'ol', items: StoryText[] }
  | { type: 'table', cols: 2 | 3 | 4, cells: StoryText[] }
  | { type: 'note', title: StoryText, body: StoryText }
)

export type StoryProject = {
  slug: string
  year: string
  title: StoryText
  location: StoryText
  industry: StoryText
  category: string
  result: StoryText
  color: string
  image: string
  client: StoryText
  lat?: number
  lng?: number
  published: boolean
  showCover: boolean
  blocks: StoryBlock[]
}

export const emptyText = (): StoryText => ({ uz: '', ru: '', en: '' })

let sequence = 0
export function storyId(prefix = 'b') {
  sequence += 1
  return `${prefix}${Date.now().toString(36)}${sequence}`
}

export const defaultLook = (): StoryLook => ({ motion: 'rise', dur: 600, play: 'none', playDur: 1200, align: 'left', background: '', color: '', width: 100, x: 0, h: 0, font: '', size: 0, radius: 0, bg: '', host: '', y: 0, py: 0, z: 1, pad: 0, margin: 0, gap: 12, flow: 'row', form: '', border: 0, line: '', shadow: 0, opacity: 100, rotate: 0 })

let paletteDrag: StoryBlock['type'] | '' = ''
export function setPaletteDrag(type: StoryBlock['type'] | '') { paletteDrag = type }
export function getPaletteDrag() { return paletteDrag }

const chartColors = ['#0c6e9e', '#14946a', '#d0892f', '#c2414a', '#5b4db8']

export function createBlock(type: StoryBlock['type']): StoryBlock {
  const id = storyId()
  const look = defaultLook()
  if (type === 'text') return { id, look, type, heading: emptyText(), body: emptyText() }
  if (type === 'image') return { id, look, type, src: '', caption: emptyText() }
  if (type === 'gallery') return { id, look, type, images: [] }
  if (type === 'slider') return { id, look, type, autoplay: true, every: 4, images: [] }
  if (type === 'stats') return { id, look, type, items: [{ value: '', label: emptyText(), color: '', pad: 0, margin: 0 }] }
  if (type === 'chart') return { id, look, type, chart: 'bar', title: emptyText(), items: [{ label: emptyText(), value: 40, color: chartColors[0] }, { label: emptyText(), value: 70, color: chartColors[1] }] }
  if (type === 'map') return { id, look, type, points: [emptyPoint()] }
  if (type === 'embed') return { id, look, type, url: '', title: emptyText() }
  if (type === 'quote') return { id, look, type, text: emptyText() }
  if (type === 'button') return { id, look, type, label: emptyText(), url: '' }
  if (type === 'separator') return { id, look, type }
  if (type === 'video') return { id, look, type, url: '' }
  if (type === 'spacer') return { id, look: { ...look, h: 64 }, type }
  if (type === 'grid') return { id, look, type, columns: 2, cells: [emptyCell(), emptyCell()] }
  if (type === 'shape') return { id, look: { ...look, background: '#0079c1', color: '#ffffff', h: 180, width: 40, form: 'round', pad: 16 }, type, label: emptyText() }
  if (type === 'list') return { id, look, type, kind: 'ul', items: [emptyText(), emptyText()] }
  if (type === 'table') return { id, look, type, cols: 3, cells: [emptyText(), emptyText(), emptyText(), emptyText(), emptyText(), emptyText()] }
  if (type === 'note') return { id, look: { ...look, background: '#e8f4fb', pad: 18, radius: 12 }, type, title: emptyText(), body: emptyText() }
  return { id, look, type: 'sidecar', panels: [emptyPanel()] }
}

export function emptyCell(): GridCell {
  return { id: storyId('g'), heading: emptyText(), body: emptyText(), src: '' }
}

export function emptyPoint(): MapPoint {
  return { id: storyId('p'), lat: 41.3, lng: 69.24, title: emptyText(), text: emptyText() }
}

export function emptyPanel(): SidecarPanel {
  return { id: storyId('s'), heading: emptyText(), body: emptyText(), media: 'image', src: '', points: [] }
}

export function blankStory(): StoryProject {
  return {
    slug: `loyiha-${Date.now().toString(36)}`,
    year: String(new Date().getFullYear()),
    title: { uz: 'Yangi loyiha', ru: 'Новый проект', en: 'New project' },
    location: emptyText(),
    industry: emptyText(),
    category: 'GIS',
    result: emptyText(),
    color: '#0c3450',
    image: '',
    client: emptyText(),
    published: false,
    showCover: true,
    blocks: [createBlock('text')],
  }
}

export function httpsUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

export function videoSrc(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return ''
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v') || ''
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : ''
    }
    if (host === 'player.vimeo.com') return parsed.toString()
    return ''
  } catch {
    return ''
  }
}

export function embedSrc(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return ''
    const host = parsed.hostname
    if (!/(^|\.)arcgis\.com$/.test(host) && !/(^|\.)esri\.com$/.test(host)) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

export const blockLabels: Record<StoryBlock['type'], string> = {
  text: 'Matn',
  image: 'Rasm',
  gallery: 'Galereya',
  slider: 'Slayder',
  stats: 'Ko‘rsatkichlar',
  chart: 'Diagramma',
  map: 'Xarita',
  sidecar: 'Yonma-yon hikoya',
  embed: 'ArcGIS',
  quote: 'Iqtibos',
  button: 'Tugma',
  separator: 'Chiziq',
  video: 'Video',
  spacer: 'Bo‘sh joy',
  grid: 'Grid',
  shape: 'Shakl',
  list: 'Ro‘yxat',
  table: 'Jadval',
  note: 'Eslatma',
}

export const blockGroups: { title: string, items: StoryBlock['type'][] }[] = [
  { title: 'Matn', items: ['text', 'quote', 'list', 'note'] },
  { title: 'Media', items: ['image', 'gallery', 'slider', 'video'] },
  { title: 'Ma’lumot', items: ['stats', 'chart', 'map', 'table'] },
  { title: 'Sahna', items: ['shape', 'grid', 'sidecar', 'embed', 'button', 'separator', 'spacer'] },
]
