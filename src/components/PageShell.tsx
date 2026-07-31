'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from '@/components/icons'
import { Reveal } from './Effects'
import { ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'

export function PageHero({
  locale: _locale,
  index,
  eyebrow,
  title,
  text,
}: {
  locale: Locale
  index: string
  eyebrow: string
  title: string
  text: string
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const indexY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 50])

  return (
    <section className="page-hero" ref={ref}>
      <motion.div className="page-hero-grid" style={{ y: gridY }} />
      <motion.div className="page-orbit" style={{ y: orbitY }} />
      <motion.span className="page-index" style={{ y: indexY }}>
        {index}
      </motion.span>
      <motion.div style={{ y: copyY }}>
        <Reveal from="up">
          <span className="section-label">
            / {index} — {eyebrow}
          </span>
          <h1>{title}</h1>
          <p>{text}</p>
        </Reveal>
      </motion.div>
      <div className="hero-axis">N 41°18&apos; · E 69°14&apos;</div>
    </section>
  )
}

export function InteriorCTA({
  locale,
  title,
}: {
  locale: Locale
  title: string
}) {
  return (
    <section className="interior-cta">
      <div className="cta-grid" />
      <Reveal from="scale">
        <span>GEODATA / NEXT COORDINATE</span>
        <h2>{title}</h2>
        <Link href={`/${locale}/contact`}>
          {ui[locale].start}
          <ArrowUpRight />
        </Link>
      </Reveal>
    </section>
  )
}

export function Breadcrumb({
  locale,
  current,
}: {
  locale: Locale
  current: string
}) {
  return (
    <div className="breadcrumb">
      <Link href={`/${locale}`}>GEODATA</Link>
      <span>/</span>
      <b>{current}</b>
    </div>
  )
}
