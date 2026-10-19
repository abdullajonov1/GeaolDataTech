'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { blockGroups, blockLabels, createBlock, emptyCell, emptyPanel, emptyPoint, emptyText, fontFaces, setPaletteDrag, storyId, type StoryBlock, type StoryForm, type StoryMotion, type StoryPlay, type StoryProject, type StoryText } from '@/lib/story'
import type { Locale } from '@/lib/i18n'
import { StoryView, type StoryEdit } from './StoryView'
import { AdminPasswordField } from './AdminPasswordField'

function localized(value: StoryText, lang: Locale, next: string): StoryText {
  return { ...value, [lang]: next }
}

function applyText(story: StoryProject, path: string, value: string, lang: Locale): StoryProject {
  const [head, id, field, extra, sub] = path.split('.')
  if (head === 'category' || head === 'year') return { ...story, [head]: value }
  if (head === 'title' || head === 'result' || head === 'client' || head === 'industry' || head === 'location') return { ...story, [head]: localized(story[head], lang, value) }
  if (head !== 'blocks' || !id) return story
  return { ...story, blocks: story.blocks.map(block => block.id === id ? patchBlock(block, field, extra, sub, value, lang) : block) }
}

function patchBlock(block: StoryBlock, field: string | undefined, extra: string | undefined, sub: string | undefined, value: string, lang: Locale): StoryBlock {
  const text = (current: StoryText) => localized(current, lang, value)
  if (block.type === 'text' && field === 'heading') return { ...block, heading: text(block.heading) }
  if (block.type === 'text' && field === 'body') return { ...block, body: text(block.body) }
  if (block.type === 'image' && field === 'caption') return { ...block, caption: text(block.caption) }
  if ((block.type === 'gallery' || block.type === 'slider') && field === 'images' && extra !== undefined && sub === 'caption') {
    const index = Number(extra)
    return { ...block, images: block.images.map((image, imageIndex) => imageIndex === index ? { ...image, caption: text(image.caption) } : image) }
  }
  if (block.type === 'stats' && field === 'items' && extra !== undefined) {
    const index = Number(extra)
    return { ...block, items: block.items.map((item, itemIndex) => itemIndex !== index ? item : sub === 'value' ? { ...item, value } : { ...item, label: text(item.label) }) }
  }
  if (block.type === 'chart' && field === 'title') return { ...block, title: text(block.title) }
  if (block.type === 'chart' && field === 'items' && extra !== undefined) {
    const index = Number(extra)
    return { ...block, items: block.items.map((item, itemIndex) => itemIndex !== index ? item : sub === 'value' ? { ...item, value: Number(value.replace(',', '.')) || 0 } : { ...item, label: text(item.label) }) }
  }
  if (block.type === 'map' && field === 'points' && extra) return { ...block, points: block.points.map(point => point.id !== extra ? point : sub === 'text' ? { ...point, text: text(point.text) } : { ...point, title: text(point.title) }) }
  if (block.type === 'sidecar' && field === 'panels' && extra) return { ...block, panels: block.panels.map(panel => panel.id !== extra ? panel : sub === 'body' ? { ...panel, body: text(panel.body) } : { ...panel, heading: text(panel.heading) }) }
  if (block.type === 'embed' && field === 'title') return { ...block, title: text(block.title) }
  if (block.type === 'quote' && field === 'text') return { ...block, text: text(block.text) }
  if (block.type === 'button' && field === 'label') return { ...block, label: text(block.label) }
  if (block.type === 'shape' && field === 'label') return { ...block, label: text(block.label) }
  if (block.type === 'note' && field === 'title') return { ...block, title: text(block.title) }
  if (block.type === 'note' && field === 'body') return { ...block, body: text(block.body) }
  if (block.type === 'list' && field === 'items' && extra !== undefined) {
    const index = Number(extra)
    const items = [...block.items]
    while (items.length <= index) items.push(emptyText())
    items[index] = text(items[index])
    return { ...block, items }
  }
  if (block.type === 'table' && field === 'cells' && extra !== undefined) {
    const index = Number(extra)
    const cells = [...block.cells]
    while (cells.length <= index) cells.push(emptyText())
    cells[index] = text(cells[index])
    return { ...block, cells }
  }
  if (block.type === 'grid' && field === 'cells' && extra !== undefined) {
    const index = Number(extra)
    return { ...block, cells: block.cells.map((cell, cellIndex) => cellIndex !== index ? cell : sub === 'body' ? { ...cell, body: text(cell.body) } : { ...cell, heading: text(cell.heading) }) }
  }
  return block
}

function applyFile(story: StoryProject, path: string, url: string): StoryProject {
  if (path === 'image') return { ...story, image: url }
  const [, id, field, extra] = path.split('.')
  return { ...story, blocks: story.blocks.map(block => {
    if (block.id !== id) return block
    if (block.type === 'image' && field === 'src') return { ...block, src: url }
    if ((block.type === 'gallery' || block.type === 'slider') && field === 'images' && extra === 'add') return { ...block, images: [...block.images, { src: url, caption: emptyText() }] }
    if ((block.type === 'gallery' || block.type === 'slider') && field === 'images' && extra !== undefined) {
      const index = Number(extra)
      return { ...block, images: block.images.map((image, imageIndex) => imageIndex === index ? { ...image, src: url } : image) }
    }
    if (block.type === 'sidecar' && field === 'panels' && extra) return { ...block, panels: block.panels.map(panel => panel.id === extra ? { ...panel, src: url } : panel) }
    if (block.type === 'grid' && field === 'cells' && extra !== undefined) {
      const index = Number(extra)
      return { ...block, cells: block.cells.map((cell, cellIndex) => cellIndex === index ? { ...cell, src: url } : cell) }
    }
    if (field === 'bg') return { ...block, look: { ...block.look, bg: url } }
    return block
  }) }
}

