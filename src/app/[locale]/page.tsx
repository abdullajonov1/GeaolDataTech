import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Home } from '@/components/Home'
import { isLocale, type Locale } from '@/lib/i18n'
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;const d={uz:['Geoaxborot tizimlari va ArcGIS yechimlari','GIS tizimlari, geoportallar va web platformalar.'],ru:['Геоинформационные системы и решения ArcGIS','GIS-системы, геопорталы и веб-платформы.'],en:['GIS Systems and ArcGIS Solutions','GIS systems, geoportals, and enterprise web platforms.']}[locale]||[];return {title:d[0],description:d[1],alternates:{canonical:`/${locale}`,languages:{uz:'/uz',ru:'/ru',en:'/en'}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <Home locale={locale as Locale}/>}

