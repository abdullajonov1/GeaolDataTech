import Link from 'next/link'
import { ArrowUpRight } from '@/components/icons'
import { Reveal } from './Effects'
import { ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'
export function PageHero({locale:_locale,index,eyebrow,title,text}:{locale:Locale,index:string,eyebrow:string,title:string,text:string}){return <section className="page-hero"><div className="page-hero-grid"/><div className="page-orbit"/><span className="page-index">{index}</span><Reveal><span className="section-label">/ {index} — {eyebrow}</span><h1>{title}</h1><p>{text}</p></Reveal><div className="hero-axis">N 41°18' · E 69°14'</div></section>}
export function InteriorCTA({locale,title}:{locale:Locale,title:string}){return <section className="interior-cta"><div className="cta-grid"/><Reveal><span>GEODATA / NEXT COORDINATE</span><h2>{title}</h2><Link href={`/${locale}/contact`}>{ui[locale].start}<ArrowUpRight/></Link></Reveal></section>}
export function Breadcrumb({locale,current}:{locale:Locale,current:string}){return <div className="breadcrumb"><Link href={`/${locale}`}>GEODATA</Link><span>/</span><b>{current}</b></div>}