const langs: Locale[] = ['uz', 'ru', 'en']

function BlockIcon({ type }: { type: StoryBlock['type'] }) {
  const pen = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'text') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M6 7h12M6 12h12M6 17h7"/></svg>
  if (type === 'quote') return <svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="18" textAnchor="middle" fill="currentColor" fontSize="20" fontFamily="Georgia, serif">“</text></svg>
  if (type === 'image') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="3.5" y="5" width="17" height="14" rx="2"/><circle {...pen} cx="8.5" cy="9.5" r="1.3"/><path {...pen} d="m6.5 16.2 3.6-3.2 2.4 2 2.2-1.6 3 2.8"/></svg>
  if (type === 'gallery') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4"/><rect {...pen} x="13" y="3.5" width="7.5" height="7.5" rx="1.4"/><rect {...pen} x="3.5" y="13" width="7.5" height="7.5" rx="1.4"/><rect {...pen} x="13" y="13" width="7.5" height="7.5" rx="1.4"/></svg>
  if (type === 'slider') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="7" y="4" width="12" height="14" rx="1.6"/><path {...pen} d="M5 7.2h8.5A1.5 1.5 0 0 1 15 8.7V19"/></svg>
  if (type === 'video') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="3" y="5.5" width="18" height="13" rx="2"/><path fill="currentColor" d="M10 9.2v5.6l5-2.8z"/></svg>
  if (type === 'stats') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M4 19h16"/><path {...pen} d="M7 19V11M12 19V6M17 19v-5"/></svg>
  if (type === 'chart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M4 16.5 8.2 12l3 2.4L16 8.5l4 3"/><circle fill="currentColor" cx="8.2" cy="12" r="1.15"/><circle fill="currentColor" cx="11.2" cy="14.4" r="1.15"/><circle fill="currentColor" cx="16" cy="8.5" r="1.15"/></svg>
  if (type === 'map') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M12 20.5s5.5-4.7 5.5-9.2a5.5 5.5 0 0 0-11 0c0 4.5 5.5 9.2 5.5 9.2z"/><circle {...pen} cx="12" cy="11.2" r="1.8"/></svg>
  if (type === 'sidecar') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="3" y="5" width="8" height="14" rx="1.4"/><rect {...pen} x="13" y="5" width="8" height="14" rx="1.4"/></svg>
  if (type === 'embed') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle {...pen} cx="12" cy="12" r="7.5"/><path {...pen} d="M4.5 12h15M12 4.6c2 2.2 3 4.7 3 7.4s-1 5.2-3 7.4c-2-2.2-3-4.7-3-7.4s1-5.2 3-7.4z"/></svg>
  if (type === 'button') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="3" y="8" width="18" height="8" rx="4"/></svg>
  if (type === 'separator') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M4 12h16"/></svg>
  if (type === 'grid') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="4" y="4" width="16" height="16" rx="1.5"/><path {...pen} d="M12 4v16M4 12h16"/></svg>
  if (type === 'shape') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="4" y="5" width="16" height="14" rx="6"/></svg>
  if (type === 'list') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle fill="currentColor" cx="6" cy="7" r="1.2"/><circle fill="currentColor" cx="6" cy="12" r="1.2"/><circle fill="currentColor" cx="6" cy="17" r="1.2"/><path {...pen} d="M10 7h10M10 12h10M10 17h7"/></svg>
  if (type === 'table') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...pen} x="3.5" y="5" width="17" height="14" rx="1.4"/><path {...pen} d="M3.5 10h17M3.5 15h17M9.5 5v14M14.5 5v14"/></svg>
  if (type === 'note') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M6 5h9l4 4v10H6z"/><path {...pen} d="M15 5v4h4M8 13h8M8 17h5"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...pen} d="M12 5v14M8 8.5 12 5l4 3.5M8 15.5 12 19l4-3.5"/></svg>
}

function FieldPick({ value, options, disabled, onChange }: { value: string, options: { value: string, label: string }[], disabled?: boolean, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [box, setBox] = useState({ top: 0, left: 0, width: 0 })
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  const current = options.find(item => item.value === value)
  return <div className={'field-pick' + (open ? ' is-open' : '')} ref={root}>
    <button type="button" disabled={disabled} aria-expanded={open} onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect()
      setBox({ top: rect.bottom + 4, left: rect.left, width: rect.width })
      setOpen(state => !state)
    }}>
      <span>{current?.label}</span>
      <i aria-hidden="true"/>
    </button>
    {open && <ul role="listbox" style={{ top: box.top, left: box.left, width: box.width }}>
      {options.map(item => <li key={item.value}><button type="button" role="option" aria-selected={item.value === value} className={item.value === value ? 'on' : ''} onClick={() => { onChange(item.value); setOpen(false) }}>{item.label}</button></li>)}
    </ul>}
  </div>
}

async function sendFile(file: File) {
  const body = new FormData()
  body.set('file', file)
  const response = await fetch('/api/admin/upload', { method: 'POST', body })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Rasm yuklanmadi')
  return data.url as string
}

