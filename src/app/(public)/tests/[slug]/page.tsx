import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ slug: string }> }

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  blood_general:  { label: 'Общий анализ крови',  icon: '🩸' },
  blood_biochem:  { label: 'Биохимия крови',       icon: '⚗️' },
  blood_hormones: { label: 'Гормоны',              icon: '🔬' },
  urine:          { label: 'Анализ мочи',          icon: '🫧' },
  coagulation:    { label: 'Коагулограмма',        icon: '🩹' },
  immunology:     { label: 'Иммунология',          icon: '🛡️' },
  other:          { label: 'Прочие анализы',       icon: '📋' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const test = await prisma.labTest.findUnique({ where: { slug }, select: { title: true } })
    if (!test) return { title: 'Анализ не найден — ЗдравИнфо' }
    return {
      title: `${test.title} — норма и расшифровка | ЗдравИнфо`,
      description: `${test.title}: норма у мужчин и женщин, причины отклонений, как подготовиться к сдаче. Расшифровка анализа на ЗдравИнфо.`,
    }
  } catch { return { title: 'Анализ — ЗдравИнфо' } }
}

async function getData(slug: string) {
  try {
    // Последовательные запросы — connection_limit=1 не позволяет параллельные
    const test = await prisma.labTest.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            article: {
              select: {
                id: true, title: true, slug: true, excerpt: true,
                ogImageUrl: true, viewCount: true, publishedAt: true,
                isPublished: true,
                category: { select: { title: true, slug: true } },
                author: { select: { name: true } },
              }
            }
          }
        }
      }
    })
    const allTests = await prisma.labTest.findMany({
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
      select: { id: true, title: true, slug: true, category: true, unit: true },
    })
    return { test, allTests }
  } catch { return { test: null, allTests: [] } }
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function TestDescription({ text }: { text: string }) {
  const sections = text.split(/\n(?=[А-ЯA-Z][А-ЯA-Z\s«»()\/–-]+:)/u)
  return (
    <div className="tt-desc-block">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n').filter(Boolean)
        if (!lines.length) return null
        const firstLine = lines[0]
        const isHeader = /^[А-ЯA-Z«»][А-ЯA-Z\s«»()\/–-]+:/u.test(firstLine)
        const header = isHeader ? firstLine : null
        const body = isHeader ? lines.slice(1) : lines
        return (
          <div key={i} className="tt-desc-section">
            {header && <div className="tt-desc-ttl">{header}</div>}
            <ul className="tt-desc-list">
              {body.map((line, j) => {
                const isBullet = line.startsWith('•')
                const txt = isBullet ? line.substring(1).trim() : line
                if (!isBullet) return <p key={j} style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 6 }}>{txt}</p>
                 const safeText = escapeHtml(txt)
                return <li key={j} dangerouslySetInnerHTML={{ __html: safeText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^([^—]+—)/, '<strong>$1</strong>') }} />
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default async function TestPage({ params }: Props) {
  const { slug } = await params
  const { test, allTests } = await getData(slug)
  if (!test) notFound()

  const cat = CATEGORIES[test.category] ?? { label: test.category, icon: '📋' }
  const articles = test.articles.map((ta: any) => ta.article).filter((a: any) => a && a.isPublished)
  const sameCategory = allTests.filter((t: any) => t.category === test.category && t.slug !== slug)

  const hasMaleNorm    = !!test.normMale
  const hasFemaleNorm  = !!test.normFemale
  const hasGeneralNorm = !!test.normGeneral

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
        .tt { font-family: 'Golos Text', sans-serif; background: var(--bord-d); }
        .tt-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .tt-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .tt-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .tt-logo span { color: var(--acc); }
        .tt-cats { background: var(--bord-m); overflow-x: auto; scrollbar-width: none; }
        .tt-cats::-webkit-scrollbar { display: none; }
        .tt-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .tt-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; } }
        .tt-cat-lnk { display: inline-flex; align-items: center; gap: 5px; padding: 9px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.75); text-decoration: none; white-space: nowrap; transition: color 0.15s; border-bottom: 2px solid transparent; }
        .tt-cat-lnk:hover { color: white; border-bottom-color: var(--acc); }

        /* BREADCRUMB */
        .tt-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .tt-bread-in { max-width: 1200px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .tt-bread a { color: var(--ink-60); text-decoration: none; }
        .tt-bread a:hover { color: var(--bord); }
        .tt-bread-sep { color: var(--rule); }

        /* HERO */
        .tt-hero { background: white; border-bottom: 2px solid var(--ink); padding: 40px 24px 36px; }
        .tt-hero-in { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 280px; gap: 48px; align-items: start; }

        .tt-cat-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bord); margin-bottom: 14px; }
        .tt-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: var(--ink); line-height: 1.15; margin-bottom: 20px; }

        /* NORMS TABLE */
        .tt-norms { border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; margin-bottom: 20px; }
        .tt-norms-hdr { background: var(--bord); padding: 10px 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.8); }
        .tt-norms-row { display: grid; grid-template-columns: auto 1fr 1fr; gap: 0; border-bottom: 1px solid var(--rule); }
        .tt-norms-row:last-child { border-bottom: none; }
        .tt-norms-cell { padding: 10px 16px; font-size: 14px; }
        .tt-norms-cell-lbl { font-weight: 600; color: var(--ink-60); background: var(--paper); border-right: 1px solid var(--rule); display: flex; align-items: center; gap: 6px; min-width: 100px; }
        .tt-norms-val { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--bord); }
        .tt-norms-unit { font-size: 12px; color: var(--ink-30); margin-left: 4px; font-weight: 400; font-family: 'Golos Text', sans-serif; }
        .tt-norms-note { padding: 10px 16px; font-size: 12px; color: var(--ink-60); background: var(--acc-l); line-height: 1.6; border-top: 1px solid var(--rule); }

        /* PREPARATION */
        .tt-prep { background: var(--paper); border: 1px solid var(--rule); border-left: 3px solid var(--acc); border-radius: 2px; padding: 14px 16px; margin-bottom: 20px; }
        .tt-prep-ttl { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--acc); margin-bottom: 6px; }
        .tt-prep-txt { font-size: 13px; color: var(--ink-60); line-height: 1.65; }

        /* DESCRIPTION */
        .tt-desc-block { background: var(--paper); border: 1px solid var(--rule); border-radius: 2px; padding: 20px 24px; }
        .tt-desc-section { margin-bottom: 16px; }
        .tt-desc-section:last-child { margin-bottom: 0; }
        .tt-desc-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--bord); margin-bottom: 8px; }
        .tt-desc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
        .tt-desc-list li { font-size: 14px; color: var(--ink-60); line-height: 1.6; padding-left: 16px; position: relative; }
        .tt-desc-list li::before { content: "•"; position: absolute; left: 0; color: var(--bord); font-weight: 700; }

        /* SIDEBAR */
        .tt-side { }
        .tt-side-box { background: var(--paper); border: 1px solid var(--rule); border-radius: 2px; padding: 20px; margin-bottom: 16px; }
        .tt-side-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--rule); }
        .tt-side-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .tt-side-item a { font-size: 13px; color: var(--ink-60); text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .tt-side-item a:hover { color: var(--bord); }
        .tt-side-item a::before { content: '→'; color: var(--acc); font-size: 11px; }
        .tt-side-unit { font-size: 11px; color: var(--ink-30); margin-left: auto; }

        /* AD */
        .tt-ad-box { background: var(--white); border: 1px solid var(--rule); padding: 14px; margin-bottom: 16px; }
        .tt-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .tt-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .tt-ad-incontent { margin: 28px 0; padding: 14px; background: white; border: 1px solid var(--rule); border-top: 2px solid var(--bord); }
        .tt-ad-incontent-slot { min-height: 180px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .tt-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .tt-ad-under-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .tt-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        /* BODY */
        .tt-body { background: var(--paper); }
        .tt-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 24px 56px; }
        .tt-sec-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .tt-sec-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); }
        .tt-sec-line { flex: 1; height: 1px; background: var(--rule); }
        .tt-art-list { display: flex; flex-direction: column; gap: 16px; }
        .tt-art-item { background: white; border: 1px solid var(--rule); border-radius: 2px; display: grid; grid-template-columns: 140px 1fr; text-decoration: none; transition: box-shadow 0.18s; overflow: hidden; }
        .tt-art-item:hover { box-shadow: 0 2px 16px rgba(107,31,42,0.10); }
        .tt-art-img { height: 100px; overflow: hidden; background: var(--bord-l); }
        .tt-art-img img { width: 100%; height: 100%; object-fit: cover; }
        .tt-art-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; opacity: 0.35; }
        .tt-art-body { padding: 14px 18px; }
        .tt-art-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--bord); margin-bottom: 5px; }
        .tt-art-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 6px; }
        .tt-art-exc { font-size: 12px; color: var(--ink-60); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tt-art-meta { font-size: 11px; color: var(--ink-30); margin-top: 8px; }
        .tt-empty { text-align: center; padding: 48px 0; color: var(--ink-60); font-size: 15px; }

        /* FOOTER */
        .tt-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; font-family: 'Golos Text', sans-serif; }
        .tt-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .tt-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .tt-foot-logo span { color: var(--acc); }
        .tt-foot-lnks { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; }
        .tt-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .tt-foot-lnks a:hover { color: var(--acc); }
        .tt-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 900px) {
          .tt-hero-in { grid-template-columns: 1fr; gap: 24px; }
          .tt-side { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .tt-ad-slot { min-height: 160px; }
        }
        @media (max-width: 600px) {
          .tt-title { font-size: 28px; }
          .tt-wrap { padding: 28px 14px 40px; }
          .tt-art-item { grid-template-columns: 100px 1fr; }
          .tt-art-img { height: 90px; }
          .tt-side { grid-template-columns: 1fr; }
          .tt-hero { padding: 28px 14px 24px; }
          .tt-ad-under-slot { min-height: 60px; font-size: 11px; }
          .tt-ad-under-in { padding: 0 14px; }
        }
      `}</style>

      


      <div className="tt-bread">
        <div className="tt-bread-in">
          <Link href="/">Главная</Link>
          <span className="tt-bread-sep">›</span>
          <Link href="/tests">Справочник анализов</Link>
          <span className="tt-bread-sep">›</span>
          <span>{test.title}</span>
        </div>
      </div>

      <div style={{ background: 'white' }}>
        <div className="tt-hero">
          <div className="tt-hero-in">
            <div>
              <div className="tt-cat-badge">{cat.icon} {cat.label}</div>
              <h1 className="tt-title">{test.title}</h1>

              {/* Таблица норм */}
              {(hasMaleNorm || hasFemaleNorm || hasGeneralNorm) && (
                <div className="tt-norms">
                  <div className="tt-norms-hdr">Референсные значения</div>
                  {hasGeneralNorm && (
                    <div className="tt-norms-row">
                      <div className="tt-norms-cell tt-norms-cell-lbl">Норма</div>
                      <div className="tt-norms-cell" style={{ gridColumn: 'span 2' }}>
                        <span className="tt-norms-val">{test.normGeneral}</span>
                      </div>
                    </div>
                  )}
                  {hasMaleNorm && (
                    <div className="tt-norms-row">
                      <div className="tt-norms-cell tt-norms-cell-lbl">♂ Мужчины</div>
                      <div className="tt-norms-cell" style={{ gridColumn: 'span 2' }}>
                        <span className="tt-norms-val">{test.normMale}</span>
                      </div>
                    </div>
                  )}
                  {hasFemaleNorm && (
                    <div className="tt-norms-row">
                      <div className="tt-norms-cell tt-norms-cell-lbl">♀ Женщины</div>
                      <div className="tt-norms-cell" style={{ gridColumn: 'span 2' }}>
                        <span className="tt-norms-val">{test.normFemale}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Подготовка к сдаче */}
              {test.preparation && (
                <div className="tt-prep">
                  <div className="tt-prep-ttl">📋 Подготовка к сдаче</div>
                  <div className="tt-prep-txt">{test.preparation}</div>
                </div>
              )}

              {/* Описание */}
              {test.description && <TestDescription text={test.description} />}
            </div>

            <div className="tt-side">
              {/* Другие анализы той же категории */}
              {sameCategory.length > 0 && (
                <div className="tt-side-box">
                  <div className="tt-side-ttl">{cat.icon} {cat.label}</div>
                  <ul className="tt-side-list">
                    {sameCategory.slice(0, 10).map((t: any) => (
                      <li key={t.id} className="tt-side-item">
                        <Link href={`/tests/${t.slug}`}>
                          {t.title}
                          {t.unit && <span className="tt-side-unit">{t.unit}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {sameCategory.length > 10 && (
                    <div style={{ marginTop: 10, fontSize: 12 }}>
                      <Link href="/tests" style={{ color: 'var(--bord)', textDecoration: 'none' }}>Все анализы →</Link>
                    </div>
                  )}
                </div>
              )}

              {/* Рекламный блок 1 */}
              <div className="tt-ad-box">
                <div className="tt-ad-label">Реклама</div>
                <div id="yandex_rtb_test_sidebar_1" className="tt-ad-slot">Реклама РСЯ — блок 1</div>
              </div>

              <div className="tt-side-box">
                <div className="tt-side-ttl">🔍 Разделы</div>
                <ul className="tt-side-list">
                  {[
                    { href: '/tests/decode', label: '🔬 Расшифровать анализы' },
                    { href: '/calculators/lab', label: '🧪 Калькуляторы анализов' },
                    { href: '/tests', label: 'Все анализы' },
                    { href: '/symptoms', label: 'Справочник симптомов' },
                    { href: '/contacts', label: 'Задать вопрос' },
                  ].map(l => (
                    <li key={l.href} className="tt-side-item">
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Рекламный блок 2 */}
              <div className="tt-ad-box">
                <div className="tt-ad-label">Реклама</div>
                <div id="yandex_rtb_test_sidebar_2" className="tt-ad-slot">Реклама РСЯ — блок 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tt-body">
        <div className="tt-wrap">
          {articles.length > 0 ? (
            <>
              <div className="tt-sec-hdr">
                <h2 className="tt-sec-ttl">Статьи по теме</h2>
                <div className="tt-sec-line" />
                <span style={{ fontSize: 12, color: 'var(--ink-30)' }}>{articles.length} материалов</span>
              </div>
              <div className="tt-art-list">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="tt-art-item">
                    <div className="tt-art-img">
                      {a.ogImageUrl
                        ? <img src={a.ogImageUrl} alt={a.title} />
                        : <div className="tt-art-ph">🩺</div>}
                    </div>
                    <div className="tt-art-body">
                      {a.category && <div className="tt-art-cat">{a.category.title}</div>}
                      <div className="tt-art-ttl">{a.title}</div>
                      {a.excerpt && <p className="tt-art-exc">{a.excerpt}</p>}
                      <div className="tt-art-meta">{a.author?.name} · {formatDate(a.publishedAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="tt-ad-incontent">
                <div className="tt-ad-label">Реклама</div>
                <div id="yandex_rtb_test_incontent" className="tt-ad-incontent-slot">Реклама внутри страницы анализа (РСЯ)</div>
              </div>
            </>
          ) : (
            <div className="tt-empty">Статьи по этому анализу скоро появятся</div>
          )}
        </div>
      </div>

      <div className="tt-ad-under">
        <div className="tt-ad-under-in">
          <div className="tt-ad-label">Реклама</div>
          <div id="yandex_rtb_test_under" className="tt-ad-under-slot">Реклама под страницей анализа (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      <footer className="tt-foot">
        <div className="tt-foot-in">
          <Link href="/" className="tt-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="tt-foot-lnks">
            <Link href="/">Главная</Link>
            <Link href="/tests">Анализы</Link>
            <Link href="/symptoms">Симптомы</Link>
            <Link href="/calculators">Калькуляторы</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div className="tt-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Материалы носят образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
