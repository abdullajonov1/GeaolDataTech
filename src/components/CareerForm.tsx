'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle2, ChevronDown, LoaderCircle, Upload, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { jobs, tx, ui } from '@/data/site'

type CareerData = {
  name: string
  email: string
  phone: string
  position: string
  experience: string
  linkedin: string
  portfolio: string
  about: string
}

const careerCopy = {
  uz: {
    successTitle: 'Ariza yuborildi',
    successText: 'Tez orada siz bilan bog‘lanamiz.',
    name: 'Ism va familiya',
    phone: 'Telefon',
    position: 'Lavozim',
    experience: 'Ish tajribasi (yil)',
    portfolio: 'Portfolio havolasi',
    about: 'O‘zim haqimda',
    cv: 'CV / Rezyume',
    cvHint: 'PDF, DOC yoki DOCX — max 10 MB',
    cvRequired: 'CV yuklang.',
    sendError: 'Ariza yuborilmadi. Keyinroq qayta urinib ko‘ring.',
    send: 'Arizani yuborish',
  },
  ru: {
    successTitle: 'Заявка отправлена',
    successText: 'Мы скоро свяжемся с вами.',
    name: 'Имя и фамилия',
    phone: 'Телефон',
    position: 'Должность',
    experience: 'Опыт работы (лет)',
    portfolio: 'Ссылка на портфолио',
    about: 'О себе',
    cv: 'CV / Резюме',
    cvHint: 'PDF, DOC или DOCX — макс. 10 МБ',
    cvRequired: 'Загрузите CV.',
    sendError: 'Не удалось отправить заявку. Попробуйте позже.',
    send: 'Отправить заявку',
  },
  en: {
    successTitle: 'Application sent',
    successText: 'We will get back to you shortly.',
    name: 'Full name',
    phone: 'Phone',
    position: 'Position',
    experience: 'Years of experience',
    portfolio: 'Portfolio URL',
    about: 'About me',
    cv: 'CV / Resume',
    cvHint: 'PDF, DOC or DOCX — max 10 MB',
    cvRequired: 'Please upload your CV.',
    sendError: 'Could not send your application. Please try again later.',
    send: 'Send application',
  },
}

function Label({
  children,
  required,
}: {
  children: string
  required?: boolean
}) {
  return (
    <span>
      {children}
      {required && <i className="req">*</i>}
    </span>
  )
}

export function CareerForm({ locale }: { locale: Locale }) {
  const t = ui[locale]
  const c = careerCopy[locale]
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvError, setCvError] = useState('')
  const [posOpen, setPosOpen] = useState(false)
  const posRef = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CareerData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      linkedin: '',
      portfolio: '',
      about: '',
    },
  })
  const position = watch('position')
  const positionOptions = jobs.map((job) => tx(job.title, locale))

  useEffect(() => {
    if (!sent) return
    const id = window.setTimeout(() => setSent(false), 6000)
    return () => window.clearTimeout(id)
  }, [sent])

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!posRef.current?.contains(e.target as Node)) setPosOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  const submit = async (values: CareerData) => {
    setSubmitError('')
    setCvError('')
    if (!cvFile) {
      setCvError(c.cvRequired)
      return
    }

    try {
      const body = new FormData()
      Object.entries(values).forEach(([key, value]) => body.append(key, value))
      body.append('locale', locale)
      body.append('cv', cvFile)

      const res = await fetch('/api/careers', { method: 'POST', body })
      if (!res.ok) throw new Error('send failed')
      reset()
      setCvFile(null)
      setSent(true)
    } catch {
      setSubmitError(c.sendError)
    }
  }

  return (
    <form
      className="career-form"
      onSubmit={handleSubmit(submit)}
      noValidate
      autoComplete="on"
    >
      {sent && (
        <div className="form-toast full" role="status">
          <CheckCircle2 />
          <div>
            <strong>{c.successTitle}</strong>
            <p>{c.successText}</p>
          </div>
          <button type="button" aria-label="OK" onClick={() => setSent(false)}>
            <X />
          </button>
        </div>
      )}

      <label>
        <Label required>{c.name}</Label>
        <input {...register('name', { required: true, minLength: 2 })} />
        {errors.name && <small>{t.required}</small>}
      </label>
      <label>
        <Label required>Email</Label>
        <input type="email" {...register('email', { required: true })} />
        {errors.email && <small>{t.required}</small>}
      </label>
      <label>
        <Label required>{c.phone}</Label>
        <input {...register('phone', { required: true, minLength: 7 })} />
        {errors.phone && <small>{t.required}</small>}
      </label>

      <div className="field-select" ref={posRef}>
        <Label required>{c.position}</Label>
        <input
          type="hidden"
          {...register('position', { required: true })}
        />
        <button
          type="button"
          className={'select-trigger ' + (position ? 'has-value' : '')}
          aria-expanded={posOpen}
          aria-haspopup="listbox"
          onClick={() => setPosOpen((v) => !v)}
        >
          <span>{position || '\u00A0'}</span>
          <ChevronDown size={16} />
        </button>
        {posOpen && (
          <div className="select-menu" role="listbox">
            {positionOptions.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option === position}
                className={option === position ? 'active' : ''}
                key={option}
                onClick={() => {
                  setValue('position', option, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                  setPosOpen(false)
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {errors.position && <small>{t.required}</small>}
      </div>

      <label>
        <Label>{c.experience}</Label>
        <input {...register('experience')} />
      </label>
      <label>
        <Label>LinkedIn</Label>
        <input {...register('linkedin')} />
      </label>
      <label className="full">
        <Label>{c.portfolio}</Label>
        <input {...register('portfolio')} />
      </label>
      <label className="full">
        <Label required>{c.about}</Label>
        <textarea
          rows={5}
          {...register('about', { required: true, minLength: 20 })}
        />
        {errors.about && <small>{t.required}</small>}
      </label>

      <label className={`career-upload full ${cvFile ? 'has-file' : ''}`}>
        <Upload />
        <span>
          <b>{cvFile ? cvFile.name : c.cv}</b>
          <small>{c.cvHint}</small>
        </span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            setCvFile(file)
            setCvError('')
          }}
        />
      </label>
      {cvError && <p className="form-error full">{cvError}</p>}
      {submitError && <p className="form-error full">{submitError}</p>}

      <button className="form-submit" disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircle className="spin" /> : c.send}
      </button>
    </form>
  )
}
