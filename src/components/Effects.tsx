'use client'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode, type MouseEvent } from 'react'
export function Reveal({children,className='',delay=0}:{children:ReactNode,className?:string,delay?:number}){const ref=useRef(null);const seen=useInView(ref,{once:true,margin:'-8%'});return <motion.div ref={ref} className={className} initial={{opacity:0,y:36}} animate={seen?{opacity:1,y:0}:{}} transition={{duration:.75,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>}
export function Magnetic({children,className=''}:{children:ReactNode,className?:string}){const x=useMotionValue(0),y=useMotionValue(0);const sx=useSpring(x,{stiffness:160,damping:18}),sy=useSpring(y,{stiffness:160,damping:18});const move=(e:MouseEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();x.set((e.clientX-r.left-r.width/2)*.14);y.set((e.clientY-r.top-r.height/2)*.14)};return <motion.div className={className} style={{x:sx,y:sy}} onMouseMove={move} onMouseLeave={()=>{x.set(0);y.set(0)}}>{children}</motion.div>}

