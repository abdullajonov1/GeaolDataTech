'use client'
import Link from 'next/link'
import { ArrowUp, Mail, MapPinned, Phone } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Logo } from './Logo'
import { company, navSlugs, ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'
export function Footer({locale}:{locale:Locale}){
 const t=ui[locale];const [sent,setSent]=useState(false);const submit=(e:FormEvent)=>{e.preventDefault();setSent(true)}
 return <footer className="footer"><div className="footer-grid-bg"/><div className="footer-top"><div><Logo locale={locale}/><p>{company.description[locale]}</p></div><nav>{t.nav.slice(1,7).map((v,i)=><Link key={v} href={`/${locale}/${navSlugs[i+1]}`}>{v}</Link>)}</nav><div className="footer-contact"><a href={`mailto:${company.email}`}><Mail/>{company.email}</a><a href={`tel:${company.phone.replace(/\s/g,'')}`}><Phone/>{company.phone}</a><span><MapPinned/>{company.address[locale]}</span></div></div>
 <div className="newsletter"><div><span>40°–50° N / GEOSPATIAL SIGNAL</span><h3>{t.newsletter}</h3></div><form onSubmit={submit}><input required type="email" aria-label={t.email} placeholder={t.email}/><button>{sent?<span>✓</span>:t.subscribe}</button></form></div>
 <div className="footer-bottom"><span>© {new Date().getFullYear()} GeoAIData Tech. {t.rights}</span><div><Link href={`/${locale}/privacy-policy`}>{t.privacy}</Link><Link href={`/${locale}/terms`}>{t.terms}</Link><a href="#top" aria-label={t.back}><ArrowUp/></a></div></div></footer>
}

