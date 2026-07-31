'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Soft geospatial atmosphere that drifts with scroll —
 * ambient glows + shifting grid, never a “character” on top of content.
 */
export function ScrollAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(
      '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
    )
    const sync = () => setOn(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!on) return
    let raf = 0
    let current = 0
    let target = 0

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      target = window.scrollY / max
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      current += (target - current) * 0.06
      const el = rootRef.current
      if (el) {
        el.style.setProperty('--sa-p', current.toFixed(4))
        el.style.setProperty('--sa-y', `${(current * -18).toFixed(2)}vh`)
        el.style.setProperty('--sa-x', `${(Math.sin(current * Math.PI * 2) * 4).toFixed(2)}vw`)
        el.style.setProperty('--sa-rot', `${(current * 12).toFixed(2)}deg`)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [on])

  if (!on) return null

  return (
    <div ref={rootRef} className="scroll-atmosphere" aria-hidden>
      <span className="sa-glow sa-a" />
      <span className="sa-glow sa-b" />
      <span className="sa-glow sa-c" />
      <span className="sa-orbit" />
      <span className="sa-grid" />
    </div>
  )
}
