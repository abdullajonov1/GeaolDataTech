import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { isLocale, locales, type Locale } from '@/lib/i18n'
import { company } from '@/data/site'
export function generateStaticParams(){return locales.map(locale=>({locale}))}
export default async function LocaleLayout({children,params}:{children:React.ReactNode,params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const schema={'@context':'https://schema.org','@type':'Organization',name:company.name,url:`https://geoldatatech.uz/${locale}`,email:company.email,telephone:company.phone,address:{'@type':'PostalAddress',addressLocality:'Tashkent',addressCountry:'UZ'}};return <div id="top"><Header locale={locale as Locale}/><main>{children}</main><Footer locale={locale as Locale}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/></div>}