export function StoryEditor({ slug }: { slug: string }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [story, setStory] = useState<StoryProject | null>(null)
  const [selected, setSelected] = useState<string>('cover')
  const [part, setPart] = useState<number | null>(null)
  const [lang, setLang] = useState<Locale>('uz')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [hintIndex, setHintIndex] = useState<number | null>(null)
  const [ghost, setGhost] = useState<{ x: number, y: number, label: string } | null>(null)
  const outlineId = useRef('')

  async function load() {
    const response = await fetch(`/api/admin/projects/${slug}`)
    if (response.status === 401) { setAuthed(false); return }
    if (!response.ok) { setError('Loyiha topilmadi'); return }
    setStory(await response.json())
    setAuthed(true)
  }

  useEffect(() => {
    fetch('/api/admin/session').then(response => response.json()).then(async data => {
      if (data.ok) await load()
      setReady(true)
    })
  }, [slug])

  async function login(event: FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Kirib bo‘lmadi'); return }
    setError('')
    await load()
  }

  function updateBlock(id: string, next: StoryBlock) {
    setStory(current => current ? { ...current, blocks: current.blocks.map(block => block.id === id ? next : block) } : current)
  }

  async function save(published = story?.published) {
    if (!story) return
    setBusy(true)
    setError('')
    setNotice('')
    const payload = { ...story, published: published ?? story.published }
    const response = await fetch(`/api/admin/projects/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json()
    setBusy(false)
    if (!response.ok) { setError(data.error || 'Saqlab bo‘lmadi'); return }
    setStory(data)
    setNotice(data.published ? 'Nashr qilindi' : 'Qoralama saqlandi')
    if (data.slug !== slug) router.replace(`/admin/stories/${data.slug}`)
  }

  function insert(type: StoryBlock['type']) {
    const block = createBlock(type)
    block.look.flow = 'column'
    setStory(current => current ? { ...current, blocks: [...current.blocks, block] } : current)
    setSelected(block.id)
  }

  const edit = useMemo<StoryEdit>(() => ({
    onText: (path, value) => setStory(current => current ? applyText(current, path, value, lang) : current),
    onFile: async (path, file) => {
      try {
        const url = await sendFile(file)
        setStory(current => current ? applyFile(current, path, url) : current)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Rasm yuklanmadi')
      }
    },
    onLook: (id, patch) => setStory(current => current ? { ...current, blocks: current.blocks.map(block => block.id === id ? { ...block, look: { ...block.look, ...patch, x: Math.min(100 - (patch.width ?? block.look.width), Math.max(0, patch.x ?? block.look.x)) } } : block) } : current),
    onReorder: (id, toIndex) => setStory(current => {
      if (!current) return current
      const moving = current.blocks.find(block => block.id === id)
      if (!moving) return current
      const rest = current.blocks.filter(block => block.id !== id)
      const flow = rest.filter(block => !block.look.host || (block.look.host !== 'cover' && !rest.some(item => item.id === block.look.host)))
      const before = flow[Math.max(0, Math.min(flow.length, toIndex))]
      if (!before) return { ...current, blocks: [...rest, moving] }
      const blocks = [...rest]
      blocks.splice(rest.findIndex(block => block.id === before.id), 0, moving)
      return { ...current, blocks }
    }),
    onInsert: (type, index) => {
      const block = createBlock(type)
      setStory(current => {
        if (!current) return current
        const blocks = [...current.blocks]
        blocks.splice(Math.max(0, Math.min(blocks.length, index)), 0, block)
        return { ...current, blocks }
      })
      setSelected(block.id)
      setPaletteDrag('')
    },
    onRemove: id => {
      if (id === 'cover') {
        setStory(current => current ? { ...current, showCover: false } : current)
        return
      }
      setStory(current => current ? { ...current, blocks: current.blocks.filter(block => block.id !== id) } : current)
      setSelected('cover')
    },
    onDuplicate: id => {
      const copyId = storyId()
      setStory(current => {
        if (!current) return current
        const index = current.blocks.findIndex(block => block.id === id)
        if (index < 0) return current
        const copy = { ...structuredClone(current.blocks[index]), id: copyId }
        const blocks = [...current.blocks]
        blocks.splice(index + 1, 0, copy)
        return { ...current, blocks }
      })
      setSelected(copyId)
      setPart(null)
    },
    onPart: (id, index) => {
      setSelected(id)
      setPart(index)
    },
  }), [lang])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      const target = event.target as HTMLElement
      if (!selected || target.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      edit.onRemove(selected)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [edit, selected])

  if (!ready) return <p className="admin-note">Yuklanmoqda…</p>
  if (!authed) return <main className="admin-login">
    <h1>Loyiha muharriri</h1>
    <form onSubmit={login}>
      <AdminPasswordField value={password} onChange={setPassword}/>
      {error && <div className="admin-error">{error}</div>}
      <button type="submit">Kirish</button>
    </form>
    <Link href="/uz" className="admin-link">Saytga qaytish</Link>
  </main>
  if (!story) return <p className="admin-error">{error || 'Loyiha topilmadi'}</p>

  const current = story.blocks.find(block => block.id === selected)

  function place(x: number) {
    if (!current) return
    updateBlock(current.id, { ...current, look: { ...current.look, x: Math.min(100 - current.look.width, Math.max(0, x)) } })
  }

  function plant(type: 'text' | 'image', host: string) {
    const block = createBlock(type)
    const next = { ...block, look: { ...block.look, host, x: 12, y: 18, width: type === 'text' ? 40 : 32, h: type === 'image' ? 140 : 0 } }
    setStory(item => item ? { ...item, blocks: [...item.blocks, next] } : item)
    setSelected(next.id)
  }

  function backgroundCard(host: string, image: string) {
    return <section className="look-card">
      <h3>Fon va joylash</h3>
      {image && <img className="bg-preview" src={image} alt=""/>}
      <div className="place-actions">
        <label className="place-action">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="10" r="1.4" fill="currentColor"/><path d="M3 16l5-4 4 3 3-2 6 5" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
          <span>{image ? 'Almashtirish' : 'Fon rasmi'}</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => {
            const file = event.target.files?.[0]
            if (file) edit.onFile(host === 'cover' ? 'image' : `blocks.${host}.bg`, file)
            event.currentTarget.value = ''
          }}/>
        </label>
        <button type="button" className="place-action" onClick={() => plant('text', host)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M12 6v12M8 18h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <span>Matn</span>
        </button>
        <button type="button" className="place-action" onClick={() => plant('image', host)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="10" r="1.3" fill="currentColor"/><path d="M4 16l4.5-3.5L12 15l2.5-2 5.5 4" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
          <span>Rasm</span>
        </button>
      </div>
      {image && <button type="button" className="ghost" onClick={() => setStory(item => {
        if (!item) return item
        if (host === 'cover') return { ...item, image: '' }
        return { ...item, blocks: item.blocks.map(block => block.id === host ? { ...block, look: { ...block.look, bg: '' } } : block) }
      })}>Fon rasmini olib tashlash</button>}
      <p className="admin-note">Qo‘yilgan matn yoki rasmni sichqoncha bilan suring.</p>
    </section>
  }

  function blockIndexAt(clientY: number) {
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-story-block]')]
    for (let index = 0; index < nodes.length; index += 1) {
      const rect = nodes[index].getBoundingClientRect()
      if (clientY < rect.top + rect.height / 2) return index
    }
    return nodes.length
  }

  function overCanvas(x: number, y: number) {
    const node = document.querySelector('.story-canvas')
    if (!node) return false
    const rect = node.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  function track(event: ReactPointerEvent, label: string, onDrop: (x: number, y: number) => void) {
    event.preventDefault()
    const originX = event.clientX
    const originY = event.clientY
    let moved = false
    const move = (pointer: PointerEvent) => {
      if (!moved && Math.hypot(pointer.clientX - originX, pointer.clientY - originY) < 6) return
      moved = true
      outlineId.current = 'moved'
      setGhost({ x: pointer.clientX, y: pointer.clientY, label })
      setHintIndex(overCanvas(pointer.clientX, pointer.clientY) ? blockIndexAt(pointer.clientY) : null)
    }
    const up = (pointer: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setGhost(null)
      setHintIndex(null)
      if (moved) onDrop(pointer.clientX, pointer.clientY)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const slideCount = (story.showCover === false ? 0 : 1) + story.blocks.length
  const slideNumber = !selected ? 0 : selected === 'cover' ? 1 : Math.max(1, story.blocks.findIndex(block => block.id === selected) + (story.showCover === false ? 1 : 2))

  return <div className="story-editor">
    <header className="ppt-title">
      <Link href="/admin">←</Link>
      <i className="ppt-mark">P</i>
      <strong>{story.title.uz || 'Yangi loyiha'}</strong>
      {(error || notice) && <span className={error ? 'admin-error' : 'admin-note'}>{error || notice}</span>}
      <div className="story-lang">{langs.map(item => <button type="button" key={item} className={lang === item ? 'on' : ''} onClick={() => setLang(item)}>{item.toUpperCase()}</button>)}</div>
      <Link href="/uz" className="ppt-site">Saytga qaytish</Link>
      <button type="button" disabled={busy} onClick={() => save(false)}>Qoralama</button>
      <button type="button" className="ppt-publish" disabled={busy} onClick={() => save(true)}>{busy ? 'Saqlanmoqda…' : 'Nashr'}</button>
    </header>
    <div className="ppt-ribbon">
      {blockGroups.map(group => <div className="ppt-group" key={group.title}>
        <div>
          {group.items.map(type => <button
            type="button"
            key={type}
            className={current?.type === type ? 'on' : ''}
            data-tip={blockLabels[type]}
            aria-label={blockLabels[type]}
            onPointerDown={event => track(event, blockLabels[type], (x, y) => {
              if (!overCanvas(x, y)) return
              const block = createBlock(type)
              const index = blockIndexAt(y)
              setStory(item => {
                if (!item) return item
                const blocks = [...item.blocks]
                blocks.splice(Math.max(0, Math.min(blocks.length, index)), 0, block)
                return { ...item, blocks }
              })
              setSelected(block.id)
            })}
            onClick={() => { if (outlineId.current === 'moved') { outlineId.current = ''; return } insert(type) }}
          ><BlockIcon type={type}/><span>{blockLabels[type]}</span></button>)}
        </div>
        <span>{group.title}</span>
      </div>)}
    </div>
    <aside className="ppt-slides">
      <button type="button" className={'ppt-slide' + (selected === 'cover' ? ' on' : '')} onClick={() => { setStory({ ...story, showCover: true }); setSelected('cover') }}>
        <em>1</em>
        <span className={'ppt-thumb' + (story.showCover === false ? '' : ' is-cover')} style={{ background: story.showCover === false ? '#f3f2f1' : story.color }}>{story.showCover === false ? 'Muqova yopiq' : 'Muqova'}</span>
      </button>
      {story.blocks.map((block, index) => <button
        type="button"
        key={block.id}
        data-outline={index}
        className={'ppt-slide' + (selected === block.id ? ' on' : '')}
        onPointerDown={event => track(event, blockLabels[block.type], (x, y) => {
          if (overCanvas(x, y)) edit.onReorder(block.id, blockIndexAt(y))
          else {
            const row = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-outline]')
            if (row) edit.onReorder(block.id, Number(row.dataset.outline))
          }
        })}
        onClick={() => { if (outlineId.current === 'moved') { outlineId.current = ''; return } setSelected(block.id) }}
      >
        <em>{(story.showCover === false ? 1 : 2) + index}</em>
        <span className="ppt-thumb">{blockLabels[block.type]}</span>
      </button>)}
    </aside>
    <div className="story-canvas" onClick={event => {
      const page = event.currentTarget.querySelector('.story-page')
      if (page?.hasAttribute('data-dragged')) {
        page.removeAttribute('data-dragged')
        return
      }
      if ((event.target as HTMLElement).closest('.story-page')) return
      setSelected('')
      setPart(null)
    }}>
      <StoryView project={story} locale={lang} selectedId={selected} partId={selected} partIndex={part} onSelect={id => { setSelected(id); setPart(null) }} edit={edit} hintIndex={hintIndex}/>
    </div>
    <aside className="story-format">
      <section className="story-inspector">
        {ghost && <div className="story-ghost" style={{ left: ghost.x, top: ghost.y }}>{ghost.label}</div>}
        {selected === 'cover' && <>
          <h2>Muqova</h2>
          {story.showCover === false && <button type="button" onClick={() => setStory({ ...story, showCover: true })}>Muqovani qaytarish</button>}
          {story.showCover !== false && <button type="button" className="ghost" onClick={() => edit.onRemove('cover')}>Muqovani o‘chirish</button>}
          <p className="admin-note">Nom, natija va mijozni slayd ustida bosing.</p>
          {backgroundCard('cover', story.image)}
          <details className="story-more">
            <summary>Xarita va manzil</summary>
            <label>Manzil<input value={story.slug} onChange={event => setStory({ ...story, slug: event.target.value })}/></label>
            <label>Rang<input type="color" value={story.color} onChange={event => setStory({ ...story, color: event.target.value })}/></label>
            <label>Kenglik<input value={story.lat ?? ''} onChange={event => setStory({ ...story, lat: event.target.value === '' ? undefined : Number(event.target.value) })}/></label>
            <label>Uzunlik<input value={story.lng ?? ''} onChange={event => setStory({ ...story, lng: event.target.value === '' ? undefined : Number(event.target.value) })}/></label>
          </details>
        </>}
        {current && <>
          <h2>{blockLabels[current.type]}</h2>
          <div className="look-head">
            <button type="button" className="ghost" onClick={() => edit.onDuplicate(current.id)}>Nusxa</button>
            <button type="button" className="ghost" onClick={() => edit.onRemove(current.id)}>O‘chirish</button>
          </div>
          {backgroundCard(current.id, current.look.bg)}
          {(current.type === 'text' || current.type === 'quote' || current.type === 'button' || current.type === 'stats' || current.type === 'list' || current.type === 'note' || current.type === 'shape' || current.type === 'table') && <section className="look-card">
            <h3>Shrift</h3>
            <div className="font-line">
              <label>Turi<FieldPick value={current.look.font} options={[{ value: '', label: 'Standart' }, ...fontFaces.map(face => ({ value: face, label: face }))]} onChange={value => updateBlock(current.id, { ...current, look: { ...current.look, font: value } })}/></label>
              <label>O‘lcham<input type="number" min={0} max={120} placeholder="Avto" value={current.look.size || ''} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, size: Math.min(120, Math.max(0, Number(event.target.value) || 0)) } })}/></label>
            </div>
            <label>Shrift o‘lchami, {current.look.size ? `${current.look.size}px` : 'avto'}<input type="range" min={0} max={96} value={Math.min(96, current.look.size || 0)} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, size: Number(event.target.value) } })}/></label>
            <div className="align-actions" role="group" aria-label="Matn joylashuvi">
              {([['left', 'Chapdan'], ['center', 'O‘rtadan'], ['right', 'O‘ngdan']] as const).map(([align, label]) => <button key={align} type="button" className={(current.look.align || 'left') === align ? 'on' : ''} aria-label={label} title={label} onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, align } })}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{align === 'left' ? <path d="M4 6h16M4 10h10M4 14h14M4 18h8"/> : align === 'center' ? <path d="M4 6h16M7 10h10M5 14h14M8 18h8"/> : <path d="M4 6h16M10 10h10M6 14h14M12 18h8"/>}</svg>
              </button>)}
            </div>
          </section>}
          {current.type === 'chart' && <section className="look-card">
            <h3>Diagramma turi</h3>
            <FieldPick value={current.chart} options={[{ value: 'bar', label: 'Ustun' }, { value: 'line', label: 'Chiziq' }, { value: 'donut', label: 'Doira' }]} onChange={value => updateBlock(current.id, { ...current, chart: value === 'line' || value === 'donut' ? value : 'bar' })}/>
            {current.items.map((item, index) => <label key={index}>Qator {index + 1}<input type="color" value={item.color} onChange={event => {
              const items = current.items.map((row, rowIndex) => rowIndex === index ? { ...row, color: event.target.value } : row)
              updateBlock(current.id, { ...current, items })
            }}/><b>{item.color.toUpperCase()}</b></label>)}
            <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, items: [...current.items, { label: emptyText(), value: 10, color: '#0c6e9e' }] })}>+ Qator</button>
          </section>}
          {current.type === 'slider' && <section className="look-card">
            <h3>Slayder</h3>
            <label className="admin-check"><input type="checkbox" checked={current.autoplay} onChange={event => updateBlock(current.id, { ...current, autoplay: event.target.checked })}/> Avto slayd</label>
            <label>Almashish, {current.every || 4} s<input type="range" min={2} max={12} value={current.every || 4} disabled={!current.autoplay} onChange={event => updateBlock(current.id, { ...current, every: Number(event.target.value) })}/></label>
            <div className="story-actions">
              <label className="story-replace">+ Slayd<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => { const file = event.target.files?.[0]; if (file) edit.onFile(`blocks.${current.id}.images.add`, file); event.currentTarget.value = '' }}/></label>
              <button type="button" className="ghost" disabled={current.images.length === 0} onClick={() => updateBlock(current.id, { ...current, images: current.images.slice(0, -1) })}>Oxirgi slaydni olish</button>
            </div>
            <p className="admin-note">{current.images.length ? `${current.images.length} ta slayd. Strelka va nuqtalar bilan almashadi.` : 'Kamida ikkita rasm qo‘shilsa slayder aylanadi.'}</p>
          </section>}
          {current.type === 'video' && <section className="look-card">
            <h3>Video</h3>
            <label>YouTube yoki Vimeo<input value={current.url} placeholder="https://www.youtube.com/watch?v=..." onChange={event => updateBlock(current.id, { ...current, url: event.target.value })}/></label>
          </section>}
          {current.type === 'button' && <section className="look-card">
            <h3>Tugma</h3>
            <div className="story-actions">
              <button type="button" className={'ghost' + (current.look.flow !== 'column' ? ' on' : '')} onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, flow: 'row' } })}>Yonma-yon</button>
              <button type="button" className={'ghost' + (current.look.flow === 'column' ? ' on' : '')} onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, flow: 'column' } })}>Tagma-tag</button>
            </div>
            <label>Havola<input value={current.url} placeholder="https://..." onChange={event => updateBlock(current.id, { ...current, url: event.target.value })}/></label>
          </section>}
          {current.type === 'embed' && <section className="look-card">
            <h3>ArcGIS</h3>
            <label>Havola<input value={current.url} placeholder="https://storymaps.arcgis.com/stories/..." onChange={event => updateBlock(current.id, { ...current, url: event.target.value })}/></label>
            <p className="admin-note">Faqat arcgis.com yoki esri.com dagi https havola.</p>
          </section>}
          {current.type === 'list' && <section className="look-card">
            <h3>Ro‘yxat</h3>
            <label>Turi<FieldPick value={current.kind} options={[{ value: 'ul', label: 'Nuqtali' }, { value: 'ol', label: 'Raqamli' }]} onChange={value => updateBlock(current.id, { ...current, kind: value === 'ol' ? 'ol' : 'ul' })}/></label>
            <div className="story-actions">
              <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, items: [...current.items, emptyText()] })}>+ Qator</button>
              <button type="button" className="ghost" disabled={current.items.length === 0} onClick={() => updateBlock(current.id, { ...current, items: current.items.slice(0, -1) })}>Oxirgi qatorni olish</button>
            </div>
          </section>}
          {current.type === 'table' && <section className="look-card">
            <h3>Jadval</h3>
            <label>Ustunlar<FieldPick value={String(current.cols)} options={[{ value: '2', label: '2 ustun' }, { value: '3', label: '3 ustun' }, { value: '4', label: '4 ustun' }]} onChange={value => {
              const cols = value === '2' ? 2 : value === '4' ? 4 : 3
              const rows = Math.max(1, Math.ceil(current.cells.length / current.cols))
              const cells = Array.from({ length: rows * cols }, (_, index) => current.cells[index] || emptyText())
              updateBlock(current.id, { ...current, cols, cells })
            }}/></label>
            <div className="story-actions">
              <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, cells: [...current.cells, ...Array.from({ length: current.cols }, () => emptyText())] })}>+ Qator</button>
              <button type="button" className="ghost" disabled={current.cells.length <= current.cols} onClick={() => updateBlock(current.id, { ...current, cells: current.cells.slice(0, Math.max(current.cols, current.cells.length - current.cols)) })}>Oxirgi qatorni olish</button>
            </div>
          </section>}
          {current.type === 'stats' && <section className="look-card">
            <h3>Ko‘rsatkichlar</h3>
            <div className="story-actions">
              <button type="button" className={'ghost' + (current.look.flow !== 'column' ? ' on' : '')} onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, flow: 'row' } })}>Yonma-yon</button>
              <button type="button" className={'ghost' + (current.look.flow === 'column' ? ' on' : '')} onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, flow: 'column' } })}>Tagma-tag</button>
            </div>
            <div className="story-actions">
              {current.items.map((item, index) => <button type="button" key={index} className={'ghost' + (part === index ? ' on' : '')} onClick={() => setPart(index)}>{item.value || index + 1}</button>)}
            </div>
            {part !== null && current.items[part] && <label>Tanlangan rang<input type="color" value={current.items[part].color || '#ffffff'} onChange={event => updateBlock(current.id, { ...current, items: current.items.map((item, index) => index === part ? { ...item, color: event.target.value } : item) })}/><b>{(current.items[part].color || '#ffffff').toUpperCase()}</b></label>}
            <button type="button" className="ghost" onClick={() => { setPart(current.items.length); updateBlock(current.id, { ...current, items: [...current.items, { value: '', label: emptyText(), color: '', pad: 0, margin: 0 }] }) }}>+ Ko‘rsatkich</button>
          </section>}
          {current.type === 'map' && <section className="look-card">
            <h3>Nuqtalar</h3>
            {current.points.map((point, index) => <div key={point.id} className="admin-grid">
              <label>Kenglik<input value={point.lat} onChange={event => updateBlock(current.id, { ...current, points: current.points.map((row, rowIndex) => rowIndex === index ? { ...row, lat: Number(event.target.value) } : row) })}/></label>
              <label>Uzunlik<input value={point.lng} onChange={event => updateBlock(current.id, { ...current, points: current.points.map((row, rowIndex) => rowIndex === index ? { ...row, lng: Number(event.target.value) } : row) })}/></label>
            </div>)}
            <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, points: [...current.points, emptyPoint()] })}>+ Nuqta</button>
          </section>}
          {current.type === 'sidecar' && <section className="look-card">
            <h3>Yonma-yon sahifalar</h3>
            {current.panels.map((panel, index) => <div key={panel.id} className="inspector-card">
              <label>Media<FieldPick value={panel.media} options={[{ value: 'image', label: 'Rasm' }, { value: 'map', label: 'Xarita' }]} onChange={value => {
                const media = value === 'map' ? 'map' as const : 'image' as const
                updateBlock(current.id, { ...current, panels: current.panels.map((row, rowIndex) => rowIndex === index ? { ...row, media, points: media === 'map' && row.points.length === 0 ? [emptyPoint()] : row.points } : row) })
              }}/></label>
              {panel.media === 'map' && panel.points.map((point, pointIndex) => <div className="admin-grid" key={point.id}>
                <label>Kenglik<input value={point.lat} onChange={event => updateBlock(current.id, { ...current, panels: current.panels.map((row, rowIndex) => rowIndex === index ? { ...row, points: panel.points.map((item, itemIndex) => itemIndex === pointIndex ? { ...item, lat: Number(event.target.value) } : item) } : row) })}/></label>
                <label>Uzunlik<input value={point.lng} onChange={event => updateBlock(current.id, { ...current, panels: current.panels.map((row, rowIndex) => rowIndex === index ? { ...row, points: panel.points.map((item, itemIndex) => itemIndex === pointIndex ? { ...item, lng: Number(event.target.value) } : item) } : row) })}/></label>
              </div>)}
            </div>)}
            <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, panels: [...current.panels, emptyPanel()] })}>+ Slayd</button>
          </section>}
          <section className="look-card">
            <h3>{current.type === 'stats' && part !== null && current.items[part] ? 'Tanlangan ko‘rsatkich' : 'Joylashgan qism'}</h3>
            {current.type === 'stats' && part !== null && current.items[part] ? <div className="look-row">
              <label>Ichki, {current.items[part].pad || 0}px<input type="range" min={0} max={64} value={current.items[part].pad || 0} onChange={event => updateBlock(current.id, { ...current, items: current.items.map((item, index) => index === part ? { ...item, pad: Number(event.target.value) } : item) })}/></label>
              <label>Tashqi, {current.items[part].margin || 0}px<input type="range" min={0} max={64} value={current.items[part].margin || 0} onChange={event => updateBlock(current.id, { ...current, items: current.items.map((item, index) => index === part ? { ...item, margin: Number(event.target.value) } : item) })}/></label>
            </div> : <>
              <div className="look-row">
                <label>Ichki, {current.look.pad || 0}px<input type="range" min={0} max={64} value={current.look.pad || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, pad: Number(event.target.value) } })}/></label>
                <label>Tashqi, {current.look.margin || 0}px<input type="range" min={0} max={64} value={current.look.margin || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, margin: Number(event.target.value) } })}/></label>
              </div>
              {current.type === 'stats' && <label>Masofa, {current.look.gap}px<input type="range" min={0} max={64} value={current.look.gap} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, gap: Number(event.target.value) } })}/></label>}
            </>}
          </section>
          {current.type !== 'spacer' && <section className="look-card">
            <h3>O‘lcham</h3>
            {current.type !== 'separator' && <div className="look-row">
              <label>Kenglik, {Math.round(current.look.width)}%<input type="range" min={8} max={100} value={current.look.width || 100} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, width: Number(event.target.value), x: Math.min(current.look.x, 100 - Number(event.target.value)) } })}/></label>
              <label>Balandlik, {current.look.h || 'avto'}<input type="range" min={0} max={1200} value={Math.min(1200, current.look.h || 0)} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, h: Number(event.target.value) } })}/></label>
            </div>}
            {current.type === 'separator' && <label>Kenglik, {Math.round(current.look.width)}%<input type="range" min={8} max={100} value={current.look.width || 100} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, width: Number(event.target.value), x: Math.min(current.look.x, 100 - Number(event.target.value)) } })}/></label>}
          </section>}
          {current.type !== 'spacer' && <section className="look-card">
            <h3>Ko‘rinish</h3>
            <label>Shakl<FieldPick value={current.look.form || ''} options={[{ value: '', label: 'To‘rtburchak' }, { value: 'round', label: 'Yumaloq' }, { value: 'pill', label: 'Kapsula' }, { value: 'circle', label: 'Doira' }, { value: 'oval', label: 'Oval' }, { value: 'diamond', label: 'Romb' }]} onChange={value => updateBlock(current.id, { ...current, look: { ...current.look, form: value as StoryForm } })}/></label>
            {current.look.form !== 'pill' && current.look.form !== 'circle' && current.look.form !== 'oval' && current.look.form !== 'diamond' && <label>Burchak, {current.look.radius || 0}px<input type="range" min={0} max={80} value={current.look.radius || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, radius: Number(event.target.value) } })}/></label>}
            <label>Chegara, {current.look.border || 0}px<input type="range" min={0} max={24} value={current.look.border || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, border: Number(event.target.value) } })}/></label>
            {current.look.border > 0 && <label>Chegara rangi<input type="color" value={current.look.line || '#201f1e'} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, line: event.target.value } })}/><b>{(current.look.line || '#201f1e').toUpperCase()}</b></label>}
            <label>Soya, {current.look.shadow || 0}px<input type="range" min={0} max={48} value={current.look.shadow || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, shadow: Number(event.target.value) } })}/></label>
            <label>Shaffoflik, {current.look.opacity ?? 100}%<input type="range" min={10} max={100} value={current.look.opacity ?? 100} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, opacity: Number(event.target.value) } })}/></label>
            <label>Burilish, {current.look.rotate || 0}°<input type="range" min={-180} max={180} value={current.look.rotate || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, rotate: Number(event.target.value) } })}/></label>
          </section>}
          {current.type === 'spacer' && <section className="look-card">
            <h3>Bo‘sh joy</h3>
            <label>Balandlik, {current.look.h || 'avto'}<input type="range" min={0} max={1200} value={Math.min(1200, current.look.h || 0)} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, h: Number(event.target.value) } })}/></label>
          </section>}
          {current.type !== 'spacer' && current.type !== 'separator' && <section className="look-card">
            <h3>Joylashuv</h3>
            <div className="story-place">
              <button type="button" className={'ghost' + (Math.abs(current.look.x) < 4 ? ' on' : '')} onClick={() => place(0)}>Chap</button>
              <button type="button" className={'ghost' + (Math.abs(current.look.x - (100 - current.look.width) / 2) < 4 && current.look.x > 4 ? ' on' : '')} onClick={() => place((100 - current.look.width) / 2)}>Markaz</button>
              <button type="button" className={'ghost' + (Math.abs(current.look.x - (100 - current.look.width)) < 4 && current.look.width < 98 ? ' on' : '')} onClick={() => place(100 - current.look.width)}>O‘ng</button>
            </div>
            {current.look.host === 'sheet' && <label>Yuqoridan, {Math.round(current.look.py || 0)}px<input type="range" min={0} max={1200} value={Math.min(1200, current.look.py || 0)} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, py: Number(event.target.value) } })}/></label>}
            {current.look.host && current.look.host !== 'sheet' && <label>Yuqoridan, {Math.round(current.look.y)}%<input type="range" min={0} max={80} value={current.look.y || 0} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, y: Number(event.target.value) } })}/></label>}
          </section>}
          {current.type === 'grid' && <section className="look-card">
            <h3>Grid</h3>
            <label>Ustunlar<FieldPick value={String(current.columns)} options={[{ value: '2', label: '2 ustun' }, { value: '3', label: '3 ustun' }, { value: '4', label: '4 ustun' }]} onChange={value => updateBlock(current.id, { ...current, columns: value === '3' ? 3 : value === '4' ? 4 : 2 })}/></label>
            <div className="story-actions">
              <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, cells: [...current.cells, emptyCell()] })}>+ Katak</button>
              <button type="button" className="ghost" disabled={current.cells.length === 0} onClick={() => updateBlock(current.id, { ...current, cells: current.cells.slice(0, -1) })}>Katakni olish</button>
            </div>
          </section>}
          <section className="look-card">
            <h3>Qatlam</h3>
            <div className="story-actions">
              <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, z: Math.max(0, (current.look.z || 1) - 1) } })}>Orqaga</button>
              <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, z: Math.min(40, (current.look.z || 1) + 1) } })}>Oldinga</button>
            </div>
            {current.look.host && <button type="button" className="ghost" onClick={() => updateBlock(current.id, { ...current, look: { ...current.look, host: '' } })}>Oqimga qaytarish</button>}
            <p className="admin-note">Elementni boshqa element ustiga tashlang. Oldinga chiqqani birinchi ko‘rinadi.</p>
          </section>
          <section className="look-card">
            <h3>{current.type === 'chart' ? 'Diagramma animatsiyasi' : current.type === 'text' || current.type === 'quote' ? 'Matn animatsiyasi' : 'Animatsiya'}</h3>
            <label className="admin-check"><input type="checkbox" checked={current.look.motion !== 'none'} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, motion: event.target.checked ? (current.look.motion === 'none' ? 'rise' : current.look.motion) : 'none' } })}/> Yoqilgan</label>
            <label>Turi<FieldPick value={current.look.motion === 'none' ? 'rise' : current.look.motion} disabled={current.look.motion === 'none'} options={[{ value: 'rise', label: 'Pastdan chiqish' }, { value: 'fade', label: 'Sekin paydo' }, { value: 'slide', label: 'O‘ngdan kirish' }, { value: 'left', label: 'Chapdan kirish' }, { value: 'zoom', label: 'Yaqinlashish' }, { value: 'flip', label: 'Aylanish' }, { value: 'bounce', label: 'Sakrash' }]} onChange={value => updateBlock(current.id, { ...current, look: { ...current.look, motion: value as StoryMotion } })}/></label>
            <label>Chiqish vaqti, {((current.look.dur || 600) / 1000).toFixed(1)} s<input type="range" min={200} max={3000} step={100} disabled={current.look.motion === 'none'} value={current.look.dur || 600} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, dur: Number(event.target.value) } })}/></label>
            <label>Matn va raqam<FieldPick value={current.look.play || 'none'} options={[{ value: 'none', label: 'Yo‘q' }, { value: 'count', label: '0 dan qiymatgacha' }, { value: 'type', label: 'Harfma-harf' }, { value: 'words', label: 'So‘zma-so‘z' }, { value: 'blur', label: 'Xira paydo' }]} onChange={value => updateBlock(current.id, { ...current, look: { ...current.look, play: value as StoryPlay } })}/></label>
            <label>Ichki vaqt, {((current.look.playDur || 1200) / 1000).toFixed(1)} s<input type="range" min={200} max={4000} step={100} disabled={!current.look.play || current.look.play === 'none'} value={current.look.playDur || 1200} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, playDur: Number(event.target.value) } })}/></label>
          </section>
          {current.type !== 'spacer' && <section className="look-card">
            <h3>Rang</h3>
            <div className="look-row">
              {(current.type === 'text' || current.type === 'quote' || current.type === 'button' || current.type === 'stats' || current.type === 'separator' || current.type === 'list' || current.type === 'note' || current.type === 'shape' || current.type === 'table') && <label>{current.type === 'separator' ? 'Chiziq' : 'Matn'}<input type="color" value={current.look.color || '#201f1e'} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, color: event.target.value } })}/><b>{(current.look.color || '#201f1e').toUpperCase()}</b></label>}
              {current.type !== 'separator' && <label>Fon<input type="color" value={current.look.background || '#ffffff'} onChange={event => updateBlock(current.id, { ...current, look: { ...current.look, background: event.target.value } })}/><b>{(current.look.background || '#ffffff').toUpperCase()}</b></label>}
            </div>
          </section>}
        </>}
      </section>
    </aside>
    <footer className="ppt-status"><span>{slideNumber ? `Slayd ${slideNumber} / ${slideCount}` : `Slayd — / ${slideCount}`}</span><span>{story.published ? 'Nashr' : 'Qoralama'}</span></footer>
  </div>
}
