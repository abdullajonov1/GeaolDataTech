import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CareersPage } from '@/components/ContentPages'
import { isLocale, type Locale } from '@/lib/i18n'
export const metadata:Metadata={title:'Careers'}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <CareersPage locale={locale as Locale}/>}

