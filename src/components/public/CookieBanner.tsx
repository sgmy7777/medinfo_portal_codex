'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = document.cookie.includes('cookie_consent=1')
    if (!accepted) setVisible(true)
  }, [])

  function accept() {
    // Сохраняем согласие на 1 год
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `cookie_consent=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        .ck-banner {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
          background: #1C1208; border-top: 2px solid #6B1F2A;
          padding: 14px 24px; display: flex; align-items: center;
          justify-content: space-between; gap: 20px; flex-wrap: wrap;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
        }
        .ck-text {
          font-family: 'Golos Text', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.7); line-height: 1.5; flex: 1; min-width: 200px;
        }
        .ck-text a { color: #C8913A; text-decoration: underline; }
        .ck-btn {
          background: #6B1F2A; color: white; border: none; border-radius: 2px;
          padding: 9px 22px; font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Golos Text', sans-serif; white-space: nowrap;
          transition: background 0.15s; letter-spacing: 0.04em;
        }
        .ck-btn:hover { background: #8B2D3A; }
        @media (max-width: 500px) { .ck-banner { padding: 12px 16px; } }
      `}</style>
      <div className="ck-banner" role="dialog" aria-label="Согласие на использование cookie">
        <p className="ck-text">
          Мы используем файлы cookie для аналитики и показа рекламы.
          Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
          <Link href="/privacy">политикой конфиденциальности</Link>.
        </p>
        <button className="ck-btn" onClick={accept}>Понятно</button>
      </div>
    </>
  )
}
