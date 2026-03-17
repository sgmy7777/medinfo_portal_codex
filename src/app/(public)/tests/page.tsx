import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { UnifiedHeader } from '@/components/public/UnifiedHeader'

export const metadata: Metadata = {
  title: 'Справочник анализов — ЗдравИнфо',
  description: 'Расшифровка анализов крови, мочи и гормонов. Нормы показателей, причины отклонений, подготовка к сдаче.',
}

const CATEGORIES: Record<string, { label: string; icon: string; desc: string }> = {
  blood_general:   { label: 'Общий анализ крови',      icon: '🩸', desc: 'Гемоглобин, лейкоциты, тромбоциты, СОЭ' },
  blood_biochem:   { label: 'Биохимия крови',          icon: '⚗️', desc: 'Глюкоза, холестерин, ферменты, белки, электролиты' },
  blood_hormones:  { label: 'Гормоны',                 icon: '🔬', desc: 'ТТГ, инсулин, кортизол, половые гормоны' },
  urine:           { label: 'Анализ мочи',             icon: '🫧', desc: 'Белок, лейкоциты, эритроциты, осадок' },
  coagulation:     { label: 'Коагулограмма',           icon: '🩹', desc: 'МНО, D-димер, фибриноген, свёртываемость' },
  immunology:      { label: 'Иммунология',             icon: '🛡️', desc: 'Антитела, иммуноглобулины, аутоиммунные маркеры' },
  other:           { label: 'Прочие',                  icon: '📋', desc: 'Онкомаркеры, инфекции, специальные тесты' },
}

async function getData() {
  try {
    const tests = await prisma.labTest.findMany({
        orderBy: [{ category: 'asc' }, { title: 'asc' }],
        include: { articles: true },
      })
    const categories = await prisma.category.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true, slug: true } })
    return { tests, categories }
  } catch { return { tests: [], categories: [] } }
}

