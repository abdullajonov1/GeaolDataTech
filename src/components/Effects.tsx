'use client'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode, type MouseEvent } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  from?: 'up' | 'left' | 'right' | 'scale'
}

const initialMap = {
  up: { opacity: 0, y: 40 },
  left: { opacity: 0, x: -36 },
  right: { opacity: 0, x: 36 },
  scale: { opacity: 0, y: 24, scale: 0.96 },
}

const visibleMap = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, y: 0, scale: 1 },
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  from = 'up',
}: RevealProps) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initialMap[from]}
      animate={seen ? visibleMap[from] : undefined}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Magnetic({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 160, damping: 18 })
  const sy = useSpring(y, { stiffness: 160, damping: 18 })
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.14)
    y.set((e.clientY - r.top - r.height / 2) * 0.14)
  }
  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={move}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
