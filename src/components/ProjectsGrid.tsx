'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { tx, ui } from '@/data/site'
import type { StoryProject } from '@/lib/story'
import type { Locale } from '@/lib/i18n'

export function ProjectsGrid({ locale, projects }: { locale: Locale, projects: StoryProject[] }) {
  const t = ui[locale]
  const categories = ['', ...new Set(projects.map(project => project.category))]
  const [category, setCategory] = useState('')
  const visible = category ? projects.filter(project => project.category === category) : projects
  const labels = { uz: 'Barchasi', ru: 'Все', en: 'All' }

  return <section className="projects-browser">
    <div className="project-toolbar">
      <div>{categories.map(item => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item || 'all'}>{item || labels[locale]}</button>)}</div>
      <span>{visible.length} {locale === 'ru' ? 'проектов' : locale === 'en' ? 'projects' : 'loyiha'}</span>
    </div>
    <div className="projects-grid">{visible.map(project => <article key={project.slug}>
      <Link href={`/${locale}/projects/${project.slug}`}>
        <div className="case-visual" style={{ background: project.color }}>
          {project.image && <Image src={project.image} alt={tx(project.title, locale)} fill sizes="(max-width:900px) 100vw, 50vw" className="case-visual-img"/>}
        </div>
        <small>{project.category} · {project.year}</small>
        <h2>{tx(project.title, locale)}</h2>
        <p>{tx(project.client, locale)} · {tx(project.industry, locale)}</p>
        <strong>{tx(project.result, locale)}</strong>
        <span className="project-open">{t.view}<ArrowUpRight/></span>
      </Link>
    </article>)}</div>
  </section>
}
