import { notFound } from 'next/navigation'
import { CareerForm } from '@/components/CareerForm'
import { PageHero } from '@/components/PageShell'
import { isLocale, type Locale } from '@/lib/i18n'

export const metadata={title:'Career Application'}

export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound()
 const aside=locale==='uz'
  ?'Har bir kuchli tizim tafsilot, kontekst va ta’sirga e’tibor beradigan odamlardan boshlanadi.'
  :locale==='ru'
  ?'Каждая сильная система начинается с людей, которым важны детали, контекст и влияние.'
  :'Every strong system begins with people who care about detail, context, and impact.'
 return <>
  <PageHero
   locale={locale}
   index="09.1"
   eyebrow={locale==='uz'?'ARIZA':locale==='ru'?'ЗАЯВКА':'APPLICATION'}
   title={locale==='uz'?'Keyingi koordinatangizni yuboring.':locale==='ru'?'Отправьте свою следующую координату.':'Send us your next coordinate.'}
   text={locale==='uz'?'Tajriba, qiziqish va yaratmoqchi bo‘lgan tizimlaringiz haqida yozing.':locale==='ru'?'Расскажите об опыте, интересах и системах, которые хотите создавать.':'Tell us about your experience, interests, and systems you want to build.'}
  />
  <section className="application-section">
   <div>
    <span className="section-label">/ {locale==='uz'?'KADR SIGNALI':locale==='ru'?'СИГНАЛ ТАЛАНТОВ':'TALENT SIGNAL'}</span>
    <h2>GIS × CODE × DESIGN</h2>
    <p>{aside}</p>
   </div>
   <CareerForm locale={locale as Locale}/>
  </section>
 </>
}
