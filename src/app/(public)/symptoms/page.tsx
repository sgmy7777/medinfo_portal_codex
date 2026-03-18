import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Симптомы — ЗдравИнфо',
  description: 'Справочник симптомов. Найдите информацию о вашем симптоме и узнайте возможные причины.',
}

const SYSTEMS: Record<string, { label: string; icon: string }> = {
  head:     { label: 'Голова и шея',            icon: '🧠' },
  chest:    { label: 'Грудная клетка',           icon: '❤️' },
  abdomen:  { label: 'Живот и пищеварение',      icon: '🫁' },
  skin:     { label: 'Кожа и волосы',            icon: '🫧' },
  joints:   { label: 'Суставы и спина',          icon: '🦴' },
  general:  { label: 'Общие симптомы',           icon: '🌡️' },
  neuro:    { label: 'Неврология',               icon: '⚡' },
  urology:  { label: 'Урология',                 icon: '💧' },
  women:    { label: 'Женское здоровье',          icon: '🌸' },
}

const SEVERITY: Record<string, { label: string; color: string }> = {
  low:    { label: 'Несрочно',  color: '#2D7A4F' },
  medium: { label: 'Умеренно', color: '#C8913A' },
  high:   { label: 'Срочно',   color: '#8B1F2A' },
}

async function getData() {
  try {
    const symptoms = await prisma.symptom.findMany({
      orderBy: [{ bodySystem: 'asc' }, { title: 'asc' }],
      include: { articles: true },
    })
    return { symptoms }
  } catch { return { symptoms: [] } }
}

