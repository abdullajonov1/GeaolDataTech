'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, LoaderCircle, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { ui } from '@/data/site'

const schema=z.object({
 name:z.string().min(2),
 company:z.string().optional(),
 email:z.email(),
 phone:z.string().min(7),
 message:z.string().min(5),
})
type FormData=z.infer<typeof schema>

const formCopy={
 uz:{
  name:'Ism va familiya',company:'Kompaniya',phone:'Telefon',message:'Xabar',
  messageError:'Xabarni yozing.',send:'Xabar yuborish',
  sendError:'Xabar yuborilmadi. Keyinroq qayta urinib ko‘ring.',
  sentTitle:'Xabar yuborildi',
  sentText:'Tez orada siz bilan bog‘lanamiz.',
 },
 ru:{
  name:'Имя и фамилия',company:'Компания',phone:'Телефон',message:'Сообщение',
  messageError:'Напишите сообщение.',send:'Отправить сообщение',
  sendError:'Не удалось отправить сообщение. Попробуйте позже.',
  sentTitle:'Сообщение отправлено',
  sentText:'Мы скоро свяжемся с вами.',
 },
 en:{
  name:'Full name',company:'Company',phone:'Phone',message:'Message',
  messageError:'Please enter a message.',send:'Send message',
  sendError:'Could not send your message. Please try again later.',
  sentTitle:'Message sent',
  sentText:'We will get back to you shortly.',
 },
}

function Label({children,required}:{children:string,required?:boolean}){
 return <span>{children}{required&&<i className="req">*</i>}</span>
}

export function ContactForm({locale,compact=false}:{locale:Locale,compact?:boolean}){
 const t=ui[locale];const f=formCopy[locale]
 const [sent,setSent]=useState(false)
 const [submitError,setSubmitError]=useState('')
 const {register,handleSubmit,formState:{errors,isSubmitting},reset}=useForm<FormData>({resolver:zodResolver(schema),defaultValues:{company:''}})

 useEffect(()=>{
  if(!sent)return
  const id=window.setTimeout(()=>setSent(false),6000)
  return()=>window.clearTimeout(id)
 },[sent])

 const submit=async(values:FormData)=>{
  setSubmitError('')
  try{
   const res=await fetch('/api/contact',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...values,company:values.company?.trim()||'',locale}),
   })
   if(!res.ok) throw new Error('send failed')
   reset()
   setSent(true)
  }catch{
   setSubmitError(f.sendError)
  }
 }

 return <form className={'contact-form '+(compact?'compact':'')} onSubmit={handleSubmit(submit)} noValidate>
  {sent&&(
   <div className="form-toast full" role="status">
    <CheckCircle2/>
    <div>
     <strong>{f.sentTitle}</strong>
     <p>{f.sentText}</p>
    </div>
    <button type="button" aria-label="OK" onClick={()=>setSent(false)}><X/></button>
   </div>
  )}
  <label><Label required>{f.name}</Label><input {...register('name')}/>{errors.name&&<small>{t.required}</small>}</label>
  <label><Label>{f.company}</Label><input {...register('company')}/></label>
  <label><Label required>Email</Label><input type="email" {...register('email')}/>{errors.email&&<small>{t.required}</small>}</label>
  <label><Label required>{f.phone}</Label><input {...register('phone')}/>{errors.phone&&<small>{t.required}</small>}</label>
  <label className="full"><Label required>{f.message}</Label><textarea rows={5} {...register('message')}/>{errors.message&&<small>{f.messageError}</small>}</label>
  {submitError&&<p className="form-error full">{submitError}</p>}
  <button className="form-submit" disabled={isSubmitting}>{isSubmitting?<LoaderCircle className="spin"/>:f.send}</button>
 </form>
}
