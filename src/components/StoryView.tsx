'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { tx } from '@/data/site'
import type { Locale } from '@/lib/i18n'
import { getPaletteDrag, videoSrc, type MapPoint, type SidecarPanel, type StoryBlock, type StoryLook, type StoryPlay, type StoryProject, type StoryText } from '@/lib/story'
import { RealMap } from './RealMap'

function paragraphs(value: string) {
  return value.split('\n').map(line => line.trim()).filter(Boolean)
}

export type StoryEdit = {
  onText: (path: string, value: string) => void
  onFile: (path: string, file: File) => void
  onLook: (id: string, look: Partial<StoryLook>) => void
  onReorder: (id: string, toIndex: number) => void
  onInsert: (type: StoryBlock['type'], index: number) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onPart?: (id: string, index: number) => void
}

function sanitize(html: string) {
  return html
    .replace(/<div>/gi, '<br>')
    .replace(/<\/div>/gi, '')
    .replace(/<(?!\/?(?:b|strong|i|em|u|br|a)\b)[^>]*>/gi, '')
    .replace(/<a\b[^>]*>/gi, tag => {
      const href = tag.match(/href\s*=\s*["'](https?:\/\/[^"']+)["']/i)
      return href ? `<a href="${href[1]}" target="_blank" rel="noopener noreferrer">` : ''
    })
}

function Rich({ value }: { value: string }) {
  if (!/<[a-z]/i.test(value)) return null
  return <div className="story-rich" dangerouslySetInnerHTML={{ __html: sanitize(value) }}/>
}

function Ink({ as: Tag, value, path, edit, placeholder, multiline, rich }: { as: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'small' | 'figcaption' | 'strong' | 'em' | 'div', value: string, path: string, edit?: StoryEdit, placeholder: string, multiline?: boolean, rich?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node || document.activeElement === node) return
    if (rich) {
      if (node.innerHTML !== value) node.innerHTML = value
      return
    }
    if ((node.textContent || '') !== value) node.textContent = value
  }, [value, rich])
  if (!edit) {
    if (!value) return null
    return <Tag>{value}</Tag>
  }
  return <Tag
    ref={ref as never}
    className={'story-ink' + (value ? '' : ' is-empty') + (multiline ? ' is-multiline' : '')}
    contentEditable
    suppressContentEditableWarning
    data-placeholder={placeholder}
    onMouseDown={event => event.stopPropagation()}
    onInput={event => event.currentTarget.classList.toggle('is-empty', !(event.currentTarget.textContent || '').trim())}
    onKeyDown={event => {
      if (!multiline && event.key === 'Enter') {
        event.preventDefault()
        event.currentTarget.blur()
      }
    }}
    onBlur={event => edit.onText(path, rich ? sanitize(event.currentTarget.innerHTML) : event.currentTarget.innerText.replace(/\u00a0/g, ' ').replace(/\n$/, ''))}
  />
}

