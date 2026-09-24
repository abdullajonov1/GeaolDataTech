'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function LogoMark({ className = 'logo-mark' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo-mark.png" alt="" className={className} width={160} height={140} decoding="async" />
  )
}

export function Logo({ locale = 'uz' }: { locale?: string }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const dark = mounted && resolvedTheme === 'dark'
  const src = dark ? '/images/logo-horizontal-dark.png' : '/images/logo-horizontal.png'

  return (
    <Link href={`/${locale}`} className="brand" aria-label="GeoAI-Data Tech">
      {/* Native img avoids Next/Image recompression soft edges at small header size */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="GeoAI-Data Tech"
        width={986}
        height={93}
        className="brand-logo"
        decoding="async"
        fetchPriority="high"
      />
    </Link>
  )
}
