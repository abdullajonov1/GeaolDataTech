'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, LoaderCircle, Paperclip } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { ui } from '@/data/site'

const schema=z.object({name:z.string().min(2),company:z.string().min(2),email:z.email(),phone:z.string().min(7),country:z.string().min(2),projectType:z.string().min(1),industry:z.string().min(1),timeline:z.string().min(1),budget:z.string().min(1),description:z.string().min(20)})
type FormData=z.infer<typeof schema>

const formCopy={
 uz:{
  name:'Ism va familiya',company:'Kompaniya',phone:'Telefon',country:'Mamlakat',projectType:'Loyiha turi',industry:'Soha',timeline:'Muddat',budget:'Byudjet diapazoni',description:'Loyiha haqida',attach:'Fayl biriktirish',descError:'Kamida 20 ta belgi kiriting.',
  projectTypes:['GIS tizimi','ArcGIS portal','Geoportal','Yo‘ldosh analitika','Veb-platforma'],
  industries:['Davlat','Qishloq xo‘jaligi','Infratuzilma','Ekologiya','Boshqa'],
  timelines:['1–3 oy','3–6 oy','6–12 oy','12+ oy'],
  budgets:['Tahlil talab qilinadi','$10k–$30k','$30k–$100k','$100k+']
 },
 ru:{
  name:'Имя и фамилия',company:'Компания',phone:'Телефон',country:'Страна',projectType:'Тип проекта',industry:'Отрасль',timeline:'Срок',budget:'Диапазон бюджета',description:'О проекте',attach:'Прикрепить файл',descError:'Введите минимум 20 символов.',
  projectTypes:['GIS-система','Портал ArcGIS','Геопортал','Спутниковая аналитика','Веб-платформа'],
  industries:['Государство','Сельское хозяйство','Инфраструктура','Экология','Другое'],
  timelines:['1–3 месяца','3–6 месяцев','6–12 месяцев','12+ месяцев'],
  budgets:['Требуется анализ','$10k–$30k','$30k–$100k','$100k+']
 },
 en:{
  name:'Full name',company:'Company',phone:'Phone',country:'Country',projectType:'Project type',industry:'Industry',timeline:'Timeline',budget:'Budget range',description:'Project description',attach:'Attach brief',descError:'Enter at least 20 characters.',
  projectTypes:['GIS System','ArcGIS Portal','Geoportal','Satellite Analytics','Web Platform'],
  industries:['Government','Agriculture','Infrastructure','Environment','Other'],
  timelines:['1–3 months','3–6 months','6–12 months','12+ months'],
  budgets:['Discovery required','$10k–$30k','$30k–$100k','$100k+']
 }
}

export function ContactForm({locale,compact=false}:{locale:Locale,compact?:boolean}){
 const t=ui[locale];const f=formCopy[locale];const [sent,setSent]=useState(false)
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormData>({resolver:zodResolver(schema)})
 const submit=async()=>{await new Promise(r=>setTimeout(r,800));setSent(true)}
 if(sent)return <div className="form-success"><CheckCircle2/><h3>{t.formSuccess}</h3><button onClick={()=>setSent(false)}>OK</button></div>
 return <form className={'contact-form '+(compact?'compact':'')} onSubmit={handleSubmit(submit)} noValidate>
  <label><span>{f.name}</span><input {...register('name')}/>{errors.name&&<small>{t.required}</small>}</label>
  <label><span>{f.company}</span><input {...register('company')}/>{errors.company&&<small>{t.required}</small>}</label>
  <label><span>Email</span><input type="email" {...register('email')}/>{errors.email&&<small>{t.required}</small>}</label>
  <label><span>{f.phone}</span><input {...register('phone')}/>{errors.phone&&<small>{t.required}</small>}</label>
  <label><span>{f.country}</span><input {...register('country')}/></label>
  <label><span>{f.projectType}</span><select {...register('projectType')}><option value="">—</option>{f.projectTypes.map(x=><option key={x}>{x}</option>)}</select></label>
  <label><span>{f.industry}</span><select {...register('industry')}><option value="">—</option>{f.industries.map(x=><option key={x}>{x}</option>)}</select></label>
  <label><span>{f.timeline}</span><select {...register('timeline')}><option value="">—</option>{f.timelines.map(x=><option key={x}>{x}</option>)}</select></label>
  <label><span>{f.budget}</span><select {...register('budget')}><option value="">—</option>{f.budgets.map(x=><option key={x}>{x}</option>)}</select></label>
  <label className="full"><span>{f.description}</span><textarea rows={5} {...register('description')}/>{errors.description&&<small>{f.descError}</small>}</label>
  <label className="file full"><Paperclip/><span>{f.attach}</span><input type="file"/></label>
  <button className="form-submit" disabled={isSubmitting}>{isSubmitting?<LoaderCircle className="spin"/>:t.start}</button>
 </form>
}
