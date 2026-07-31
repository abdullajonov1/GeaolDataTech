'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'

export function BackToTop({locale}:{locale:Locale}){
 const [visible,setVisible]=useState(false)
 useEffect(()=>{
  const onScroll=()=>setVisible(window.scrollY>420)
  onScroll()
  window.addEventListener('scroll',onScroll,{passive:true})
  return()=>window.removeEventListener('scroll',onScroll)
 },[])
 const goTop=()=>{
  const top=document.getElementById('top')
  if(top) top.scrollIntoView({behavior:'smooth'})
  else window.scrollTo({top:0,behavior:'smooth'})
 }
 return (
  <button
   type="button"
   className={'back-to-top '+(visible?'show':'')}
   onClick={goTop}
   aria-label={ui[locale].backToTop}
  >
   <ArrowUp/>
  </button>
 )
}
