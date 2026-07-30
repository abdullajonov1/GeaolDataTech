import type { Metadata } from 'next'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'
import { Providers } from '@/components/Providers'
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://geoldatatech.uz'),title:{default:'GEOLDATA TECH — Geospatial Intelligence',template:'%s — GEOLDATA TECH'},description:'Advanced GIS systems, ArcGIS portals, interactive maps, satellite analytics, and enterprise web platforms.',openGraph:{type:'website',siteName:'GEOLDATA TECH'},twitter:{card:'summary_large_image'}}
export default function RootLayout({children}:{children:React.ReactNode}){return <html suppressHydrationWarning><body><Providers>{children}</Providers></body></html>}

