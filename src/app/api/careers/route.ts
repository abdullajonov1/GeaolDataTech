import { NextResponse } from 'next/server'
import { addApplication, saveCv, setApplicationCv } from '@/lib/admin-store'

export const runtime = 'nodejs'

const MAX_CV_BYTES = 10 * 1024 * 1024
const ALLOWED_CV = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const name = String(form.get('name') || '').trim()
  const email = String(form.get('email') || '').trim()
  const phone = String(form.get('phone') || '').trim()
  const position = String(form.get('position') || '').trim()
  const experience = String(form.get('experience') || '').trim()
  const linkedin = String(form.get('linkedin') || '').trim()
  const portfolio = String(form.get('portfolio') || '').trim()
  const about = String(form.get('about') || '').trim()
  const locale = String(form.get('locale') || 'uz').trim()
  const cv = form.get('cv')

  if (
    name.length < 2 ||
    !email.includes('@') ||
    phone.length < 7 ||
    !position ||
    about.length < 20
  ) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ error: 'CV is required' }, { status: 400 })
  }

  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json({ error: 'CV is too large' }, { status: 400 })
  }

  if (cv.type && !ALLOWED_CV.has(cv.type) && !/\.(pdf|doc|docx)$/i.test(cv.name)) {
    return NextResponse.json({ error: 'Invalid CV type' }, { status: 400 })
  }

  const saved = await addApplication({
    name,
    email,
    phone,
    position,
    experience,
    linkedin,
    portfolio,
    about,
    locale,
    cvName: cv.name || 'cv.pdf',
  })
  const cvFile = await saveCv(saved.id, cv)
  await setApplicationCv(saved.id, cvFile, cv.name || 'cv.pdf')

  const text = [
    '<b>Yangi ish arizasi</b>',
    `Til: ${escapeHtml(locale)}`,
    '',
    `<b>Ism:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Telefon:</b> ${escapeHtml(phone)}`,
    `<b>Lavozim:</b> ${escapeHtml(position)}`,
    experience ? `<b>Tajriba:</b> ${escapeHtml(experience)}` : null,
    linkedin ? `<b>LinkedIn:</b> ${escapeHtml(linkedin)}` : null,
    portfolio ? `<b>Portfolio:</b> ${escapeHtml(portfolio)}` : null,
    '',
    `<b>O‘zim haqimda:</b>`,
    escapeHtml(about),
  ]
    .filter(Boolean)
    .join('\n')

  if (!token || !chatId) {
    return NextResponse.json({ ok: true })
  }

  const messageRes = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    },
  )
  const messageJson = await messageRes.json().catch(() => null)
  if (!messageRes.ok || !messageJson?.ok) {
    console.error('Telegram career message failed', messageJson)
    return NextResponse.json({ ok: true })
  }

  const tgForm = new FormData()
  tgForm.append('chat_id', chatId)
  tgForm.append(
    'caption',
    `CV — ${name} / ${position}`.slice(0, 1024),
  )
  tgForm.append(
    'document',
    new Blob([await cv.arrayBuffer()], {
      type: cv.type || 'application/octet-stream',
    }),
    cv.name || 'cv.pdf',
  )

  const fileRes = await fetch(
    `https://api.telegram.org/bot${token}/sendDocument`,
    { method: 'POST', body: tgForm },
  )
  const fileJson = await fileRes.json().catch(() => null)
  if (!fileRes.ok || !fileJson?.ok) {
    console.error('Telegram career CV failed', fileJson)
  }

  return NextResponse.json({ ok: true })
}
