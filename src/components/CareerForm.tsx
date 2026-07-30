'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle2, LoaderCircle, Upload } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { jobs, tx, ui } from '@/data/site'

type CareerData={name:string,email:string,phone:string,position:string,experience:string,linkedin:string,portfolio:string,letter:string}

const careerCopy={
 uz:{success:'Arizangiz qabul qilindi.',name:'Ism va familiya',phone:'Telefon',position:'Lavozim',experience:'Ish tajribasi (yil)',portfolio:'Portfolio havolasi',letter:'Motivatsion xat',cv:'CV / Rezyume'},
 ru:{success:'Ваша заявка принята.',name:'Имя и фамилия',phone:'Телефон',position:'Должность',experience:'Опыт работы (лет)',portfolio:'Ссылка на портфолио',letter:'Сопроводительное письмо',cv:'CV / Резюме'},
 en:{success:'Your application has been received.',name:'Full name',phone:'Phone',position:'Position',experience:'Years of experience',portfolio:'Portfolio URL',letter:'Cover letter',cv:'CV / Resume'}
}

export function CareerForm({locale}:{locale:Locale}){
 const t=ui[locale];const c=careerCopy[locale];const [sent,setSent]=useState(false)
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<CareerData>()
 const submit=async()=>{await new Promise(r=>setTimeout(r,700));setSent(true)}
 if(sent)return <div className="form-success"><CheckCircle2/><h3>{c.success}</h3></div>
 return <form className="career-form" onSubmit={handleSubmit(submit)}>
  <input placeholder={c.name} {...register('name',{required:true})}/>
  <input placeholder="Email" type="email" {...register('email',{required:true})}/>
  <input placeholder={c.phone} {...register('phone',{required:true})}/>
  <select {...register('position',{required:true})}>
   <option value="">{c.position}</option>
   {jobs.map(j=><option key={j.title.en} value={j.title.en}>{tx(j.title,locale)}</option>)}
  </select>
  <input placeholder={c.experience} {...register('experience')}/>
  <input placeholder="LinkedIn" {...register('linkedin')}/>
  <input placeholder={c.portfolio} {...register('portfolio')}/>
  <textarea placeholder={c.letter} rows={5} {...register('letter',{required:true})}/>
  <label className="career-upload"><Upload/> {c.cv}<input type="file" accept=".pdf,.doc,.docx"/></label>
  <button disabled={isSubmitting}>{isSubmitting?<LoaderCircle className="spin"/>:t.sendApplication}</button>
  {Object.keys(errors).length>0&&<small>{t.completeFields}</small>}
 </form>
}
