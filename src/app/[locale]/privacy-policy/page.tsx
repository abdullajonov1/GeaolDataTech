import { LegalPage } from '@/components/LegalPage'
export const metadata={title:'Privacy Policy'}
export default function Page({params}:{params:Promise<{locale:string}>}){return <LegalPage params={params} type="privacy"/>}
