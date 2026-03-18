'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactsPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) return

    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      return
      }

      const json = await res.json().catch(() => null)
      setErrorMessage(json?.error || 'Ошибка отправки')
      setStatus('error')
    } catch {
      setErrorMessage('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.')
      setStatus('error')
    }
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8;
          --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --acc-l: #F5EDD8; --rule: #D8CCBA; --white: #FFFDF9;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }

        .ct-hdr { background: var(--bord-d); }
        .ct-hdr-top { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 6px 0; }
        .ct-hdr-top-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .ct-hdr-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acc); }
        .ct-hdr-main { max-width: 1200px; margin: 0 auto; padding: 20px 24px 16px; display: flex; justify-content: center; }
        .ct-logo { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: white; letter-spacing: -2px; text-decoration: none; line-height: 1; text-align: center; display: block; }
        .ct-logo span { color: var(--acc); }
        .ct-logo-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; text-align: center; }

        .ct-wrap { max-width: 1000px; margin: 0 auto; padding: 48px 24px 72px; }

        .ct-bc { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-30); margin-bottom: 36px; }
        .ct-bc a { color: var(--ink-30); text-decoration: none; transition: color 0.15s; }
        .ct-bc a:hover { color: var(--bord); }
        .ct-bc-sep { color: var(--rule); }

        .ct-title { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .ct-subtitle { font-size: 16px; color: var(--ink-60); margin-bottom: 48px; padding-bottom: 28px; border-bottom: 1px solid var(--rule); line-height: 1.6; }

        .ct-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }

        /* LEFT — contact info */
        .ct-info {}
        .ct-info-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 24px; }

        .ct-contact-item { display: flex; align-items: flex-start; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--rule); }
        .ct-contact-item:first-of-type { border-top: 1px solid var(--rule); }
        .ct-contact-ico { width: 40px; height: 40px; background: var(--bord-l); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .ct-contact-body {}
        .ct-contact-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 4px; }
        .ct-contact-val { font-size: 15px; font-weight: 600; color: var(--ink); }
        .ct-contact-val a { color: var(--bord); text-decoration: none; transition: color 0.15s; }
        .ct-contact-val a:hover { color: var(--bord-m); text-decoration: underline; }
        .ct-contact-hint { font-size: 12px; color: var(--ink-30); margin-top: 3px; }

        .ct-note { margin-top: 32px; padding: 16px 20px; background: var(--acc-l); border-left: 3px solid var(--acc); border-radius: 0 2px 2px 0; font-size: 13px; color: var(--ink-60); line-height: 1.65; }

        /* RIGHT — form */
        .ct-form-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 24px; }

        .ct-field { margin-bottom: 18px; }
        .ct-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 7px; }
        .ct-input { width: 100%; padding: 10px 14px; background: var(--white); border: 1px solid var(--rule); border-radius: 2px; font-size: 14px; font-family: 'Golos Text', sans-serif; color: var(--ink); transition: border-color 0.15s; outline: none; }
        .ct-input:focus { border-color: var(--bord); }
        .ct-textarea { width: 100%; padding: 10px 14px; background: var(--white); border: 1px solid var(--rule); border-radius: 2px; font-size: 14px; font-family: 'Golos Text', sans-serif; color: var(--ink); transition: border-color 0.15s; outline: none; resize: vertical; min-height: 130px; }
        .ct-textarea:focus { border-color: var(--bord); }

        .ct-btn { width: 100%; padding: 13px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 13px; font-weight: 700; font-family: 'Golos Text', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.15s; margin-top: 4px; }
        .ct-btn:hover:not(:disabled) { background: var(--bord-m); }
        .ct-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ct-success { padding: 16px 20px; background: #F0FAF4; border: 1px solid #A8D5B5; border-radius: 2px; font-size: 14px; color: #1E5C35; font-weight: 600; margin-top: 16px; display: flex; align-items: center; gap: 10px; }
        .ct-error { padding: 16px 20px; background: var(--bord-l); border: 1px solid #D4A0A0; border-radius: 2px; font-size: 14px; color: var(--bord-d); font-weight: 600; margin-top: 16px; }

        .ct-footer { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; }
        .ct-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        .ct-foot-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: white; text-decoration: none; }
        .ct-foot-logo span { color: var(--acc); }
        .ct-foot-lnks { display: flex; gap: 16px; font-size: 12px; }
        .ct-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.15s; }
        .ct-foot-lnks a:hover { color: var(--acc); }
        .ct-foot-copy { font-size: 11px; color: rgba(255,255,255,0.45); }

        @media (max-width: 768px) {
          .ct-layout { grid-template-columns: 1fr; gap: 40px; }
          .ct-title { font-size: 28px; }
          .ct-logo { font-size: 30px; }
        }
        @media (max-width: 600px) {
          .ct-wrap { padding: 32px 16px 48px; }
          .ct-title { font-size: 24px; }
          .ct-logo { font-size: 26px; }
          .ct-logo-sub { display: none; }
          .ct-subtitle { font-size: 14px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        

        <main style={{ flex: 1 }}>
          <div className="ct-wrap">
            <nav className="ct-bc">
              <Link href="/">Главная</Link>
              <span className="ct-bc-sep">/</span>
              <span>Контакты</span>
            </nav>

            <h1 className="ct-title">Контакты</h1>
            <p className="ct-subtitle">
              Если у вас есть вопросы о работе портала, предложения по сотрудничеству или замечания
              по опубликованным материалам — напишите нам.
            </p>

            <div className="ct-layout">

              {/* LEFT — contact info */}
              <div className="ct-info">
                <div className="ct-info-ttl">Способы связи</div>

                <div className="ct-contact-item">
                  <div className="ct-contact-ico">✉️</div>
                  <div className="ct-contact-body">
                    <div className="ct-contact-lbl">Email</div>
                    <div className="ct-contact-val">
                      <a href="mailto:sgmy7777@mail.ru">sgmy7777@mail.ru</a>
                    </div>
                    <div className="ct-contact-hint">Ответим в течение 1–2 рабочих дней</div>
                  </div>
                </div>

                <div className="ct-contact-item">
                  <div className="ct-contact-ico">✈️</div>
                  <div className="ct-contact-body">
                    <div className="ct-contact-lbl">Telegram</div>
                    <div className="ct-contact-val">
                      <a href="https://t.me/PetrKyart" target="_blank" rel="noopener noreferrer">@PetrKyart</a>
                    </div>
                    <div className="ct-contact-hint">Быстрый способ связи</div>
                  </div>
                </div>

                <div className="ct-note">
                  По вопросам обработки персональных данных и в соответствии с{' '}
                  <Link href="/privacy" style={{ color: 'var(--bord)' }}>Политикой конфиденциальности</Link>{' '}
                  вы также можете обратиться на указанный email.
                </div>
              </div>

              {/* RIGHT — form */}
              <div>
                <div className="ct-form-ttl">Написать нам</div>

                <div className="ct-field">
                  <label className="ct-label">Ваше имя</label>
                  <input
                    className="ct-input"
                    type="text"
                    placeholder="Иван Иванов"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="ct-field">
                  <label className="ct-label">Email для ответа</label>
                  <input
                    className="ct-input"
                    type="email"
                    placeholder="example@mail.ru"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div className="ct-field">
                  <label className="ct-label">Сообщение</label>
                  <textarea
                    className="ct-textarea"
                    placeholder="Напишите ваш вопрос или предложение..."
                    minLength={10}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <div className="ct-contact-hint">Минимум 10 символов в сообщении.</div>

                <button
                  className="ct-btn"
                  onClick={handleSubmit}
                  disabled={status === 'sending' || !form.name || !form.email || !form.message}
                >
                  {status === 'sending' ? 'Отправляем...' : 'Отправить сообщение'}
                </button>

                {status === 'sent' && (
                  <div className="ct-success">
                    ✓ Сообщение отправлено! Мы ответим вам в ближайшее время.
                  </div>
                )}
                {status === 'error' && (
                  <div className="ct-error">
                    {errorMessage || 'Ошибка отправки.'} Напишите нам напрямую: sgmy7777@mail.ru
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>

        

      </div>
    </>
  )
}
