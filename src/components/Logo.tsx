import Link from 'next/link'
export function LogoMark(){return <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true"><path className="hex" d="M24 3.5 42 14v20L24 44.5 6 34V14L24 3.5Z"/><path className="g" d="M32.5 16.2a11 11 0 1 0 1.2 14H24v-6h15"/><path className="contour" d="M11 15c5 2 8-5 14-3s8 0 12-2M9 34c6-4 9 2 16 0s8-1 13 1"/><circle cx="24" cy="24" r="2.4"/></svg>}
export function Logo({locale='uz'}:{locale?:string}){return <Link href={`/${locale}`} className="brand" aria-label="GEOLDATA TECH"><LogoMark/><span>GEOLDATA <b>TECH</b></span></Link>}

