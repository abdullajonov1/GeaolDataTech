import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AboutPage } from '@/components/ContentPages'
import { isLocale, type Locale } from '@/lib/i18n'
export const metadata:Metadata={title:'About'}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <AboutPage locale={locale as Locale}/>}

