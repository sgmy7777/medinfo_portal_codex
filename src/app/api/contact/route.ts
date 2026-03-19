import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Простой in-memory rate limiter
const rateMap = new Map<string, { count: number; ts: number }>()
const RATE_LIMIT = 3
const RATE_WINDOW = 60000

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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
    }

    const { name, email, message } = await req.json()

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

    // В dev-режиме не отправляем письмо — только логируем
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 [DEV] Contact form submission:')
      console.log(`  Name: ${name.trim()}`)
      console.log(`  Email: ${email}`)
      console.log(`  Message: ${message.trim()}`)
      console.log('  (Email not sent in development mode)\n')
      return NextResponse.json({ ok: true })
    }

    // Проверяем что переменные окружения настроены
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error('Contact form: MAIL_USER or MAIL_PASS not set')
      return NextResponse.json(
        { error: 'Сервис временно недоступен. Попробуйте позже.' },
        { status: 503 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      connectionTimeout: 10000,  // 10 секунд вместо 2 минут
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"ЗдравИнфо" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // отправляем на тот же ящик
      replyTo: email,
      subject: `Сообщение с сайта от ${name.trim()}`,
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
  } catch (err: any) {
    console.error('Contact form error:', err)

    // Понятные сообщения для разных типов ошибок
    if (err?.code === 'ESOCKET' || err?.code === 'ECONNREFUSED' || err?.code === 'EHOSTUNREACH') {
      return NextResponse.json(
        { error: 'Не удалось подключиться к почтовому серверу. Попробуйте позже.' },
        { status: 503 }
      )
    }
    if (err?.responseCode >= 500) {
      return NextResponse.json(
        { error: 'Почтовый сервер временно недоступен. Попробуйте позже.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: 'Ошибка отправки. Попробуйте позже.' }, { status: 500 })
  }
}
