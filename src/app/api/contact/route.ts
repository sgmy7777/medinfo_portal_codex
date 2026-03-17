import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Простой in-memory rate limiter (сбрасывается при рестарте сервера)
const rateMap = new Map<string, { count: number; ts: number }>()
const RATE_LIMIT = 3      // максимум запросов
const RATE_WINDOW = 60000 // за 60 секунд

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now - entry.ts > RATE_WINDOW) {
    rateMap.set(ip, { count: 1, ts: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
    }

    const { name, email, message } = await req.json()

    // Валидация
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Слишком длинное имя' }, { status: 400 })
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Сообщение слишком длинное (максимум 2000 символов)' }, { status: 400 })
    }
    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Сообщение слишком короткое' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"ЗдравИнфо" <${process.env.MAIL_USER}>`,
      to: 'sgmy7777@mail.ru',
      replyTo: email,
      subject: `Сообщение с сайта от ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 24px;">
          <h2 style="color: #4A0F17; margin-bottom: 20px;">Новое сообщение с ЗдравИнфо</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 120px; color: #666;">Имя:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 600; color: #666; vertical-align: top;">Сообщение:</td>
              <td style="padding: 10px 0; white-space: pre-wrap;">${message.trim()}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #999;">IP: ${ip}</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 })
  }
}
