import Link from 'next/link'

export function UnifiedHeader() {
  const todayStr = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <header className="uh">
        <div className="uh-top">
          <div className="uh-top-in">
            <span className="uh-top-badge">Медицинский информационный портал</span>
            <Link href="/symptoms" className="uh-nav-link">🌡️ Симптомы</Link>
            <Link href="/tests" className="uh-nav-link">🧪 Анализы</Link>
            <Link href="/tests/decode" className="uh-nav-link">🔬 Расшифровка</Link>
            <Link href="/calculators" className="uh-nav-link">⚖️ Калькуляторы</Link>
            <span className="uh-top-date">{todayStr}</span>
          </div>
        </div>
        <div className="uh-main">
          <Link href="/" className="uh-logo">
            <div className="uh-logo-text">Здрав<span>Инфо</span></div>
            <div className="uh-logo-sub">Медицинский портал</div>
          </Link>
        </div>
      </header>

      <style jsx>{`
        .uh { background: #4A0F17; }
        .uh-top { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 6px 0; }
        .uh-top-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .uh-top-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C8913A; }
        .uh-nav-link { font-size: 11px; color: rgba(255,255,255,0.55); text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; transition: color 0.15s; }
        .uh-nav-link:hover { color: #C8913A; }
        .uh-top-date { font-size: 11px; color: rgba(255,255,255,0.3); font-style: italic; }
        .uh-main { max-width: 1200px; margin: 0 auto; padding: 20px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .uh-logo { text-decoration: none; }
        .uh-logo-text { font-family: 'Playfair Display', serif; font-size: 46px; font-weight: 900; color: white; letter-spacing: -2px; line-height: 1; text-align: center; }
        .uh-logo-text span { color: #C8913A; }
        .uh-logo-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.22em; text-transform: uppercase; margin-top: 4px; text-align: center; }

        @media (max-width: 900px) {
          .uh-top-in { justify-content: center; }
        }
      `}</style>
    </>
  )
}
