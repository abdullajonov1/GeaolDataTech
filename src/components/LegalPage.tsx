import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from '@/components/icons'
import { isLocale, type Locale } from '@/lib/i18n'

const legal={
 privacy:{
  uz:{title:'Maxfiylik siyosati',updated:'HUQUQIY / YANGILANGAN 29.07.2026',sections:[
   ['1. Qamrov','Ushbu hujjat GeoAIData Tech veb-saytidan foydalanish va formalar orqali yuborilgan ma’lumotlarga oid tamoyillarni tushuntiradi.'],
   ['2. Ma’lumotlar','Biz faqat so‘rovlarga javob berish, loyiha murojaatlarini baholash va sayt ishonchliligini oshirish uchun zarur ma’lumotlarni qayta ishlaymiz. Ishlab chiqarishdagi forma endpointlari saqlash, kirish nazorati va tezlik cheklovi siyosatlariga ega bo‘lishi shart.'],
   ['3. Xavfsizlik','Ma’lumotlar texnik va tashkiliy choralar bilan himoyalanadi. So‘rov uchun kerak bo‘lmagan maxfiy hisob ma’lumotlari, tartibga solinadigan datasetlar yoki shaxsiy ma’lumotlarni yubormang.'],
   ['4. Sizning huquqlaringiz','Yuborilgan ma’lumotlarga kirish, tuzatish yoki o‘chirishni sk@geoaidata.uz orqali so‘rashingiz mumkin.'],
   ['5. Aloqa','Ushbu siyosat bo‘yicha savollarni sk@geoaidata.uz manziliga yuboring.']
  ]},
  ru:{title:'Политика конфиденциальности',updated:'ПРАВОВОЕ / ОБНОВЛЕНО 29.07.2026',sections:[
   ['1. Область действия','Этот документ объясняет принципы использования сайта GeoAIData Tech и обработки информации, отправленной через формы.'],
   ['2. Информация','Мы обрабатываем только данные, необходимые для ответа на запросы, оценки проектных обращений и повышения надёжности сайта. Боевые endpoints форм должны реализовывать политики хранения, контроля доступа и ограничения частоты запросов.'],
   ['3. Безопасность','Данные защищаются техническими и организационными мерами. Не отправляйте конфиденциальные учётные данные, регулируемые наборы данных или персональную информацию, не нужную для запроса.'],
   ['4. Ваши права','Вы можете запросить доступ, исправление или удаление отправленных данных по адресу sk@geoaidata.uz.'],
   ['5. Контакты','Вопросы по этой политике можно направлять на sk@geoaidata.uz.']
  ]},
  en:{title:'Privacy Policy',updated:'LEGAL / UPDATED 29.07.2026',sections:[
   ['1. Scope','This document explains the principles governing use of the GeoAIData Tech website and handling of information submitted through its forms.'],
   ['2. Information','We process only the information required to respond to inquiries, evaluate project requests, and improve website reliability. Production form endpoints must implement retention, access control, and rate limiting policies.'],
   ['3. Security','Data is protected through technical and organizational controls. Do not submit confidential credentials, regulated datasets, or personal information that is not needed for the inquiry.'],
   ['4. Your rights','You may request access, correction, or deletion of submitted information by contacting sk@geoaidata.uz.'],
   ['5. Contact','Questions about this policy can be sent to sk@geoaidata.uz.']
  ]}
 },
 terms:{
  uz:{title:'Foydalanish shartlari',updated:'HUQUQIY / YANGILANGAN 29.07.2026',sections:[
   ['1. Qamrov','Ushbu hujjat GeoAIData Tech veb-saytidan foydalanish va formalar orqali yuborilgan ma’lumotlarga oid tamoyillarni tushuntiradi.'],
   ['2. Ma’lumotlar','Biz faqat so‘rovlarga javob berish, loyiha murojaatlarini baholash va sayt ishonchliligini oshirish uchun zarur ma’lumotlarni qayta ishlaymiz. Ishlab chiqarishdagi forma endpointlari saqlash, kirish nazorati va tezlik cheklovi siyosatlariga ega bo‘lishi shart.'],
   ['3. Xavfsizlik','Ma’lumotlar texnik va tashkiliy choralar bilan himoyalanadi. So‘rov uchun kerak bo‘lmagan maxfiy hisob ma’lumotlari, tartibga solinadigan datasetlar yoki shaxsiy ma’lumotlarni yubormang.'],
   ['4. Sizning huquqlaringiz','Yuborilgan ma’lumotlarga kirish, tuzatish yoki o‘chirishni sk@geoaidata.uz orqali so‘rashingiz mumkin.'],
   ['5. Aloqa','Ushbu siyosat bo‘yicha savollarni sk@geoaidata.uz manziliga yuboring.']
  ]},
  ru:{title:'Условия использования',updated:'ПРАВОВОЕ / ОБНОВЛЕНО 29.07.2026',sections:[
   ['1. Область действия','Этот документ объясняет принципы использования сайта GeoAIData Tech и обработки информации, отправленной через формы.'],
   ['2. Информация','Мы обрабатываем только данные, необходимые для ответа на запросы, оценки проектных обращений и повышения надёжности сайта. Боевые endpoints форм должны реализовывать политики хранения, контроля доступа и ограничения частоты запросов.'],
   ['3. Безопасность','Данные защищаются техническими и организационными мерами. Не отправляйте конфиденциальные учётные данные, регулируемые наборы данных или персональную информацию, не нужную для запроса.'],
   ['4. Ваши права','Вы можете запросить доступ, исправление или удаление отправленных данных по адресу sk@geoaidata.uz.'],
   ['5. Контакты','Вопросы по этой политике можно направлять на sk@geoaidata.uz.']
  ]},
  en:{title:'Terms of Use',updated:'LEGAL / UPDATED 29.07.2026',sections:[
   ['1. Scope','This document explains the principles governing use of the GeoAIData Tech website and handling of information submitted through its forms.'],
   ['2. Information','We process only the information required to respond to inquiries, evaluate project requests, and improve website reliability. Production form endpoints must implement retention, access control, and rate limiting policies.'],
   ['3. Security','Data is protected through technical and organizational controls. Do not submit confidential credentials, regulated datasets, or personal information that is not needed for the inquiry.'],
   ['4. Your rights','You may request access, correction, or deletion of submitted information by contacting sk@geoaidata.uz.'],
   ['5. Contact','Questions about this policy can be sent to sk@geoaidata.uz.']
  ]}
 }
}

export async function LegalPage({params,type}:{params:Promise<{locale:string}>,type:'privacy'|'terms'}){
 const {locale}=await params;if(!isLocale(locale))notFound()
 const copy=legal[type][locale as Locale]
 return <article className="legal-page">
  <Link href={`/${locale}`}><ArrowLeft/>GEODATA</Link>
  <span>{copy.updated}</span>
  <h1>{copy.title}</h1>
  <section>{copy.sections.map(([h,p])=><div key={h}><h2>{h}</h2><p>{p}</p></div>)}</section>
 </article>
}
