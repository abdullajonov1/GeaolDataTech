'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { projects, tx, ui } from '@/data/site'
import type { Locale } from '@/lib/i18n'
import { projectCoordinates, RealMap } from './RealMap'

export function ProjectMap({locale}:{locale:Locale}){
 const [active,setActive]=useState(0)
 const markers=useMemo(()=>projects.map(project=>{
  const [lng,lat]=projectCoordinates[project.slug]
  return {id:project.slug,lng,lat,label:tx(project.title,locale)}
 }),[locale])
 const project=projects[active]
 const selectProject=(id:string)=>{const index=projects.findIndex(item=>item.slug===id);if(index>=0)setActive(index)}

 return <div className="project-map">
  <div className="map-surface">
   <RealMap markers={markers} activeId={project.slug} onSelect={selectProject} center={[69.2,41.1]} zoom={4.3}/>
   <div className="map-coordinate-badge">WGS 84 · EPSG:4326</div>
  </div>
  <div className="map-project">
   <span>{project.category} · {project.year}</span>
   <h3>{tx(project.title,locale)}</h3>
   <p><MapPin/> {tx(project.location,locale)}</p>
   <strong>{tx(project.result,locale)}</strong>
   <Link href={`/${locale}/projects/${project.slug}`}>{ui[locale].view}<ArrowUpRight/></Link>
  </div>
 </div>
}
