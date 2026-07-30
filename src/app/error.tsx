'use client'
import { AlertTriangle } from 'lucide-react'

export default function Error({reset}:{error:Error, reset:()=>void}){
 return (
  <div className="error-page">
   <AlertTriangle/>
   <span>ERR / SPATIAL LAYER</span>
   <h1>Something moved off the map.</h1>
   <button type="button" onClick={reset}>TRY AGAIN</button>
  </div>
 )
}
