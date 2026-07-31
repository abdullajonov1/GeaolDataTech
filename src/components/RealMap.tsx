'use client'
import { useEffect, useRef } from 'react'
import { Map as MapLibreMap, Marker as MapLibreMarker, NavigationControl, type StyleSpecification } from 'maplibre-gl'

export type RealMapMarker={id:string;lng:number;lat:number;label:string}
export const projectCoordinates:Record<string,[number,number]>={
 'space-water-monitoring':[69.2401,41.2995],
 'space-agro-monitoring':[66.9597,39.6542],
 'xgt-online':[71.7843,40.3894]
}

const rasterStyle:StyleSpecification={
 version:8,
 sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},
 layers:[{id:'osm',type:'raster',source:'osm',paint:{'raster-opacity':.94,'raster-saturation':-.22,'raster-contrast':.08}}]
}

function markerKey(markers:RealMapMarker[]){
 return markers.map(m=>`${m.id}:${m.lng},${m.lat}`).join('|')
}

export function RealMap({markers,activeId,center=[68.5,41],zoom=4.2,onSelect,className=''}:{markers:RealMapMarker[];activeId?:string;center?:[number,number];zoom?:number;onSelect?:(id:string)=>void;className?:string}){
 const containerRef=useRef<HTMLDivElement>(null)
 const mapRef=useRef<MapLibreMap|null>(null)
 const markersRef=useRef<MapLibreMarker[]>([])
 const selectRef=useRef(onSelect)
 const markersSnapshot=useRef(markers)
 markersSnapshot.current=markers
 selectRef.current=onSelect

 useEffect(()=>{
  if(!containerRef.current)return
  const map=new MapLibreMap({container:containerRef.current,style:rasterStyle,center,zoom,attributionControl:{compact:true}})
  map.addControl(new NavigationControl({showCompass:true,showZoom:true}),'top-right')
  const place=(list:RealMapMarker[],active?:string)=>{
   markersRef.current.forEach(marker=>marker.remove())
   markersRef.current=list.map((marker,index)=>{
    const element=document.createElement('button')
    element.type='button'
    element.className='real-map-marker'+(marker.id===active?' active':'')
    element.dataset.markerId=marker.id
    element.setAttribute('aria-label',marker.label)
    element.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><i></i>`
    element.addEventListener('click',()=>selectRef.current?.(marker.id))
    return new MapLibreMarker({element,anchor:'center'}).setLngLat([marker.lng,marker.lat]).addTo(map)
   })
  }
  place(markers,activeId)
  mapRef.current=map
  return()=>{markersRef.current.forEach(marker=>marker.remove());markersRef.current=[];map.remove();mapRef.current=null}
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; later updates handled below
 },[])

 useEffect(()=>{
  const map=mapRef.current
  if(!map)return
  markersRef.current.forEach(marker=>marker.remove())
  markersRef.current=markers.map((marker,index)=>{
   const element=document.createElement('button')
   element.type='button'
   element.className='real-map-marker'+(marker.id===activeId?' active':'')
   element.dataset.markerId=marker.id
   element.setAttribute('aria-label',marker.label)
   element.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><i></i>`
   element.addEventListener('click',()=>selectRef.current?.(marker.id))
   return new MapLibreMarker({element,anchor:'center'}).setLngLat([marker.lng,marker.lat]).addTo(map)
  })
  map.jumpTo({center,zoom})
 },[markerKey(markers),center[0],center[1],zoom,activeId])

 useEffect(()=>{
  if(!containerRef.current||!mapRef.current)return
  containerRef.current.querySelectorAll<HTMLElement>('.real-map-marker').forEach(element=>element.classList.toggle('active',element.dataset.markerId===activeId))
  if(!activeId)return
  const marker=markersSnapshot.current.find(item=>item.id===activeId)
  if(marker)mapRef.current.flyTo({center:[marker.lng,marker.lat],zoom:Math.max(mapRef.current.getZoom(),zoom),duration:900,essential:true})
 },[activeId,zoom])

 return <div ref={containerRef} className={'real-map '+className} aria-label="Interactive geographic map"/>
}
