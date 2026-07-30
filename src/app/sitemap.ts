import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { projects } from '@/data/site'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://geoldatatech.uz'
  const pages = ['', 'about', 'services', 'projects', 'technologies', 'careers', 'contact', 'privacy-policy', 'terms']
  const staticPages = locales.flatMap(locale => pages.map(page => ({ url: `${base}/${locale}${page ? '/' + page : ''}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: page ? 0.8 : 1 })))
  const projectPages = locales.flatMap(locale => projects.map(project => ({ url: `${base}/${locale}/projects/${project.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })))
  return [...staticPages, ...projectPages]
}