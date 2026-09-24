'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function LogoMark({ className = 'logo-mark' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo-globe.png" alt="" className={className} width={280} height={256} decoding="async" />
  )
}

export function Logo({ locale = 'uz' }: { locale?: string }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = !mounted || resolvedTheme !== 'light'
  const blue = dark ? '#4da3ff' : '#0c3d8f'
  const green = dark ? '#3dde7a' : '#128a45'

  return (
    <Link href={`/${locale}`} className="brand" aria-label="GeoAI-Data Tech">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-globe.png" alt="" className="brand-globe" width={280} height={256} decoding="async" />
      <svg className="brand-word" viewBox="0 0 268 32" role="img" aria-hidden="true">
        <text
          x="0"
          y="24"
          fontFamily="Montserrat, 'Space Grotesk', sans-serif"
          fontSize="22"
          fontWeight="800"
          letterSpacing="-0.045em"
        >
          <tspan fill={blue}>GeoAI-Data</tspan>
          <tspan fill={green} dx="6">Tech</tspan>
        </text>
      </svg>
    </Link>
  )
}
