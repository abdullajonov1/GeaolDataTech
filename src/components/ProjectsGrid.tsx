'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Grid2X2, Map, MapPin } from 'lucide-react'
import { projects, tx, ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'
import { projectCoordinates, RealMap } from './RealMap'

export function ProjectsGrid({locale}:{locale:Locale}){
 const t=ui[locale]
 const allLabel=t.all
 const categories=[allLabel,...new Set(projects.map(project=>project.category))]
 const [category,setCategory]=useState(allLabel)
 const [view,setView]=useState<'grid'|'map'>('grid')
 const router=useRouter()
 const visible=category===allLabel?projects:projects.filter(project=>project.category===category)
 const markers=useMemo(()=>visible.map(project=>{
  const [lng,lat]=projectCoordinates[project.slug]
  return {id:project.slug,lng,lat,label:tx(project.title,locale)}
 }),[visible,locale,allLabel])

 return <section className="projects-browser">
  <div className="project-toolbar">
   <div>{categories.map(item=><button className={category===item?'active':''} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div>
   <span>
    <button className={view==='grid'?'active':''} onClick={()=>setView('grid')} aria-label={t.gridView}><Grid2X2/></button>
    <button className={view==='map'?'active':''} onClick={()=>setView('map')} aria-label={t.mapView}><Map/></button>
   </span>
  </div>
  {view==='grid'
   ?<motion.div layout className="projects-grid"><AnimatePresence>{visible.map((project,index)=><motion.div layout initial={{opacity:0,scale:.94}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.94}} key={project.slug}>
    <Link href={`/${locale}/projects/${project.slug}`}>
     <div className="case-visual" style={{background:project.color}}>
      <Image src={project.image} alt={tx(project.title,locale)} fill sizes="(max-width:900px) 100vw, 50vw" className="case-visual-img"/>
      <span>0{index+1}</span>
     </div>
     <small>{project.category} · {project.year}</small>
     <h2>{tx(project.title,locale)}</h2>
     <p><MapPin/>{tx(project.location,locale)}</p>
     <strong>{tx(project.result,locale)}</strong><ArrowUpRight/>
    </Link>
   </motion.div>)}</AnimatePresence></motion.div>
   :<div className="projects-map-view real-projects-map">
    <RealMap key={category} markers={markers} center={[69.5,41]} zoom={4.2} onSelect={id=>router.push(`/${locale}/projects/${id}`)}/>
    <div className="map-view-legend"><span>{locale==='uz'?'JONLI LOYIHALAR INDEKSI':locale==='ru'?'ЖИВОЙ ИНДЕКС ПРОЕКТОВ':'LIVE PROJECT INDEX'}</span><b>{visible.length} {t.locations.toUpperCase()}</b></div>
   </div>}
 </section>
}
