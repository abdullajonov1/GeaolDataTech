import Link from 'next/link'
import { ArrowLeft, MapPinOff } from '@/components/icons'
export default function NotFound(){return <main className="not-found"><div className="nf-grid"/><MapPinOff/><span>ERROR / 404</span><h1>Coordinate<br/>not found.</h1><p>The requested location does not exist in this spatial system.</p><Link href="/uz"><ArrowLeft/>RETURN TO MAP</Link></main>}
