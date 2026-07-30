import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from '@/components/icons'
import { projects, tx, ui } from '@/data/site'
import { isLocale, locales, type Locale } from '@/lib/i18n'
import { Reveal } from '@/components/Effects'
import { InteriorCTA } from '@/components/PageShell'

export function generateStaticParams(){return locales.flatMap(locale=>projects.map(p=>({locale,slug:p.slug})))}
export async function generateMetadata({params}:{params:Promise<{locale:string,slug:string}>}){
 const {locale,slug}=await params
 const p=projects.find(x=>x.slug===slug)
 return {title:p?tx(p.title,locale as Locale):'Project'}
}

const labels={
 uz:{location:'JOYLASHUV',industry:'SOHA',client:'MIJOZ TURI',overview:'UMUMIY KO‘RINISH',challenge:'01 / MUAMMO',solution:'02 / YECHIM',architecture:'TIZIM ARXITEKTURASI',architectureTitle:'Harakat uchun mo‘ljallangan ma’lumotlar.',results:'O‘LCHANADIGAN NATIJALAR',stack:'Texnologik stack',gallery:'LOYIHA EKRANLARI',cta:'Keyingi case study’ni birga yarataylik.'},
 ru:{location:'ЛОКАЦИЯ',industry:'ОТРАСЛЬ',client:'ТИП КЛИЕНТА',overview:'ОБЗОР',challenge:'01 / ЗАДАЧА',solution:'02 / РЕШЕНИЕ',architecture:'АРХИТЕКТУРА СИСТЕМЫ',architectureTitle:'Данные, спроектированные для действий.',results:'ИЗМЕРИМЫЕ РЕЗУЛЬТАТЫ',stack:'Технологический стек',gallery:'ЭКРАНЫ ПРОЕКТА',cta:'Создадим следующий кейс вместе.'},
 en:{location:'LOCATION',industry:'INDUSTRY',client:'CLIENT TYPE',overview:'OVERVIEW',challenge:'01 / CHALLENGE',solution:'02 / SOLUTION',architecture:'SYSTEM ARCHITECTURE',architectureTitle:'Data engineered for action.',results:'MEASURABLE RESULTS',stack:'Technology stack',gallery:'PROJECT SCREENS',cta:'Build the next case study with us.'}
}

export default async function Page({params}:{params:Promise<{locale:string,slug:string}>}){
 const {locale,slug}=await params
 if(!isLocale(locale))notFound()
 const p=projects.find(x=>x.slug===slug)
 if(!p)notFound()
 const t=ui[locale]
 const c=labels[locale]
 return <>
  <section className="case-hero" style={{'--case-color':p.color} as React.CSSProperties}>
   <div className="case-grid"/><div className="case-contours"/>
   <Link href={`/${locale}/projects`}><ArrowLeft/>{t.back}</Link>
   <span>{p.category} · {p.year}</span>
   <h1>{tx(p.title,locale)}</h1>
   <div className="case-meta">
    <div><small>{c.location}</small><b>{tx(p.location,locale)}</b></div>
    <div><small>{c.industry}</small><b>{tx(p.industry,locale)}</b></div>
    <div><small>{c.client}</small><b>{tx(p.client,locale)}</b></div>
   </div>
  </section>

  <section className="case-gallery">
   <span className="section-label">/ {c.gallery}</span>
   <div className="case-gallery-grid">
    {p.gallery.map((src,i)=>(
     <figure key={src} className="case-shot">
      <Image src={src} alt={`${tx(p.title,locale)} — ${i+1}`} width={1440} height={900} sizes="(max-width:900px) 100vw, 50vw" priority={i===0}/>
     </figure>
    ))}
   </div>
  </section>

  <section className="case-overview">
   <Reveal><span className="section-label">/ {c.overview}</span><h2>{tx(p.result,locale)}</h2></Reveal>
   <div>
    <p>{tx(p.summary,locale)}</p>
    <ul>{p.features.map(x=><li key={x.en}><CheckCircle2/>{tx(x,locale)}</li>)}</ul>
   </div>
  </section>

  <section className="challenge-solution">
   <article><span>{c.challenge}</span><h2>{tx(p.challengeTitle,locale)}</h2><p>{tx(p.challenge,locale)}</p></article>
   <article><span>{c.solution}</span><h2>{tx(p.solutionTitle,locale)}</h2><p>{tx(p.solution,locale)}</p></article>
  </section>

  <section className="system-architecture">
   <div className="section-head light"><Reveal><span className="section-label">/ {c.architecture}</span><h2>{c.architectureTitle}</h2></Reveal></div>
   <div className="flow-diagram">
    {p.flow.flatMap((step,i)=>i===0
     ?[<div key={step.en}>{tx(step,locale)}</div>]
     :[<i key={'sep-'+i}/>,<div key={step.en}>{tx(step,locale)}</div>]
    )}
   </div>
  </section>

  <section className="case-results">
   <span className="section-label">/ {c.results}</span>
   <div>{p.stats.map(([value,label])=><article key={label.en}><strong>{value}</strong><span>{tx(label,locale)}</span></article>)}</div>
  </section>

  <section className="case-stack">
   <h2>{c.stack}</h2>
   <div>{p.stack.map(x=><span key={x}>{x}</span>)}</div>
  </section>

  <InteriorCTA locale={locale} title={c.cta}/>
 </>
}
