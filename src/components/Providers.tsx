'use client'
import { ThemeProvider } from 'next-themes'
import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { motion, useScroll, useSpring } from 'framer-motion'

function SmoothScroll({children}:{children:ReactNode}){
  useEffect(()=>{
    const lenis=new Lenis({duration:1.05,smoothWheel:true})
    let id=0
    const raf=(time:number)=>{lenis.raf(time);id=requestAnimationFrame(raf)}
    id=requestAnimationFrame(raf)
    return()=>{cancelAnimationFrame(id);lenis.destroy()}
  },[])
  return children
}

function Progress(){
  const {scrollYProgress}=useScroll()
  const scaleX=useSpring(scrollYProgress,{stiffness:150,damping:30})
  return <motion.div className="scroll-progress" style={{scaleX}}/>
}

export function Providers({children}:{children:ReactNode}){
  return <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
    <SmoothScroll><Progress/>{children}</SmoothScroll>
  </ThemeProvider>
}
