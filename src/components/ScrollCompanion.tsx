'use client'

import { useEffect, useRef, useState } from 'react'

type Pt = { x: number; y: number }

/**
 * Smooth shooting-star: Catmull-Rom weave, soft ribbon trail.
 * No obstacle snapping (that made motion jagged).
 */
export function ScrollCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let p = 0
    let target = 0
    let dir = 1
    let lastDir = 1
    let idleFrames = 0
    let trailAlpha = 1
    let x = 0
    let y = 0
    let px = 0
    let py = 0
    const trail: Pt[] = []
    const MAX = 72

    // Wider, gentler L↔R arcs (fewer sharp control bends)
    const keys: Pt[] = [
      { x: 0.1, y: 0.12 },
      { x: 0.28, y: 0.2 },
      { x: 0.72, y: 0.3 },
      { x: 0.82, y: 0.42 },
      { x: 0.35, y: 0.52 },
      { x: 0.18, y: 0.62 },
      { x: 0.7, y: 0.72 },
      { x: 0.86, y: 0.84 },
    ]

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      target = window.scrollY / max
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    {
      const s0 = catmullRom(keys, 0)
      x = px = s0.x * window.innerWidth
      y = py = s0.y * window.innerHeight
    }

    const read = (name: string, fallback: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

    const tick = () => {
      const delta = target - p
      const moving = Math.abs(delta) > 0.00025
      p += delta * 0.07

      if (moving) {
        if (Math.abs(delta) > 0.0003) dir = delta >= 0 ? 1 : -1
        if (dir !== lastDir) {
          trail.length = 0
          lastDir = dir
        }
        idleFrames = 0
        trailAlpha += (1 - trailAlpha) * 0.22
      } else {
        idleFrames++
        if (idleFrames > 10) {
          trailAlpha += (0 - trailAlpha) * 0.05
          if (trail.length > 3) trail.splice(0, Math.max(1, Math.ceil(trail.length * 0.05)))
          else trail.length = 0
        }
      }

      const s = catmullRom(keys, p)
      const tx = s.x * window.innerWidth
      const ty = s.y * window.innerHeight
      // Heavy smoothing — continuous curve, no kinks
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12

      const spd = Math.hypot(x - px, y - py)
      if (moving && spd > 0.35) {
        trail.push({ x, y })
        while (trail.length > MAX) trail.shift()
      } else if (trail.length) {
        const tip = trail[trail.length - 1]
        tip.x += (x - tip.x) * 0.15
        tip.y += (y - tip.y) * 0.15
      }
      const vx = x - px
      const vy = y - py
      px = x
      py = y

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (p <= 0.006 || p >= 0.994) {
        raf = requestAnimationFrame(tick)
        return
      }

      const cyan = read('--cyan', '#00c8ff')
      const bright = read('--bright', '#42dfff')
      const green = read('--green', '#4ade80')

      // Triple Chaikin → very soft ribbon
      const ribbon = chaikin(chaikin(trail, 2), 2)
      if (ribbon.length > 5 && trailAlpha > 0.02) {
        ctx.save()
        ctx.globalAlpha = trailAlpha
        strokeTrail(ctx, ribbon, {
          width: 14,
          color: cyan,
          alpha: 0.12,
          blur: 12,
        })
        strokeTrail(ctx, ribbon, {
          width: 5,
          color: bright,
          alpha: 0.75,
          blur: 0,
        })
        strokeTrail(ctx, ribbon, {
          width: 1.8,
          color: '#ffffff',
          alpha: 0.95,
          blur: 0,
        })
        // soft green whisper
        strokeTrail(ctx, offsetTrail(ribbon, 1.1), {
          width: 2,
          color: green,
          alpha: 0.22,
          blur: 2,
        })
        ctx.restore()
      }

      drawHead(ctx, x, y, vx, vy, bright, cyan, idleFrames > 10)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [on])

  if (!on) return null
  return <canvas ref={canvasRef} className="scroll-star-canvas" aria-hidden />
}

/** One continuous curved stroke — no segment joins */
function strokeTrail(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  opt: { width: number; color: string; alpha: number; blur: number },
) {
  if (pts.length < 3) return
  ctx.save()
  if (opt.blur) ctx.filter = `blur(${opt.blur}px)`
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = hexAlpha(opt.color, opt.alpha)
  ctx.lineWidth = opt.width
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2
    const midY = (pts[i].y + pts[i + 1].y) / 2
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY)
  }
  const last = pts[pts.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
  ctx.restore()
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vx: number,
  vy: number,
  bright: string,
  cyan: string,
  idle: boolean,
) {
  const ang = Math.atan2(vy, vx || 0.001)
  const pulse = idle ? 1 + Math.sin(performance.now() / 700) * 0.07 : 1

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * pulse)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.22, hexAlpha(bright, 0.55))
  g.addColorStop(0.55, hexAlpha(cyan, 0.18))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, 30 * pulse, 0, Math.PI * 2)
  ctx.fill()

  // Soft elongated coma
  ctx.save()
  ctx.scale(1.25, 0.72)
  const c = ctx.createRadialGradient(0, 0, 0, 0, 0, 12)
  c.addColorStop(0, 'rgba(255,255,255,0.7)')
  c.addColorStop(0.5, hexAlpha(bright, 0.45))
  c.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = c
  ctx.beginPath()
  ctx.arc(0, 0, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 4)
  core.addColorStop(0, '#fff')
  core.addColorStop(0.5, bright)
  core.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(0, 0, 4 * pulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function catmullRom(pts: Pt[], t: number): Pt {
  const n = pts.length - 1
  const clamped = Math.min(Math.max(t, 0), 0.999999)
  const f = clamped * n
  const i = Math.floor(f)
  const u = f - i
  const p0 = pts[Math.max(0, i - 1)]
  const p1 = pts[i]
  const p2 = pts[Math.min(pts.length - 1, i + 1)]
  const p3 = pts[Math.min(pts.length - 1, i + 2)]
  const u2 = u * u
  const u3 = u2 * u
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * u +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * u +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
  }
}

function chaikin(pts: Pt[], passes = 2): Pt[] {
  if (pts.length < 3) return pts
  let cur = pts
  for (let p = 0; p < passes; p++) {
    const next: Pt[] = [cur[0]]
    for (let i = 0; i < cur.length - 1; i++) {
      const a = cur[i]
      const b = cur[i + 1]
      next.push(
        { x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 },
        { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 },
      )
    }
    next.push(cur[cur.length - 1])
    cur = next
  }
  return cur
}

function offsetTrail(pts: Pt[], amount: number): Pt[] {
  if (pts.length < 2) return pts
  return pts.map((pt, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    return { x: pt.x - (dy / len) * amount, y: pt.y + (dx / len) * amount }
  })
}

function hexAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  const c = color.trim()
  if (c.startsWith('#')) {
    const h = c.slice(1)
    const full =
      h.length === 3
        ? h
            .split('')
            .map((x) => x + x)
            .join('')
        : h.slice(0, 6)
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    if ([r, g, b].every((n) => !Number.isNaN(n))) return `rgba(${r},${g},${b},${a})`
  }
  if (c.startsWith('rgb')) {
    return c.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
      const parts = String(inner)
        .split(',')
        .map((x) => x.trim())
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`
    })
  }
  return c
}
