import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from '@/components/icons'
import { ui } from '@/data/site'
import { isLocale, type Locale } from '@/lib/i18n'
import { getProject } from '@/lib/projects-store'
import { StoryView } from '@/components/StoryView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params
  const project = await getProject(slug)
  return { title: project ? project.title[locale as Locale] || project.title.uz : 'Project' }
}

export default async function Page({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const project = await getProject(slug)
  if (!project) notFound()
  return <>
    <Link className="story-back" href={`/${locale}/projects`}><ArrowLeft/>{ui[locale].back}</Link>
    <StoryView project={project} locale={locale}/>
  </>
}
