'use client'

import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'

function maxRadius(x: number, y: number) {
  const w = window.innerWidth
  const h = window.innerHeight
  return Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 48
}

export function switchThemeAnimated(
  setTheme: (theme: string) => void,
  next: 'light' | 'dark',
  event?: MouseEvent<HTMLElement>,
) {
  if (typeof document === 'undefined') {
    setTheme(next)
    return
  }

  const root = document.documentElement
  if (root.dataset.themeBusy === '1') return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTheme(next)
    return
  }

  const rect = event?.currentTarget?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 72
  const y = rect ? rect.top + rect.height / 2 : 42
  const r = maxRadius(x, y)

  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${r}px`)

  const apply = () => {
    flushSync(() => setTheme(next))
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      finished: Promise<void>
      ready: Promise<void>
    }
  }

  if (typeof doc.startViewTransition !== 'function') {
    apply()
    return
  }

  root.dataset.themeBusy = '1'
  // Freeze token morph so only the circular reveal runs (no second fade)
  root.classList.add('theme-no-morph')

  try {
    const transition = doc.startViewTransition(apply)
    transition.finished
      .catch(() => undefined)
      .finally(() => {
        root.classList.remove('theme-no-morph')
        delete root.dataset.themeBusy
        root.style.removeProperty('--theme-x')
        root.style.removeProperty('--theme-y')
        root.style.removeProperty('--theme-r')
      })
  } catch {
    apply()
    root.classList.remove('theme-no-morph')
    delete root.dataset.themeBusy
  }
}