export default async function TestsPage() {
  const { tests, categories } = await getData()

  const grouped: Record<string, typeof tests> = {}
  for (const t of tests) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  }

  const catIcons: Record<string, string> = {
    'kardiologiya':'❤️','nevrologiya':'🧠','gastroenterologiya':'🫁',
    'stomatologiya':'🦷','dermatologiya':'🫧','pediatriya':'👶',
    'endokrinologiya':'⚗️','onkologiya':'🔬','travmatologiya':'🦴',
    'khirurgiya':'🩺','urologiya':'💧','ginekologiya':'🌸',
    'oftalmologiya':'👁️','lor':'👂','psikhiatriya':'🧩',
    'pulmonologiya':'💨','revmatologiya':'💊','nefrologiya':'🫘',
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
        .ts { font-family: 'Golos Text', sans-serif; background: var(--bord-d); }
        .ts-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .ts-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .ts-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .ts-logo span { color: var(--acc); }
        .ts-cats { background: var(--bord-m); overflow-x: auto; scrollbar-width: none; }
        .ts-cats::-webkit-scrollbar { display: none; }
        .ts-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .ts-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; } }
        .ts-cat-lnk { display: inline-flex; align-items: center; gap: 5px; padding: 9px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.75); text-decoration: none; white-space: nowrap; transition: color 0.15s; border-bottom: 2px solid transparent; }
        .ts-cat-lnk:hover { color: white; border-bottom-color: var(--acc); }

        .ts-hero { background: linear-gradient(135deg, var(--bord-d) 0%, var(--bord) 100%); padding: 48px 24px; text-align: center; }
        .ts-hero-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--acc); margin-bottom: 12px; }
        .ts-hero-ttl { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; color: white; margin-bottom: 12px; }
        .ts-hero-sub { font-size: 16px; color: rgba(255,255,255,0.65); max-width: 540px; margin: 0 auto 24px; line-height: 1.6; }
        .ts-decode-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px 24px; background: white; color: var(--bord); font-size: 13px; font-weight: 700; text-decoration: none; border: 2px solid rgba(255,255,255,0.3); border-radius: 2px; letter-spacing: 0.05em; transition: all 0.15s; }
        .ts-decode-btn:hover { background: var(--bord-l); border-color: var(--bord-l); }
        .ts-disclaimer { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 2px; padding: 10px 18px; font-size: 12px; color: rgba(255,255,255,0.55); max-width: 560px; line-height: 1.6; }

        .ts-body { background: var(--paper); min-height: 60vh; }
        .ts-wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px 72px; }

        .ts-cat-anchors { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; padding-bottom: 28px; border-bottom: 1px solid var(--rule); }
        .ts-anchor-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 12px; font-weight: 600; color: var(--ink-60); background: white; border: 1px solid var(--rule); border-radius: 2px; text-decoration: none; transition: all 0.15s; }
        .ts-anchor-btn:hover { background: var(--bord-l); border-color: var(--bord); color: var(--bord); }

        .ts-section { margin-bottom: 52px; }
        .ts-sec-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .ts-sec-ico { font-size: 24px; }
        .ts-sec-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); }
        .ts-sec-desc { font-size: 13px; color: var(--ink-30); }
        .ts-sec-line { flex: 1; height: 1px; background: var(--rule); }
        .ts-sec-cnt { font-size: 12px; color: var(--ink-30); }

        .ts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .ts-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 16px 18px; text-decoration: none; display: block; transition: all 0.18s; border-left: 3px solid transparent; }
        .ts-card:hover { border-color: var(--bord); border-left-color: var(--bord); box-shadow: 0 2px 12px rgba(107,31,42,0.08); }
        .ts-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 5px; }
        .ts-card-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.25; }
        .ts-card-unit { font-size: 11px; color: var(--ink-30); background: var(--paper); padding: 2px 7px; border-radius: 2px; white-space: nowrap; flex-shrink: 0; }
        .ts-card-norm { font-size: 12px; color: var(--ink-60); margin-bottom: 6px; }
        .ts-card-norm strong { color: var(--bord); }
        .ts-card-foot { font-size: 11px; color: var(--ink-30); }
        .ts-card-foot strong { color: var(--bord); }

        .ts-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin: 32px 0; }
        .ts-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .ts-ad-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .ts-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; font-family: 'Golos Text', sans-serif; }
        .ts-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .ts-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .ts-foot-logo span { color: var(--acc); }
        .ts-foot-lnks { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; }
        .ts-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .ts-foot-lnks a:hover { color: var(--acc); }
        .ts-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 900px) { .ts-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .ts-hero-ttl { font-size: 28px; }
          .ts-wrap { padding: 28px 14px 48px; }
          .ts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <UnifiedHeader />

      <div className="ts-cats">
        <div className="ts-cats-in">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="ts-cat-lnk">
              {catIcons[cat.slug] && <span>{catIcons[cat.slug]}</span>}
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="ts-hero">
        <div className="ts-hero-badge">Медицинская диагностика</div>
        <h1 className="ts-hero-ttl">Справочник анализов</h1>
        <p className="ts-hero-sub">Нормы показателей, расшифровка отклонений и подготовка к сдаче — для каждого анализа</p>
        <div className="ts-disclaimer">⚠️ Расшифровка носит ознакомительный характер. Интерпретировать результаты и назначать лечение должен только врач.</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}><Link href="/tests/decode" className="ts-decode-btn">🔬 Расшифровать мои анализы →</Link><Link href="/calculators/lab" className="ts-decode-btn" style={{ background: "white", borderColor: "white", color: "var(--bord)" }}>🧪 Калькуляторы анализов →</Link></div>
      </div>

      <div className="ts-body">
        <div className="ts-wrap">

          {/* Навигация по категориям */}
          <div className="ts-cat-anchors">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const count = grouped[key]?.length ?? 0
              if (!count) return null
              return (
                <a key={key} href={`#${key}`} className="ts-anchor-btn">
                  {cat.icon} {cat.label} ({count})
                </a>
              )
            })}
          </div>

          {/* Секции по категориям */}
          {Object.entries(CATEGORIES).map(([key, cat], idx) => {
            const list = grouped[key]
            if (!list?.length) return null
            return (
              <section key={key} id={key} className="ts-section">
                <div className="ts-sec-hdr">
                  <span className="ts-sec-ico">{cat.icon}</span>
                  <div>
                    <h2 className="ts-sec-ttl">{cat.label}</h2>
                    <div className="ts-sec-desc">{cat.desc}</div>
                  </div>
                  <div className="ts-sec-line" />
                  <span className="ts-sec-cnt">{list.length} показателей</span>
                </div>
                <div className="ts-grid">
                  {list.map((t: any) => {
                    const artCount = t.articles?.length ?? 0
                    const hasMaleNorm = !!t.normMale
                    const hasFemaleNorm = !!t.normFemale
                    const hasGeneralNorm = !!t.normGeneral
                    return (
                      <Link key={t.id} href={`/tests/${t.slug}`} className="ts-card">
                        <div className="ts-card-top">
                          <div className="ts-card-ttl">{t.title}</div>
                          {t.unit && <span className="ts-card-unit">{t.unit}</span>}
                        </div>
                        {hasMaleNorm && (
                          <div className="ts-card-norm">
                            {hasGeneralNorm && <strong>{t.normGeneral}</strong>}{hasMaleNorm && <> ♂ <strong>{t.normMale}</strong></>}{hasFemaleNorm && <> · ♀ <strong>{t.normFemale}</strong></>}
                          </div>
                        )}
                        <div className="ts-card-foot">
                          {artCount > 0
                            ? <><strong>{artCount}</strong> {artCount === 1 ? 'статья' : artCount < 5 ? 'статьи' : 'статей'}</>
                            : 'Подробнее →'}
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Рекламный баннер после каждой второй секции */}
                {(idx === 1 || idx === 3) && (
                  <div className="ts-ad-box">
                    <div className="ts-ad-label">Реклама</div>
                    <div id={`yandex_rtb_tests_list_${idx}`} className="ts-ad-slot">Реклама РСЯ — горизонтальный баннер</div>
                  </div>
                )}
              </section>
            )
          })}

        </div>
      </div>

      <footer className="ts-foot">
        <div className="ts-foot-in">
          <Link href="/" className="ts-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="ts-foot-lnks">
            <Link href="/">Главная</Link>
            <Link href="/symptoms">Симптомы</Link>
            <Link href="/calculators">Калькуляторы</Link>
            <Link href="/privacy">Конфиденциальность</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div className="ts-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Материалы носят образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