export default async function SymptomsPage() {
  const { symptoms } = await getData()

  // Группируем по системам органов
  const grouped: Record<string, typeof symptoms> = {}
  for (const s of symptoms) {
    if (!grouped[s.bodySystem]) grouped[s.bodySystem] = []
    grouped[s.bodySystem].push(s)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }

        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --acc-l: #FBF3E3; --rule: #DDD5C5; --white: #FFFFFF;
        }

        /* HEADER */
        .sy { font-family: 'Golos Text', sans-serif; background: var(--bord-d); }
        .sy-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .sy-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .sy-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .sy-logo span { color: var(--acc); }
        .sy-cats { background: var(--bord-m); overflow-x: auto; scrollbar-width: none; }
        .sy-cats::-webkit-scrollbar { display: none; }
        .sy-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .sy-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; } }
        .sy-cat-lnk { display: inline-flex; align-items: center; gap: 5px; padding: 9px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.75); text-decoration: none; white-space: nowrap; transition: color 0.15s; border-bottom: 2px solid transparent; }
        .sy-cat-lnk:hover { color: white; border-bottom-color: var(--acc); }

        /* HERO */
        .sy-hero { background: linear-gradient(135deg, var(--bord-d) 0%, var(--bord) 100%); padding: 48px 24px; text-align: center; }
        .sy-hero-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--acc); margin-bottom: 12px; }
        .sy-hero-ttl { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: white; margin-bottom: 12px; }
        .sy-hero-sub { font-size: 16px; color: rgba(255,255,255,0.65); max-width: 520px; margin: 0 auto 24px; line-height: 1.6; }
        .sy-disclaimer { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 2px; padding: 10px 18px; font-size: 12px; color: rgba(255,255,255,0.55); max-width: 540px; line-height: 1.6; }

        /* MAIN */
        .sy-body { background: var(--paper); min-height: 60vh; }
        .sy-wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }

        /* SYSTEM ANCHORS */
        .sy-anchors { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; padding-bottom: 28px; border-bottom: 1px solid var(--rule); }
        .sy-anchor-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 12px; font-weight: 600; color: var(--ink-60); background: white; border: 1px solid var(--rule); border-radius: 2px; text-decoration: none; transition: all 0.15s; }
        .sy-anchor-btn:hover { background: var(--bord-l); border-color: var(--bord); color: var(--bord); }

        /* SYSTEM SECTION */
        .sy-section { margin-bottom: 48px; }
        .sy-sec-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .sy-sec-ico { font-size: 24px; }
        .sy-sec-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); }
        .sy-sec-line { flex: 1; height: 1px; background: var(--rule); }
        .sy-sec-cnt { font-size: 12px; color: var(--ink-30); }

        /* SYMPTOM GRID */
        .sy-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .sy-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 16px 18px; text-decoration: none; display: block; transition: all 0.18s; position: relative; border-left: 3px solid transparent; }
        .sy-card:hover { border-color: var(--bord); border-left-color: var(--bord); box-shadow: 0 2px 12px rgba(107,31,42,0.08); }
        .sy-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .sy-card-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.25; }
        .sy-card-sev { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 1px; white-space: nowrap; }
        .sy-card-desc { font-size: 12px; color: var(--ink-60); line-height: 1.55; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sy-card-foot { font-size: 11px; color: var(--ink-30); }
        .sy-card-foot strong { color: var(--bord); }

        /* FOOTER */
        .sy-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; font-family: 'Golos Text', sans-serif; }
        .sy-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .sy-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .sy-foot-logo span { color: var(--acc); }
        .sy-foot-lnks { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; }
        .sy-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .sy-foot-lnks a:hover { color: var(--acc); }
        .sy-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 900px) { .sy-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .sy-hero-ttl { font-size: 28px; }
          .sy-wrap { padding: 28px 14px; }
          .sy-grid { grid-template-columns: 1fr; }
          .sy-anchors { gap: 6px; }
          .sy-anchor-btn { font-size: 11px; padding: 6px 10px; }
        }
      `}</style>

      


      <div className="sy-hero">
        <div className="sy-hero-badge">Справочник симптомов</div>
        <h1 className="sy-hero-ttl">Что означает ваш симптом?</h1>
        <p className="sy-hero-sub">Найдите симптом, узнайте возможные причины и прочитайте подробные статьи о заболеваниях</p>
        <div className="sy-disclaimer">⚠️ Информация носит ознакомительный характер. При появлении симптомов обратитесь к врачу — только специалист может поставить диагноз.</div>
      </div>

      <div className="sy-body">
        <div className="sy-wrap">

          {/* Навигация по системам */}
          <div className="sy-anchors">
            {Object.entries(SYSTEMS).map(([key, sys]) => {
              const count = grouped[key]?.length ?? 0
              if (!count) return null
              return (
                <a key={key} href={`#${key}`} className="sy-anchor-btn">
                  {sys.icon} {sys.label} ({count})
                </a>
              )
            })}
          </div>

          {/* Секции по системам */}
          {Object.entries(SYSTEMS).map(([key, sys]) => {
            const list = grouped[key]
            if (!list?.length) return null
            return (
              <section key={key} id={key} className="sy-section">
                <div className="sy-sec-hdr">
                  <span className="sy-sec-ico">{sys.icon}</span>
                  <h2 className="sy-sec-ttl">{sys.label}</h2>
                  <div className="sy-sec-line" />
                  <span className="sy-sec-cnt">{list.length} симптомов</span>
                </div>
                <div className="sy-grid">
                  {list.map((s: any) => {
                    const sev = SEVERITY[s.severity] ?? SEVERITY.medium
                    const artCount = s.articles?.length ?? 0
                    return (
                      <Link key={s.id} href={`/symptoms/${s.slug}`} className="sy-card">
                        <div className="sy-card-top">
                          <div className="sy-card-ttl">{s.title}</div>
                          <div className="sy-card-sev" style={{ background: `${sev.color}15`, color: sev.color }}>
                            {sev.label}
                          </div>
                        </div>
                        {s.description && <p className="sy-card-desc">{s.description}</p>}
                        <div className="sy-card-foot">
                          {artCount > 0
                            ? <><strong>{artCount}</strong> {artCount === 1 ? 'статья' : artCount < 5 ? 'статьи' : 'статей'}</>
                            : 'Подробнее →'}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}

        </div>
      </div>

      <footer className="sy-foot">
        <div className="sy-foot-in">
          <Link href="/" className="sy-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="sy-foot-lnks">
            <Link href="/">Главная</Link>
            <Link href="/symptoms">Симптомы</Link>
            <Link href="/privacy">Конфиденциальность</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div className="sy-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Материалы носят образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