function plainText(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function counted(value: string, amount: number) {
  return value.replace(/-?\d+(?:[.,]\d+)?/g, raw => {
    const target = Number(raw.replace(',', '.'))
    const decimals = (raw.split(/[.,]/)[1] || '').length
    const text = decimals ? (target * amount).toFixed(decimals) : String(Math.round(target * amount))
    return raw.includes(',') ? text.replace('.', ',') : text
  })
}

function Played({ as: Tag, value, play, ms, immediate, onEdit }: { as: 'h2' | 'h3' | 'p' | 'span' | 'strong' | 'em' | 'div', value: string, play: StoryPlay, ms: number, immediate?: boolean, onEdit?: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(immediate)
  const [text, setText] = useState(play === 'count' ? counted(value, 0) : play === 'type' ? '' : value)
  useEffect(() => {
    if (immediate) {
      setSeen(true)
      return
    }
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSeen(true)
      setText(value)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setSeen(true)
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [immediate, value, play, ms])
  useEffect(() => {
    if (!seen || play === 'words' || play === 'blur' || play === 'none') return
    if (play === 'count' && !/-?\d/.test(value)) {
      setText(value)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(value)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / Math.max(200, ms))
      const eased = 1 - (1 - progress) ** 3
      if (play === 'count') setText(progress >= 1 ? value : counted(value, eased))
      if (play === 'type') setText(value.slice(0, Math.max(1, Math.round(value.length * progress))))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setText(value)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [seen, play, value, ms])
  const editHint = onEdit ? { title: 'Tahrirlash uchun ikki marta bosing', onDoubleClick: (event: ReactMouseEvent) => { event.preventDefault(); event.stopPropagation(); onEdit() } } : {}
  if (play === 'words') {
    const words = value.split(/\s+/).filter(Boolean)
    return <Tag ref={ref as never} className={'story-play-words' + (seen ? ' is-on' : '')} {...editHint}>{words.map((word, index) => <span key={`${word}-${index}`} style={{ animationDelay: `${(ms * index) / Math.max(words.length, 1)}ms` }}>{word}</span>)}</Tag>
  }
  if (play === 'blur') return <Tag ref={ref as never} className={seen ? 'story-play-blur' : 'story-play-wait'} style={{ animationDuration: `${ms}ms` }} {...editHint}>{value}</Tag>
  return <Tag ref={ref as never} {...editHint}>{text}</Tag>
}

function Copy({ as, value, play, ms, edit, path, placeholder, multiline, rich, lines }: { as: 'h2' | 'h3' | 'p' | 'span' | 'strong' | 'em' | 'div', value: string, play: StoryPlay, ms: number, edit?: StoryEdit, path: string, placeholder: string, multiline?: boolean, rich?: boolean, lines?: boolean }) {
  const [editing, setEditing] = useState(false)
  const plain = plainText(value)
  if (edit && (play === 'none' || editing || !plain)) {
    const writer = editing ? { ...edit, onText: (nextPath: string, next: string) => { edit.onText(nextPath, next); setEditing(false) } } : edit
    return <Ink as={as} value={value} path={path} edit={writer} placeholder={placeholder} multiline={multiline} rich={rich}/>
  }
  if (!plain) return null
  if (play === 'none') {
    if (rich && /<[a-z]/i.test(value)) return as === 'div' ? <Rich value={value}/> : <TagHtml as={as} value={value}/>
    if (lines) return <>{paragraphs(value).map(line => <p key={line}>{line}</p>)}</>
    const Tag = as
    return <Tag>{value}</Tag>
  }
  return <Played as={as} value={plain} play={play} ms={ms} immediate={Boolean(edit)} onEdit={edit ? () => setEditing(true) : undefined}/>
}

function TagHtml({ as: Tag, value }: { as: 'h2' | 'h3' | 'p' | 'span' | 'strong' | 'em' | 'div', value: string }) {
  return <Tag dangerouslySetInnerHTML={{ __html: sanitize(value) }}/>
}

function ReplaceImage({ path, edit, label }: { path: string, edit?: StoryEdit, label: string }) {
  if (!edit) return null
  return <label className="story-replace">{label}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={event => {
    const file = event.target.files?.[0]
    if (file) edit.onFile(path, file)
    event.currentTarget.value = ''
  }}/></label>
}

function StoryMap({ points, locale, className, edit, blockId }: { points: MapPoint[], locale: Locale, className?: string, edit?: StoryEdit, blockId?: string }) {
  const markers = points.map(point => ({ id: point.id, lng: point.lng, lat: point.lat, label: tx(point.title, locale) || 'Nuqta' }))
  const [active, setActive] = useState(points[0]?.id)
  const current = points.find(point => point.id === active) || points[0]
  if (!current) return null
  return <div className={className || 'story-map'}>
    <RealMap markers={markers} activeId={current.id} center={[current.lng, current.lat]} zoom={6} onSelect={setActive}/>
    <aside>
      {edit && blockId ? <Ink as="strong" value={tx(current.title, locale)} path={`blocks.${blockId}.points.${current.id}.title`} edit={edit} placeholder="Nuqta nomi"/> : <strong>{tx(current.title, locale)}</strong>}
      {edit && blockId ? <Ink as="p" value={tx(current.text, locale)} path={`blocks.${blockId}.points.${current.id}.text`} edit={edit} placeholder="Nuqta matni" multiline/> : tx(current.text, locale) && <p>{tx(current.text, locale)}</p>}
    </aside>
  </div>
}

function Sidecar({ panels, locale, edit, blockId }: { panels: SidecarPanel[], locale: Locale, edit?: StoryEdit, blockId: string }) {
  const [active, setActive] = useState(0)
  const copyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = copyRef.current
    const nodes = root ? [...root.querySelectorAll<HTMLElement>('[data-sidecar-panel]')] : []
    if (!nodes.length) return
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const index = Number((visible.target as HTMLElement).dataset.sidecarPanel)
      if (Number.isFinite(index)) setActive(index)
    }, { rootMargin: '-40% 0px -40% 0px', threshold: [0.25, 0.6] })
    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [panels])
  const panel = panels[active] || panels[0]
  if (!panel) return null
  return <section className="story-sidecar">
    <div ref={copyRef}>
      {panels.map((item, index) => <article data-sidecar-panel={index} key={item.id}>
        {edit ? <Ink as="h2" value={tx(item.heading, locale)} path={`blocks.${blockId}.panels.${item.id}.heading`} edit={edit} placeholder="Sarlavha"/> : tx(item.heading, locale) && <h2>{tx(item.heading, locale)}</h2>}
        {edit ? <Ink as="div" value={tx(item.body, locale)} path={`blocks.${blockId}.panels.${item.id}.body`} edit={edit} placeholder="Matnni shu yerda yozing" multiline/> : paragraphs(tx(item.body, locale)).map(line => <p key={line}>{line}</p>)}
      </article>)}
    </div>
    <div className="story-sidecar-stage">
      {panel.media === 'map' && panel.points.length > 0
        ? <StoryMap points={panel.points} locale={locale} className="story-map story-map-fill"/>
        : panel.src ? <Image src={panel.src} alt={tx(panel.heading, locale)} width={1200} height={800}/> : <div className="story-empty">Media yo‘q</div>}
      {panel.media === 'image' && <ReplaceImage path={`blocks.${blockId}.panels.${panel.id}.src`} edit={edit} label="Rasm"/>}
    </div>
  </section>
}

function StorySlider({ images, autoplay, every, locale, edit, blockId }: { images: { src: string, caption: StoryText }[], autoplay: boolean, every: number, locale: Locale, edit?: StoryEdit, blockId: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const safe = images.length ? index % images.length : 0
  useEffect(() => {
    if (!autoplay || paused || images.length < 2) return
    const timer = setInterval(() => setIndex(current => (current + 1) % images.length), Math.min(12, Math.max(2, every || 4)) * 1000)
    return () => clearInterval(timer)
  }, [autoplay, paused, images.length, every])
  const step = (delta: number) => setIndex(current => (current + delta + images.length) % images.length)
  const image = images[safe]
  return <div className="story-slider" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
    <div className="story-slider-frame">
      {images.length === 0 && <div className="story-empty">Slayd qo‘shing</div>}
      {images.map((item, itemIndex) => <figure key={`${item.src}-${itemIndex}`} className={itemIndex === safe ? 'is-on' : ''}>
        {item.src ? <Image src={item.src} alt={tx(item.caption, locale) || `Slayd ${itemIndex + 1}`} fill sizes="(max-width: 900px) 100vw, 800px"/> : <div className="story-empty">Rasm yo‘q</div>}
      </figure>)}
      {images.length > 1 && <>
        <button type="button" className="story-slider-arrow is-prev" onPointerDown={event => event.stopPropagation()} onClick={() => step(-1)} aria-label="Oldingi">‹</button>
        <button type="button" className="story-slider-arrow is-next" onPointerDown={event => event.stopPropagation()} onClick={() => step(1)} aria-label="Keyingi">›</button>
        <div className="story-slider-dots">{images.map((item, itemIndex) => <button type="button" key={`${item.src}-${itemIndex}`} className={itemIndex === safe ? 'is-on' : ''} aria-label={`Slayd ${itemIndex + 1}`} onPointerDown={event => event.stopPropagation()} onClick={() => setIndex(itemIndex)}/>)}</div>
      </>}
    </div>
    {image && (edit ? <Ink as="figcaption" value={tx(image.caption, locale)} path={`blocks.${blockId}.images.${safe}.caption`} edit={edit} placeholder="Slayd izohi"/> : tx(image.caption, locale) && <figcaption>{tx(image.caption, locale)}</figcaption>)}
    {edit && <div className="story-slider-tools">
      <ReplaceImage path={`blocks.${blockId}.images.add`} edit={edit} label="+ Slayd"/>
      {image && <ReplaceImage path={`blocks.${blockId}.images.${safe}.src`} edit={edit} label="Rasmni almashtirish"/>}
    </div>}
  </div>
}

function StoryChart({ block, locale, edit }: { block: Extract<StoryBlock, { type: 'chart' }>, locale: Locale, edit?: StoryEdit }) {
  const items = block.items.filter(item => Number.isFinite(item.value))
  const max = Math.max(...items.map(item => item.value), 1)
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1
  const title = <Copy as="h2" value={tx(block.title, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.title`} placeholder="Diagramma nomi"/>
  if (block.chart === 'donut') return <section className="story-chart">
    {title}
    <div className="story-donut">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        {items.map((item, index) => {
          const length = (item.value / total) * 100
          const offset = items.slice(0, index).reduce((sum, part) => sum + (part.value / total) * 100, 0)
          return <circle key={index} cx="60" cy="60" r="42" fill="none" stroke={item.color} strokeWidth="14" pathLength={100} strokeDasharray={`${length} ${100 - length}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"/>
        })}
      </svg>
      <ul>{items.map((item, index) => <li key={index}><i style={{ background: item.color }}/>{edit ? <><Ink as="span" value={tx(item.label, locale)} path={`blocks.${block.id}.items.${index}.label`} edit={edit} placeholder="Nom"/> · <Ink as="span" value={String(item.value)} path={`blocks.${block.id}.items.${index}.value`} edit={edit} placeholder="0"/></> : <><Copy as="span" value={tx(item.label, locale)} play={block.look.play} ms={block.look.playDur} path="" placeholder=""/> · <Copy as="span" value={String(item.value)} play={block.look.play} ms={block.look.playDur} path="" placeholder=""/></>}</li>)}</ul>
    </div>
  </section>
  if (block.chart === 'line') return <section className="story-chart">
    {title}
    <svg className="story-line" viewBox="0 0 320 180" role="img">
      <polyline fill="none" stroke="#0c6e9e" strokeWidth="3" points={items.map((item, index) => {
        const x = items.length === 1 ? 160 : 16 + (index / (items.length - 1)) * 288
        const y = 160 - (item.value / max) * 130
        return `${x},${y}`
      }).join(' ')}/>
      {items.map((item, index) => {
        const x = items.length === 1 ? 160 : 16 + (index / (items.length - 1)) * 288
        const y = 160 - (item.value / max) * 130
        return <circle key={index} cx={x} cy={y} r="4" fill={item.color}/>
      })}
    </svg>
    <div className="story-line-labels">{items.map((item, index) => edit ? <Ink key={index} as="span" value={tx(item.label, locale)} path={`blocks.${block.id}.items.${index}.label`} edit={edit} placeholder="Nom"/> : <Copy key={index} as="span" value={tx(item.label, locale) || String(item.value)} play={block.look.play} ms={block.look.playDur} path="" placeholder=""/>)}{edit ? items.map((item, index) => <Ink key={`v${index}`} as="em" value={String(item.value)} path={`blocks.${block.id}.items.${index}.value`} edit={edit} placeholder="0"/>) : items.map((item, index) => <Copy key={`v${index}`} as="em" value={String(item.value)} play={block.look.play} ms={block.look.playDur} path="" placeholder=""/>)}</div>
  </section>
  return <section className="story-chart">
    {title}
    <div className="story-bars">{items.map((item, index) => <div key={index}>
      {edit ? <Ink as="span" value={tx(item.label, locale)} path={`blocks.${block.id}.items.${index}.label`} edit={edit} placeholder="Nom"/> : <Copy as="span" value={tx(item.label, locale) || String(item.value)} play={block.look.play} ms={block.look.playDur} path="" placeholder=""/>}
      <b><i style={{ width: `${(item.value / max) * 100}%`, background: item.color }}/></b>
      {edit ? <Ink as="em" value={String(item.value)} path={`blocks.${block.id}.items.${index}.value`} edit={edit} placeholder="0"/> : <Copy as="em" value={String(item.value)} play={block.look.play} ms={block.look.playDur} path="" placeholder=""/>}
    </div>)}</div>
  </section>
}

function BlockBody({ block, locale, edit, partId, partIndex }: { block: StoryBlock, locale: Locale, edit?: StoryEdit, partId?: string | null, partIndex?: number | null }) {
  if (block.type === 'text') return <section className="story-text">
    <Copy as="h2" value={tx(block.heading, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.heading`} placeholder="Sarlavha" rich/>
    <Copy as="div" value={tx(block.body, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.body`} placeholder="Matnni shu yerda yozing" multiline rich lines/>
  </section>
  if (block.type === 'image') return <figure className="story-figure">
    {block.src ? <Image src={block.src} alt={tx(block.caption, locale)} width={1440} height={900}/> : <div className="story-empty">Rasm yo‘q</div>}
    <ReplaceImage path={`blocks.${block.id}.src`} edit={edit} label="Rasm"/>
    {edit ? <Ink as="figcaption" value={tx(block.caption, locale)} path={`blocks.${block.id}.caption`} edit={edit} placeholder="Izoh"/> : tx(block.caption, locale) && <figcaption>{tx(block.caption, locale)}</figcaption>}
  </figure>
  if (block.type === 'slider') return <StorySlider images={block.images} autoplay={block.autoplay} every={block.every} locale={locale} edit={edit} blockId={block.id}/>
  if (block.type === 'chart') return <StoryChart block={block} locale={locale} edit={edit}/>
  if (block.type === 'gallery') return <div className="story-gallery">
    {block.images.map((image, index) => <figure key={`${image.src}-${index}`}>
      <Image src={image.src} alt={tx(image.caption, locale) || `Ekran ${index + 1}`} width={1200} height={800}/>
      {edit ? <Ink as="figcaption" value={tx(image.caption, locale)} path={`blocks.${block.id}.images.${index}.caption`} edit={edit} placeholder="Izoh"/> : tx(image.caption, locale) && <figcaption>{tx(image.caption, locale)}</figcaption>}
    </figure>)}
    {edit && <ReplaceImage path={`blocks.${block.id}.images.add`} edit={edit} label="+ Rasm"/>}
  </div>
  if (block.type === 'stats') return <div className={'story-stats' + (block.look.flow === 'column' ? ' is-stack' : '')} style={{ gap: block.look.gap }}>
    {block.items.map((item, index) => <article key={index} className={partId === block.id && partIndex === index ? 'is-part' : ''} style={{ background: item.color || undefined, borderColor: item.color || undefined, padding: item.pad || undefined, margin: item.margin || undefined }} onClick={event => { event.stopPropagation(); edit?.onPart?.(block.id, index) }}>
      <Copy as="strong" value={item.value} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.items.${index}.value`} placeholder="0"/>
      <Copy as="span" value={tx(item.label, locale)} play={block.look.play === 'count' ? 'none' : block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.items.${index}.label`} placeholder="Nom"/>
    </article>)}
  </div>
  if (block.type === 'map') return <StoryMap points={block.points} locale={locale} edit={edit} blockId={block.id}/>
  if (block.type === 'sidecar') return <Sidecar panels={block.panels} locale={locale} edit={edit} blockId={block.id}/>
  if (block.type === 'embed' && block.url) return <figure className="story-embed">
    {edit ? <Ink as="figcaption" value={tx(block.title, locale)} path={`blocks.${block.id}.title`} edit={edit} placeholder="Sarlavha"/> : tx(block.title, locale) && <figcaption>{tx(block.title, locale)}</figcaption>}
    <iframe src={block.url} title={tx(block.title, locale) || 'ArcGIS'} loading="lazy" referrerPolicy="no-referrer"/>
  </figure>
  if (block.type === 'embed') return <div className="story-empty">ArcGIS havolasi yo‘q</div>
  if (block.type === 'grid') return <div className="story-grid" style={{ gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))` }}>
    {block.cells.map((cell, index) => <article key={cell.id}>
      {cell.src ? <Image src={cell.src} alt={tx(cell.heading, locale) || `Katak ${index + 1}`} width={800} height={520}/> : edit && <div className="story-empty">Rasm yo‘q</div>}
      <ReplaceImage path={`blocks.${block.id}.cells.${index}`} edit={edit} label={cell.src ? 'Rasmni almashtirish' : 'Rasm'}/>
      <Copy as="h3" value={tx(cell.heading, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.cells.${index}.heading`} placeholder="Sarlavha"/>
      <Copy as="p" value={tx(cell.body, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.cells.${index}.body`} placeholder="Matn" multiline/>
    </article>)}
    {block.cells.length === 0 && <div className="story-empty">Katak yo‘q</div>}
  </div>
  if (block.type === 'quote') {
    const quote = tx(block.text, locale)
    return <blockquote className="story-quote">
      <Copy as="p" value={quote} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.text`} placeholder="Iqtibos" multiline rich/>
    </blockquote>
  }
  if (block.type === 'button') {
    const label = tx(block.label, locale) || 'Tugma'
    const tone = { background: block.look.background || undefined, color: block.look.color || undefined }
    const face = block.look.play === 'none' ? label : <Played as="span" value={plainText(label)} play={block.look.play} ms={block.look.playDur} immediate={Boolean(edit)}/>
    return <div className="story-button">{block.url ? <a href={block.url} style={tone} target="_blank" rel="noopener noreferrer">{face}</a> : <span style={tone}>{face}</span>}
      {edit && <Ink as="span" value={tx(block.label, locale)} path={`blocks.${block.id}.label`} edit={edit} placeholder="Tugma nomi"/>}
    </div>
  }
  if (block.type === 'separator') return <hr className="story-separator"/>
  if (block.type === 'video') {
    const src = videoSrc(block.url)
    return src ? <iframe className="story-video" src={src} title="Video" loading="lazy" referrerPolicy="no-referrer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/> : <div className="story-empty">YouTube yoki Vimeo havolasi</div>
  }
  if (block.type === 'spacer') return <div className="story-spacer"/>
  if (block.type === 'shape') return <div className="story-shape">
    <Copy as="p" value={tx(block.label, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.label`} placeholder="Matn" rich/>
  </div>
  if (block.type === 'list') {
    const Tag = block.kind === 'ol' ? 'ol' : 'ul'
    return <Tag className="story-list">{block.items.map((item, index) => <li key={index}>
      <Copy as="span" value={tx(item, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.items.${index}`} placeholder={`Qator ${index + 1}`}/>
    </li>)}</Tag>
  }
  if (block.type === 'table') return <table className="story-table"><tbody>{Array.from({ length: Math.max(1, Math.ceil(block.cells.length / block.cols)) }, (_, row) => <tr key={row}>{Array.from({ length: block.cols }, (_, col) => {
    const index = row * block.cols + col
    return <td key={col}><Copy as="span" value={tx(block.cells[index] || { uz: '', ru: '', en: '' }, locale)} play="none" ms={0} edit={edit} path={`blocks.${block.id}.cells.${index}`} placeholder="Katak"/></td>
  })}</tr>)}</tbody></table>
  if (block.type === 'note') return <aside className="story-note">
    <Copy as="h3" value={tx(block.title, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.title`} placeholder="Eslatma"/>
    <Copy as="p" value={tx(block.body, locale)} play={block.look.play} ms={block.look.playDur} edit={edit} path={`blocks.${block.id}.body`} placeholder="Matn" multiline/>
  </aside>
  return null
}

function radiusOf(look: StoryLook) {
  if (look.form === 'circle' || look.form === 'pill' || look.form === 'oval') return 999
  if (look.form === 'round') return Math.max(look.radius, 24)
  return look.radius > 0 ? look.radius : undefined
}

function formStyle(look: StoryLook): CSSProperties {
  return {
    color: look.color || undefined,
    fontFamily: look.font || undefined,
    fontSize: look.size > 0 ? look.size : undefined,
    padding: look.pad > 0 ? look.pad : undefined,
    margin: look.margin > 0 ? look.margin : undefined,
  }
}

function placeStyle(look: StoryLook): CSSProperties | undefined {
  const paint = formStyle(look)
  if (look.host === 'sheet') return { position: 'absolute', left: `${look.x}%`, top: look.py > 0 ? `${look.py}px` : `${look.y}%`, width: look.width < 100 ? `${look.width}%` : 'fit-content', maxWidth: '100%', zIndex: Math.max(look.z || 1, 5), ...paint }
  if (look.host) return { position: 'absolute', left: `${look.x}%`, top: `${look.y}%`, width: look.width < 100 ? `${look.width}%` : 'fit-content', maxWidth: '100%', zIndex: Math.max(look.z || 1, 1), ...paint }
  if (!look.color && !look.font && !look.size && !look.pad && !look.margin) return undefined
  return paint
}

function bodyStyle(look: StoryLook): CSSProperties | undefined {
  const radius = radiusOf(look)
  if (!look.background && !look.h && !look.bg && !look.form && !look.border && !look.shadow && look.opacity >= 100 && !look.rotate && !radius) return undefined
  return {
    height: look.h > 0 ? look.h : undefined,
    minHeight: look.form && !look.h ? 120 : undefined,
    overflow: look.h > 0 || look.form === 'diamond' || look.form === 'circle' ? 'hidden' : undefined,
    backgroundColor: look.background || undefined,
    backgroundImage: look.bg ? `url(${look.bg})` : undefined,
    backgroundSize: look.bg ? 'cover' : undefined,
    backgroundPosition: look.bg ? 'center' : undefined,
    borderRadius: radius,
    border: look.border > 0 ? `${look.border}px solid ${look.line || '#201f1e'}` : undefined,
    boxShadow: look.shadow > 0 ? `0 ${Math.round(look.shadow / 3)}px ${look.shadow}px rgba(16,32,51,.28)` : undefined,
    opacity: look.opacity > 0 && look.opacity < 100 ? look.opacity / 100 : undefined,
    transform: look.rotate ? `rotate(${look.rotate}deg)` : undefined,
    clipPath: look.form === 'diamond' ? 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' : undefined,
    aspectRatio: look.form === 'circle' ? '1' : look.form === 'oval' ? '1.6 / 1' : undefined,
  }
}

type Guide = { x: number, y: number, w: number, h: number, label?: string }

function measureGuides(left: number, top: number, width: number, height: number, others: DOMRect[], page: DOMRect, pin: { left?: boolean, right?: boolean, top?: boolean, bottom?: boolean } = {}) {
  const threshold = 6
  const guides: Guide[] = []
  let nextLeft = left
  let nextTop = top
  let nextWidth = width
  let nextHeight = height
  const right = left + width
  const bottom = top + height
  type Snap = { delta: number, line: number, peer: DOMRect, left: number, top: number, width: number, height: number }
  let bestX: Snap | null = null
  let bestY: Snap | null = null
  const nearer = (best: Snap | null, delta: number) => !best || Math.abs(delta) < Math.abs(best.delta)
  for (const other of others) {
    for (const target of [other.left, other.left + other.width / 2, other.right]) {
      if (!pin.left) {
        const delta = target - left
        const nextW = pin.right ? right - target : width
        if (Math.abs(delta) <= threshold && nextW >= 36 && nearer(bestX, delta)) bestX = { delta, line: target, peer: other, left: target, top, width: nextW, height }
      }
      if (!pin.right) {
        const delta = target - right
        const nextW = pin.left ? target - left : width
        if (Math.abs(delta) <= threshold && nextW >= 36 && nearer(bestX, delta)) bestX = { delta, line: target, peer: other, left: pin.left ? left : target - width, top, width: nextW, height }
      }
      if (!pin.left && !pin.right) {
        const delta = target - (left + width / 2)
        if (Math.abs(delta) <= threshold && nearer(bestX, delta)) bestX = { delta, line: target, peer: other, left: target - width / 2, top, width, height }
      }
    }
    for (const target of [other.top, other.top + other.height / 2, other.bottom]) {
      if (!pin.top) {
        const delta = target - top
        const nextH = pin.bottom ? bottom - target : height
        if (Math.abs(delta) <= threshold && nextH >= 24 && nearer(bestY, delta)) bestY = { delta, line: target, peer: other, left, top: target, width, height: nextH }
      }
      if (!pin.bottom) {
        const delta = target - bottom
        const nextH = pin.top ? target - top : height
        if (Math.abs(delta) <= threshold && nextH >= 24 && nearer(bestY, delta)) bestY = { delta, line: target, peer: other, left, top: pin.top ? top : target - height, width, height: nextH }
      }
      if (!pin.top && !pin.bottom) {
        const delta = target - (top + height / 2)
        if (Math.abs(delta) <= threshold && nearer(bestY, delta)) bestY = { delta, line: target, peer: other, left, top: target - height / 2, width, height }
      }
    }
  }
  if (bestX) {
    nextLeft = bestX.left
    nextWidth = bestX.width
  }
  if (bestY) {
    nextTop = bestY.top
    nextHeight = bestY.height
  }
  const seenX = new Set<number>()
  const seenY = new Set<number>()
  for (const line of [nextLeft, nextLeft + nextWidth / 2, nextLeft + nextWidth]) {
    const key = Math.round(line)
    if (seenX.has(key)) continue
    const matched = others.filter(other => [other.left, other.left + other.width / 2, other.right].some(value => Math.abs(value - line) <= 0.5))
    if (!matched.length) continue
    seenX.add(key)
    const y1 = Math.min(nextTop, ...matched.map(item => item.top))
    const y2 = Math.max(nextTop + nextHeight, ...matched.map(item => item.bottom))
    guides.push({ x: line - page.left, y: y1 - page.top, w: 1, h: Math.max(1, y2 - y1) })
  }
  for (const line of [nextTop, nextTop + nextHeight / 2, nextTop + nextHeight]) {
    const key = Math.round(line)
    if (seenY.has(key)) continue
    const matched = others.filter(other => [other.top, other.top + other.height / 2, other.bottom].some(value => Math.abs(value - line) <= 0.5))
    if (!matched.length) continue
    seenY.add(key)
    const x1 = Math.min(nextLeft, ...matched.map(item => item.left))
    const x2 = Math.max(nextLeft + nextWidth, ...matched.map(item => item.right))
    guides.push({ x: x1 - page.left, y: line - page.top, w: Math.max(1, x2 - x1), h: 1 })
  }
  const rightEdge = nextLeft + nextWidth
  const bottomEdge = nextTop + nextHeight
  const gaps: { gap: number, guide: Guide }[] = []
  for (const other of others) {
    const overlapY = Math.min(bottomEdge, other.bottom) - Math.max(nextTop, other.top)
    if (overlapY > 4) {
      if (other.left >= rightEdge) gaps.push({ gap: other.left - rightEdge, guide: { x: rightEdge - page.left, y: (Math.max(nextTop, other.top) + Math.min(bottomEdge, other.bottom)) / 2 - page.top, w: other.left - rightEdge, h: 1, label: String(Math.round(other.left - rightEdge)) } })
      if (nextLeft >= other.right) gaps.push({ gap: nextLeft - other.right, guide: { x: other.right - page.left, y: (Math.max(nextTop, other.top) + Math.min(bottomEdge, other.bottom)) / 2 - page.top, w: nextLeft - other.right, h: 1, label: String(Math.round(nextLeft - other.right)) } })
    }
    const overlapX = Math.min(rightEdge, other.right) - Math.max(nextLeft, other.left)
    if (overlapX > 4) {
      if (other.top >= bottomEdge) gaps.push({ gap: other.top - bottomEdge, guide: { x: (Math.max(nextLeft, other.left) + Math.min(rightEdge, other.right)) / 2 - page.left, y: bottomEdge - page.top, w: 1, h: other.top - bottomEdge, label: String(Math.round(other.top - bottomEdge)) } })
      if (nextTop >= other.bottom) gaps.push({ gap: nextTop - other.bottom, guide: { x: (Math.max(nextLeft, other.left) + Math.min(rightEdge, other.right)) / 2 - page.left, y: other.bottom - page.top, w: 1, h: nextTop - other.bottom, label: String(Math.round(nextTop - other.bottom)) } })
    }
  }
  const near = (horizontal: boolean) => gaps.filter(item => item.gap >= 1 && item.gap <= 280 && (horizontal ? item.guide.h === 1 : item.guide.w === 1)).sort((a, b) => a.gap - b.gap)[0]
  const across = near(true)
  const down = near(false)
  if (across) guides.push(across.guide)
  if (down) guides.push(down.guide)
  return { left: nextLeft, top: nextTop, width: nextWidth, height: nextHeight, guides }
}

function motionFrom(kind: StoryBlock['look']['motion']) {
  if (kind === 'fade') return { opacity: 0 }
  if (kind === 'slide') return { opacity: 0, x: 36 }
  if (kind === 'left') return { opacity: 0, x: -36 }
  if (kind === 'zoom') return { opacity: 0, scale: 0.84 }
  if (kind === 'flip') return { opacity: 0, rotateY: 75 }
  if (kind === 'bounce') return { opacity: 0, y: 36, scale: 0.94 }
  return { opacity: 0, y: 28 }
}

function indexAt(clientX: number, clientY: number, nodes: HTMLElement[]) {
  for (let index = 0; index < nodes.length; index += 1) {
    const rect = nodes[index].getBoundingClientRect()
    const sameRow = clientY >= rect.top - 10 && clientY <= rect.bottom + 10
    if (sameRow) {
      if (clientX < rect.left + rect.width / 2) return index
      continue
    }
    if (clientY < rect.top) return index
  }
  return nodes.length
}

export function StoryView({ project, locale, selectedId, onSelect, edit, hintIndex = null, partId = null, partIndex = null }: { project: StoryProject, locale: Locale, selectedId?: string | null, onSelect?: (id: string) => void, edit?: StoryEdit, hintIndex?: number | null, partId?: string | null, partIndex?: number | null }) {
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [hostHint, setHostHint] = useState<string | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [flowPad, setFlowPad] = useState(0)
  const pageRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!edit || !pageRef.current) return
    const page = pageRef.current
    const pending = project.blocks.filter(block => block.look.host === 'sheet' && !block.look.py && block.look.y > 0)
    if (pending.length) {
      const height = page.clientHeight || 1
      pending.forEach(block => edit.onLook(block.id, { py: Math.round((block.look.y / 100) * height) }))
      return
    }
    page.style.minHeight = ''
    const pageTop = page.getBoundingClientRect().top
    let bottom = 0
    page.querySelectorAll<HTMLElement>('[data-story-frame]').forEach(node => {
      bottom = Math.max(bottom, node.getBoundingClientRect().bottom - pageTop)
    })
    const nextHeight = Math.ceil(bottom + 72)
    if (page.offsetHeight < nextHeight) page.style.minHeight = `${nextHeight}px`
    const flow = page.querySelector<HTMLElement>('.story-flow')
    if (!flow) return
    let low = 0
    page.querySelectorAll<HTMLElement>('.is-float').forEach(node => {
      low = Math.max(low, node.getBoundingClientRect().bottom - pageTop)
    })
    const margin = parseFloat(flow.style.marginTop) || 0
    const natural = flow.offsetTop - margin
    const pad = Math.max(0, Math.round(low - natural + 24))
    setFlowPad(current => Math.abs(current - pad) > 2 ? pad : current)
  }, [project, edit])

  function nodes() {
    return pageRef.current ? [...pageRef.current.querySelectorAll<HTMLElement>('[data-story-block]')] : []
  }

  function hostedBy(ancestorId: string, hostId: string) {
    let current = hostId
    const seen = new Set<string>()
    while (current && !seen.has(current)) {
      if (current === ancestorId) return true
      seen.add(current)
      if (current === 'cover') return false
      current = project.blocks.find(item => item.id === current)?.look.host || ''
    }
    return false
  }

  function hostAt(clientX: number, clientY: number, selfId: string) {
    const dragged = pageRef.current?.querySelector<HTMLElement>(`[data-story-frame="${selfId}"]`)
    for (const node of document.elementsFromPoint(clientX, clientY)) {
      if (!(node instanceof HTMLElement)) continue
      const frame = node.closest<HTMLElement>('[data-story-frame]')
      if (!frame || !pageRef.current?.contains(frame)) continue
      const hostId = frame.dataset.storyFrame || ''
      if (!hostId || hostId === selfId || (dragged && dragged.contains(frame))) continue
      if (hostedBy(selfId, hostId)) continue
      const box = frame.getBoundingClientRect()
      if (clientX - box.left < 14 || clientY - box.top < 14 || box.right - clientX < 14 || box.bottom - clientY < 14) continue
      const current = project.blocks.find(item => item.id === selfId)
      const width = current && current.look.width <= 80 ? current.look.width : 42
      const x = Math.round(Math.min(100 - width, Math.max(0, ((clientX - box.left) / (box.width || 1)) * 100 - width / 2)))
      const y = Math.round(Math.min(92, Math.max(0, ((clientY - box.top) / (box.height || 1)) * 100 - 8)))
      return { host: hostId, x, y, width }
    }
    const self = project.blocks.find(item => item.id === selfId)
    const parent = self?.look.host ? pageRef.current?.querySelector<HTMLElement>(`[data-story-frame="${self.look.host}"]`) : null
    if (self?.look.host && parent) {
      const box = parent.getBoundingClientRect()
      if (clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) {
        const x = Math.round(Math.min(100 - self.look.width, Math.max(0, ((clientX - box.left) / (box.width || 1)) * 100 - self.look.width / 2)))
        const y = Math.round(Math.min(92, Math.max(0, ((clientY - box.top) / (box.height || 1)) * 100 - 8)))
        return { host: self.look.host, x, y, width: self.look.width }
      }
    }
    return null
  }

  function startDrag(event: ReactPointerEvent, id: string) {
    if (!edit) return
    const target = event.target as HTMLElement
    if (target.closest('.story-ink, .story-handle, button, a, input, label, textarea, select')) return
    const block = project.blocks.find(item => item.id === id)
    if (!block) return
    event.stopPropagation()
    const originX = event.clientX
    const originY = event.clientY
    const frame = pageRef.current?.querySelector<HTMLElement>(`[data-story-frame="${id}"]`)
    const frameBox = frame?.getBoundingClientRect()
    const pageBox = pageRef.current?.getBoundingClientRect()
    const widthPct = Math.max(8, Math.min(92, Math.round(((frameBox?.width || 180) / (pageBox?.width || 1)) * 100)))
    const grabX = frameBox ? event.clientX - frameBox.left : 0
    const grabY = frameBox ? event.clientY - frameBox.top : 0
    let dragging = false
    const move = (pointer: PointerEvent) => {
      if (!dragging && Math.hypot(pointer.clientX - originX, pointer.clientY - originY) < 5) return
      dragging = true
      const box = pageRef.current?.getBoundingClientRect()
      if (!box || !pageRef.current) return
      const dragged = pageRef.current.querySelector<HTMLElement>(`[data-story-frame="${id}"]`)
      const others = [...pageRef.current.querySelectorAll<HTMLElement>('[data-story-frame]')].flatMap(node => node.dataset.storyFrame !== id && !dragged?.contains(node) && !node.contains(dragged) ? [node.getBoundingClientRect()] : [])
      const placed = measureGuides(pointer.clientX - grabX, pointer.clientY - grabY, frameBox?.width || 180, frameBox?.height || 80, others, box)
      setGuides(placed.guides)
      const x = ((placed.left - box.left) / box.width) * 100
      const y = placed.top - box.top
      edit.onLook(id, { host: 'sheet', x: Math.round(Math.max(0, Math.min(100 - widthPct, x))), py: Math.round(Math.max(0, y)), width: widthPct })
    }
    const up = (pointer: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setGuides([])
      setHostHint(null)
      setDropIndex(null)
      if (!dragging) return
      pageRef.current?.setAttribute('data-dragged', '1')
      const stack = hostAt(pointer.clientX, pointer.clientY, id)
      if (stack && stack.host !== 'sheet') {
        const z = Math.min(40, project.blocks.filter(item => item.look.host === stack.host).reduce((max, item) => Math.max(max, item.look.z || 1), 0) + 1)
        edit.onLook(id, { host: stack.host, x: stack.x, y: stack.y, width: Math.min(widthPct, stack.width), z })
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function startResize(event: ReactPointerEvent, id: string, edge: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se') {
    if (!edit) return
    event.preventDefault()
    event.stopPropagation()
    const block = project.blocks.find(item => item.id === id)
    const page = pageRef.current
    if (!block || !page) return
    const frame = event.currentTarget.parentElement
    if (!frame) return
    const frameBox = frame.getBoundingClientRect()
    const parent = block.look.host ? frame.parentElement : frame.closest('.story-flow') || page
    const parentBox = parent?.getBoundingClientRect()
    const parentWidth = parentBox?.width || 1
    const startX = event.clientX
    const startY = event.clientY
    const startWidthPx = frameBox.width
    const startHeightPx = frameBox.height
    const east = edge === 'e' || edge === 'ne' || edge === 'se'
    const west = edge === 'w' || edge === 'nw' || edge === 'sw'
    const north = edge === 'n' || edge === 'ne' || edge === 'nw'
    const south = edge === 's' || edge === 'se' || edge === 'sw'
    const move = (pointer: PointerEvent) => {
      const dx = pointer.clientX - startX
      const dy = pointer.clientY - startY
      let left = frameBox.left
      let top = frameBox.top
      let width = startWidthPx
      let height = startHeightPx
      if (east) width = Math.max(64, startWidthPx + dx)
      if (west) {
        width = Math.max(64, startWidthPx - dx)
        left = frameBox.right - width
      }
      if (south) height = Math.max(36, startHeightPx + dy)
      if (north) {
        height = Math.max(36, startHeightPx - dy)
        top = frameBox.bottom - height
      }
      const pageBox = page.getBoundingClientRect()
      const dragged = page.querySelector<HTMLElement>(`[data-story-frame="${id}"]`)
      const others = [...page.querySelectorAll<HTMLElement>('[data-story-frame]')].flatMap(node => node.dataset.storyFrame !== id && dragged && !dragged.contains(node) && !node.contains(dragged) ? [node.getBoundingClientRect()] : [])
      const placed = measureGuides(left, top, width, height, others, pageBox, { left: !west, right: !east, top: !north, bottom: !south })
      setGuides(placed.guides)
      const patch: Partial<StoryLook> = {}
      if (south || north) patch.h = Math.round(Math.min(1600, Math.max(36, placed.height)))
      if (north && block.look.host === 'sheet') patch.py = Math.round(Math.max(0, placed.top - pageBox.top))
      else if (north && block.look.host && parentBox) patch.y = Math.round(Math.max(0, Math.min(96, ((placed.top - parentBox.top) / (parentBox.height || 1)) * 100)))
      if (east || west) {
        const nextWidth = Math.round(Math.max(8, (placed.width / parentWidth) * 100))
        if (west && parentBox) {
          patch.x = Math.round(Math.max(0, Math.min(92, ((placed.left - parentBox.left) / parentWidth) * 100)))
          patch.width = Math.min(100 - patch.x, nextWidth)
        } else patch.width = Math.min(100 - block.look.x, nextWidth)
      }
      edit.onLook(id, patch)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setGuides([])
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function draw(block: StoryBlock): ReactNode {
    const placed = !block.look.host && (block.look.width < 100 || block.look.x > 0)
    const boxed = block.look.width < 100 || block.look.h > 0
    const typed = block.look.size > 0 || Boolean(block.look.font)
    const frameStyle = placeStyle(block.look)
    const animate = !edit && block.look.motion !== 'none'
    const seconds = Math.min(3, Math.max(0.2, (block.look.dur || 600) / 1000))
    const className = 'story-block' + (block.look.host ? ' is-float' : '') + (selectedId === block.id ? ' is-selected' : '') + (hostHint === block.id ? ' is-target' : '') + (block.look.align === 'center' ? ' is-center' : '') + (block.look.align === 'right' ? ' is-right' : '') + (placed ? ' is-placed' : '') + (boxed ? ' is-box' : '') + (block.look.h > 0 ? ' is-sized' : '') + (typed ? ' is-typed' : '')
    const style = block.look.size > 0 ? { ...frameStyle, ['--story-fs' as string]: `${block.look.size}px` } : frameStyle
    const body = <>
      {edit && <div className="story-drag-strip" onPointerDown={event => { event.stopPropagation(); startDrag(event, block.id) }} title="Sudrab joylang yoki boshqa element ustiga qo‘ying">⋮⋮</div>}
      {edit && selectedId === block.id && (['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'] as const).map(edge => <i key={edge} className={'story-handle ' + edge} onPointerDown={event => startResize(event, block.id, edge)}/>)}
      <div className="story-block-body" style={bodyStyle(block.look)}>
        <BlockBody block={block} locale={locale} edit={edit} partId={partId} partIndex={partIndex}/>
      </div>
      {project.blocks.filter(child => child.look.host === block.id).map(child => draw(child))}
    </>
    const handlers = {
      onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => startDrag(event, block.id),
      onClick: (event: ReactMouseEvent<HTMLDivElement>) => { event.stopPropagation(); pageRef.current?.removeAttribute('data-dragged'); onSelect?.(block.id) },
    }
    if (!animate) return <div key={block.id} data-story-frame={block.id} data-story-block={block.look.host ? undefined : block.id} className={className} style={style} {...handlers}>{body}</div>
    return <motion.div key={block.id} data-story-frame={block.id} data-story-block={block.look.host ? undefined : block.id} className={className} style={{ ...style, perspective: 800 }} {...handlers} initial={motionFrom(block.look.motion)} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0 }} viewport={{ once: true, amount: 0.15 }} transition={block.look.motion === 'bounce' ? { type: 'spring', duration: seconds, bounce: 0.35 } : { duration: seconds, ease: 'easeOut' }}>{body}</motion.div>
  }

  const flow = project.blocks.filter(block => {
    const host = block.look.host
    if (!host) return true
    if (host === 'cover' || host === 'sheet') return false
    return !project.blocks.some(item => item.id === host)
  })
  const line = hintIndex ?? dropIndex

  return <article
    ref={pageRef}
    className={'story-page' + (onSelect ? ' story-sheet' : '')}
    onDragOver={event => {
      if (!edit || !getPaletteDrag()) return
      event.preventDefault()
      setDropIndex(indexAt(event.clientX, event.clientY, nodes()))
    }}
    onDrop={event => {
      const type = getPaletteDrag()
      if (!edit || !type) return
      event.preventDefault()
      edit.onInsert(type, indexAt(event.clientX, event.clientY, nodes()))
      setDropIndex(null)
    }}
    onClick={event => {
      if (!edit || !onSelect) return
      if (pageRef.current?.hasAttribute('data-dragged')) {
        pageRef.current.removeAttribute('data-dragged')
        return
      }
      if ((event.target as HTMLElement).closest('[data-story-frame]')) return
      onSelect('')
    }}
  >
    {project.showCover !== false && <header data-story-frame="cover" className={'story-cover' + (selectedId === 'cover' ? ' is-selected' : '') + (hostHint === 'cover' ? ' is-target' : '')} style={{ background: project.color }} onClick={event => { event.stopPropagation(); pageRef.current?.removeAttribute('data-dragged'); onSelect?.('cover') }}>
      {project.image && <Image src={project.image} alt="" fill sizes="100vw" className="story-cover-img"/>}
      <ReplaceImage path="image" edit={edit} label="Muqova rasmi"/>
      {project.blocks.filter(block => block.look.host === 'cover').map(block => draw(block))}
      <div>
        {edit ? <span><Ink as="span" value={project.category} path="category" edit={edit} placeholder="Tur"/> · <Ink as="span" value={project.year} path="year" edit={edit} placeholder="Yil"/></span> : <span>{project.category} · {project.year}</span>}
        {edit ? <Ink as="h1" value={tx(project.title, locale)} path="title" edit={edit} placeholder="Loyiha nomi"/> : <h1>{tx(project.title, locale)}</h1>}
        {edit ? <Ink as="p" value={tx(project.result, locale)} path="result" edit={edit} placeholder="Qisqa natija" multiline/> : tx(project.result, locale) && <p>{tx(project.result, locale)}</p>}
        {edit ? <small><Ink as="span" value={tx(project.client, locale)} path="client" edit={edit} placeholder="Mijoz"/> · <Ink as="span" value={tx(project.industry, locale)} path="industry" edit={edit} placeholder="Soha"/> · <Ink as="span" value={tx(project.location, locale)} path="location" edit={edit} placeholder="Joylashuv"/></small> : <small>{[tx(project.client, locale), tx(project.industry, locale), tx(project.location, locale)].filter(Boolean).join(' · ')}</small>}
      </div>
    </header>}
    <div className="story-flow" style={edit && flowPad > 0 ? { marginTop: flowPad } : undefined}>
      {flow.map((block, index) => {
        const sized = block.look.width < 100 || block.look.x > 0
        return <div key={block.id} className={'story-flow-item' + (line === index ? ' is-drop' : '') + (block.look.flow === 'column' ? ' is-line' : '')} style={sized ? { width: `${block.look.width}%`, marginLeft: block.look.x > 0 ? `${block.look.x}%` : undefined } : undefined}>{draw(block)}</div>
      })}
      {!edit && project.blocks.filter(block => block.look.host === 'sheet').map(block => {
        const sized = block.look.width < 100 || block.look.x > 0
        const shown = { ...block, look: { ...block.look, host: '' } }
        return <div key={block.id} className={'story-flow-item' + (block.look.flow === 'column' ? ' is-line' : '')} style={sized ? { width: `${block.look.width}%`, marginLeft: block.look.x > 0 ? `${block.look.x}%` : undefined } : undefined}>{draw(shown)}</div>
      })}
      {edit && <div className={'story-flow-end' + (line === flow.length ? ' is-drop' : '')}/>}
    </div>
    {edit && project.blocks.filter(block => block.look.host === 'sheet').map(block => draw(block))}
    {guides.map((guide, index) => <i key={index} className="story-guide" style={{ left: guide.x, top: guide.y, width: Math.max(guide.w, 1), height: Math.max(guide.h, 1) }}>{guide.label && <span>{guide.label}</span>}</i>)}
  </article>
}
