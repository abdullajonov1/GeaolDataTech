import { notFound } from 'next/navigation'
import { Clock, Mail, MapPinned, Phone } from '@/components/icons'
import { PageHero } from '@/components/PageShell'
import { ContactForm } from '@/components/ContactForm'
import { RealMap } from '@/components/RealMap'
import { company } from '@/data/site'
import { isLocale, type Locale } from '@/lib/i18n'

export const metadata={title:'Contact'}

const faq={
 uz:{
  title:'TSS / 04',
  office:'TOSHKENT OFISI',
  inquiry:'LOYIHA SO‘ROVI',
  items:[
   ['Loyiha tahlili qanday o‘tadi?','Avval mavjud ma’lumotlar, foydalanuvchilar, infratuzilma, xavfsizlik talablari va o‘lchanadigan natijalar aniqlanadi — keyin arxitektura boshlanadi.'],
   ['Mavjud ArcGIS infratuzilmasini integratsiya qila olasizmi?','Ha. ArcGIS Enterprise, Portal va Online muhitlarini yangi yoki mavjud tizimlarga xavfsiz ulaymiz.'],
   ['Davlat ma’lumotlari xavfsizligi talablariga moslashasizmi?','Ha. Kirish nazorati, audit izlari va xavfsizlik siyosatlarini loyiha boshidan hisobga olamiz.'],
   ['Platforma hududlar bo‘ylab masshtablanadimi?','Ha. Tizimlar mintaqaviy kengayish, yuklama va ko‘p tashkilotli foydalanish uchun loyihalanadi.']
  ]
 },
 ru:{
  title:'FAQ / 04',
  office:'ОФИС В ТАШКЕНТЕ',
  inquiry:'ЗАПРОС ПО ПРОЕКТУ',
  items:[
   ['Как проходит исследование проекта?','Сначала мы анализируем данные, пользователей, инфраструктуру, требования безопасности и измеримые результаты — затем переходим к архитектуре.'],
   ['Можете ли интегрировать существующую инфраструктуру ArcGIS?','Да. Мы безопасно подключаем ArcGIS Enterprise, Portal и Online к новым или действующим системам.'],
   ['Работаете ли с требованиями госбезопасности данных?','Да. Контроль доступа, аудит и политики безопасности закладываются с самого начала проекта.'],
   ['Масштабируется ли платформа по регионам?','Да. Системы проектируются для регионального роста, нагрузки и мультиорганизационного использования.']
  ]
 },
 en:{
  title:'FAQ / 04',
  office:'TASHKENT OFFICE',
  inquiry:'PROJECT INQUIRY',
  items:[
   ['How does project discovery work?','Our discovery process maps existing data, users, infrastructure, security constraints, and measurable outcomes before architecture begins.'],
   ['Can you integrate existing ArcGIS infrastructure?','Yes. We securely connect ArcGIS Enterprise, Portal, and Online environments to new or existing systems.'],
   ['Do you work with government data security requirements?','Yes. Access control, audit trails, and security policies are built into the project from day one.'],
   ['Can the platform scale across regions?','Yes. Systems are designed for regional growth, load, and multi-organization use.']
  ]
 }
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound()
 const c={uz:['Loyihangizni xaritaga joylashtiramiz.','Vazifangizni tasvirlab bering — texnik jamoamiz siz bilan birga eng to‘g‘ri yo‘lni aniqlaydi.'],ru:['Разместим ваш проект на карте.','Опишите задачу — наша техническая команда поможет определить оптимальный маршрут.'],en:['Let’s put your project on the map.','Tell us about the challenge and our technical team will help define the clearest route forward.']}[locale]
 const f=faq[locale]
 return <>
  <PageHero locale={locale} index="10" eyebrow={locale==='uz'?'ALOQA':locale==='ru'?'КОНТАКТЫ':'CONTACT'} title={c[0]} text={c[1]}/>
  <section className="contact-page">
   <div className="contact-info">
    <span className="section-label">/ {f.office}</span>
    <h2>41.2995° N<br/>69.2401° E</h2>
    <a href={`mailto:${company.email}`}><Mail/>{company.email}</a>
    <a href={`tel:${company.phone}`}><Phone/>{company.phone}</a>
    <span><MapPinned/>{company.address[locale]}</span>
    <span><Clock/>{company.hours[locale]}</span>
    <div className="office-map"><RealMap markers={[{id:'office',lng:69.2401,lat:41.2995,label:'GEOLDATA TECH — Tashkent'}]} activeId="office" center={[69.2401,41.2995]} zoom={13}/></div>
   </div>
   <div>
    <span className="section-label">/ {f.inquiry}</span>
    <ContactForm locale={locale as Locale}/>
   </div>
  </section>
  <section className="faq-section">
   <h2>{f.title}</h2>
   {f.items.map((item,i)=><details key={item[0]}><summary><span>0{i+1}</span>{item[0]}<b>+</b></summary><p>{item[1]}</p></details>)}
  </section>
 </>
}
