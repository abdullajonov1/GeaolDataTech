import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ServicesPage } from '@/components/ContentPages'
import { isLocale, type Locale } from '@/lib/i18n'
export const metadata:Metadata={title:'Services'}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <ServicesPage locale={locale as Locale}/>}

