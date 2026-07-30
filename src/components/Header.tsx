'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { ArrowUpRight, Check, ChevronDown, Menu, Moon, Sun, X } from 'lucide-react'
import { Logo } from './Logo'
import { navSlugs, services, tx, ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'

const languageNames:Record<Locale,string>={uz:'O‘zbekcha',ru:'Русский',en:'English'}

export function Header({locale}:{locale:Locale}){
 const [open,setOpen]=useState(false)
 const [mega,setMega]=useState<string|null>(null)
 const [langOpen,setLangOpen]=useState(false)
 const [scrolled,setScrolled]=useState(false)
 const [mounted,setMounted]=useState(false)
 const {setTheme,resolvedTheme}=useTheme()
 const pathname=usePathname()
 const router=useRouter()
 const activeLocale=(pathname.split('/')[1] as Locale)||locale
 const t=ui[activeLocale]

 useEffect(()=>setMounted(true),[])
 useEffect(()=>{document.documentElement.lang=activeLocale},[activeLocale])
 useEffect(()=>{const fn=()=>setScrolled(scrollY>24);addEventListener('scroll',fn,{passive:true});return()=>removeEventListener('scroll',fn)},[])
 useEffect(()=>{document.body.style.overflow=open?'hidden':'';return()=>{document.body.style.overflow=''}},[open])
 const changeLocale=(next:Locale)=>{
  document.documentElement.lang=next
  document.cookie=`gdt-locale=${next};path=/;max-age=31536000;samesite=lax`
  router.push(pathname.replace(/^\/(uz|ru|en)/,`/${next}`))
 }

 return <header className={'header '+(scrolled?'scrolled':'')} onMouseLeave={()=>setMega(null)}>
  <Logo locale={activeLocale}/>
  <nav className="desktop-nav">{t.nav.map((label,i)=>{
   if(i===0)return null
   const hasMega=i===2
   return <div key={label} onMouseEnter={()=>setMega(hasMega?'services':null)}><Link href={`/${activeLocale}/${navSlugs[i]}`}>{label}{hasMega&&<ChevronDown size={13}/>}</Link></div>
  })}</nav>
  <div className="header-tools">
   <div className={'locale-switch '+(langOpen?'is-open':'')}>
    <button className="locale-trigger" onClick={()=>setLangOpen(!langOpen)} aria-expanded={langOpen} aria-haspopup="listbox">
     <span>{activeLocale.toUpperCase()}</span><ChevronDown size={13}/>
    </button>
    {langOpen&&<div className="locale-menu" role="listbox" aria-label={t.language}>
     <div className="locale-menu-label">{t.language}</div>
     {(['uz','ru','en'] as Locale[]).map(lang=><button className={lang===activeLocale?'active':''} role="option" aria-selected={lang===activeLocale} key={lang} onClick={()=>{changeLocale(lang);setLangOpen(false)}}>
      <span className="locale-code">{lang.toUpperCase()}</span>
      <span className="locale-name">{languageNames[lang]}</span>
      <span className="locale-check">{lang===activeLocale&&<Check size={14}/>}</span>
     </button>)}
    </div>}
   </div>
   <button className="round-button" aria-label={t.theme} onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}>{mounted&&(resolvedTheme==='dark'?<Sun/>:<Moon/>)}</button>
   <Link className="header-cta" href={`/${activeLocale}/contact`}>{t.start}<ArrowUpRight/></Link>
   <button className="mobile-toggle" aria-label={open?t.close:t.menu} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
  </div>
  <div className={'mega-menu '+(mega?'show':'')}>{mega&&<>
   <div className="mega-intro"><span>GEODATA / SERVICES</span><h3>{t.nav[2]}</h3><Link href={`/${activeLocale}/services`}>{t.view}<ArrowUpRight/></Link></div>
   <div className="mega-links">{services.slice(0,6).map((item,i)=><Link href={`/${activeLocale}/services#${item.slug}`} key={item.slug}><small>0{i+1}</small><span>{tx(item.title,activeLocale)}</span><ArrowUpRight/></Link>)}</div>
  </>}</div>
  <div className={'mobile-panel '+(open?'open':'')}>
   <div className="mobile-links">{t.nav.map((label,i)=><Link key={label} onClick={()=>setOpen(false)} href={`/${activeLocale}${navSlugs[i]?'/'+navSlugs[i]:''}`}><small>0{i+1}</small><span>{label}</span><ArrowUpRight/></Link>)}</div>
   <Link className="mobile-cta" onClick={()=>setOpen(false)} href={`/${activeLocale}/contact`}>{t.start}<ArrowUpRight/></Link>
  </div>
 </header>
}
