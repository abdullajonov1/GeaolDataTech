import { notFound } from 'next/navigation'
import { PageHero, InteriorCTA } from '@/components/PageShell'
import { ProjectsGrid } from '@/components/ProjectsGrid'
import { isLocale, type Locale } from '@/lib/i18n'
import { listProjects } from '@/lib/projects-store'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Projects' }

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const projects = await listProjects()
  const copy = {
    uz: ['Bajarilgan loyihalar', 'Har bir karta — bitta ishga tushgan tizim. Nom, mijoz va natija ko‘rinadi. Batafsilini ochish uchun kartani bosing.'],
    ru: ['Выполненные проекты', 'Каждая карточка — одна запущенная система. Видны название, заказчик и результат. Нажмите карточку, чтобы открыть подробности.'],
    en: ['Delivered projects', 'Each card is one system in operation. You see the name, client, and outcome. Open a card for the full story.'],
  }[locale]
  return <>
    <PageHero locale={locale} index="04" eyebrow={locale === 'uz' ? 'LOYIHALAR' : locale === 'ru' ? 'ПРОЕКТЫ' : 'PROJECTS'} title={copy[0]} text={copy[1]}/>
    <ProjectsGrid locale={locale as Locale} projects={projects}/>
    <InteriorCTA locale={locale as Locale} title={locale === 'en' ? 'Your project could be next.' : locale === 'ru' ? 'Ваш проект может стать следующим.' : 'Keyingi loyiha sizniki bo‘lishi mumkin.'}/>
  </>
}
