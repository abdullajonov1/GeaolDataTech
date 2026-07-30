import { LegalPage } from '@/components/LegalPage'
export const metadata={title:'Terms of Use'}
export default function Page({params}:{params:Promise<{locale:string}>}){return <LegalPage params={params} type="terms"/>}
