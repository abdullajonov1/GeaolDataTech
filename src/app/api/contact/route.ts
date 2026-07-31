import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(7),
  message: z.string().min(5),
  locale: z.string().optional(),
})

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return NextResponse.json(
      { error: 'Telegram is not configured' },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const data = parsed.data
  const company = data.company?.trim()
  const text = [
    '<b>Yangi xabar</b>',
    `Til: ${escapeHtml(data.locale || 'uz')}`,
    '',
    `<b>Ism:</b> ${escapeHtml(data.name)}`,
    company ? `<b>Kompaniya:</b> ${escapeHtml(company)}` : null,
    `<b>Email:</b> ${escapeHtml(data.email)}`,
    `<b>Telefon:</b> ${escapeHtml(data.phone)}`,
    '',
    `<b>Xabar:</b>`,
    escapeHtml(data.message),
  ]
    .filter(Boolean)
    .join('\n')

  const telegramRes = await fetch(
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

  const telegramJson = await telegramRes.json().catch(() => null)
  if (!telegramRes.ok || !telegramJson?.ok) {
    console.error('Telegram send failed', telegramJson)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
