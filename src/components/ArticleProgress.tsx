'use client'
import { motion, useScroll } from 'framer-motion'
export function ArticleProgress(){const {scrollYProgress}=useScroll();return <motion.div className="article-progress" style={{scaleX:scrollYProgress}}/>}

