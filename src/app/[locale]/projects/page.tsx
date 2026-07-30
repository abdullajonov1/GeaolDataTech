import { notFound } from 'next/navigation'
import { PageHero, InteriorCTA } from '@/components/PageShell'
import { ProjectsGrid } from '@/components/ProjectsGrid'
import { isLocale, type Locale } from '@/lib/i18n'
export const metadata={title:'Projects'}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const c={uz:['Amalda ishlayotgan GIS va dashboard loyihalari.','Suv xo‘jaligi, qishloq xo‘jaligi va gaz tashkiloti uchun yaratilgan raqamli platformalar.'],ru:['Реализованные GIS и dashboard-проекты.','Цифровые платформы для водного хозяйства, сельского хозяйства и газовой организации.'],en:['Delivered GIS and dashboard projects.','Digital platforms built for water management, agriculture, and a gas organization.']}[locale];return <><PageHero locale={locale} index="04" eyebrow={locale==='uz'?'LOYIHALAR':locale==='ru'?'ПРОЕКТЫ':'PROJECTS'} title={c[0]} text={c[1]}/><ProjectsGrid locale={locale as Locale}/><InteriorCTA locale={locale as Locale} title={locale==='en'?'Your project could be the next coordinate.':locale==='ru'?'Ваш проект может стать следующей координатой.':'Loyihangiz keyingi koordinata bo‘lishi mumkin.'}/></>}

