import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/public/Breadcrumbs'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ slug: string }> }

const SYSTEMS: Record<string, { label: string; icon: string }> = {
  head:    { label: 'Голова и шея',        icon: '🧠' },
  chest:   { label: 'Грудная клетка',      icon: '❤️' },
  abdomen: { label: 'Живот и пищеварение', icon: '🫁' },
  skin:    { label: 'Кожа и волосы',       icon: '🫧' },
  joints:  { label: 'Суставы и спина',     icon: '🦴' },
  general: { label: 'Общие симптомы',      icon: '🌡️' },
  neuro:   { label: 'Неврология',          icon: '⚡' },
  urology: { label: 'Урология',            icon: '💧' },
  women:   { label: 'Женское здоровье',    icon: '🌸' },
}

const SEVERITY: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Несрочно — можно обратиться к врачу планово',       color: '#2D7A4F', bg: '#EBF7F1' },
  medium: { label: 'Умеренно — обратитесь к врачу в ближайшее время',   color: '#C8913A', bg: '#FBF3E3' },
  high:   { label: 'Срочно — требуется скорейшая консультация врача',   color: '#8B1F2A', bg: '#F9EAEC' },
}


// Строим FAQ из структурированного описания симптома
function buildFAQ(title: string, description: string | null): Array<{q: string; a: string}> {
  const faq: Array<{q: string; a: string}> = []
  if (!description) return faq

  // Стандартные вопросы всегда
  faq.push({ q: `Что такое симптом «${title}»?`, a: description.split('\n')[0].slice(0, 300) })

  // Извлекаем разделы КАПСОМ
  const SECTION_LABELS: Record<string, string> = {
    'ОСНОВНЫЕ ПРИЧИНЫ':       `Каковы основные причины симптома «${title}»?`,
    'ПРИЧИНЫ':                `Каковы причины симптома «${title}»?`,
    'ТРЕВОЖНЫЕ ПРИЗНАКИ':     `Какие тревожные признаки требуют срочного обращения к врачу?`,
    'КОГДА К ВРАЧУ':          'Когда нужно срочно обратиться к врачу?',
    'ДИАГНОСТИКА':            'Как диагностируется это состояние?',
    'ЛЕЧЕНИЕ':                'Как лечится это состояние?',
    'ОБСЛЕДОВАНИЕ':           'Какие анализы нужно сдать?',
    'ПРОФИЛАКТИКА':           'Как предотвратить этот симптом?',
  }

  const sections = description.split(/\n(?=[А-ЯA-Z][А-ЯA-Z\s«»()\/–-]{3,}:)/u)
  for (const section of sections.slice(1)) {
    const lines = section.trim().split('\n').filter(Boolean)
    if (!lines.length) continue
    const header = lines[0].replace(/:$/, '').trim().toUpperCase()
    const body = lines.slice(1).join(' ').replace(/•\s*/g, '').slice(0, 400)
    if (!body) continue

    // Ищем подходящий вопрос
    const question = Object.entries(SECTION_LABELS).find(([key]) =>
      header.includes(key)
    )?.[1]

    if (question && body.length > 30) {
      faq.push({ q: question, a: body })
    }
  }

  return faq.slice(0, 6) // Не более 6 вопросов
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const symptom = await prisma.symptom.findUnique({ where: { slug }, select: { title: true, description: true } })
    if (!symptom) return { title: 'Симптом не найден — ЗдравИнфо' }
    const desc = symptom.description
      ? symptom.description.slice(0, 160).split('\n').join(' ')
      : `${symptom.title}: возможные причины, когда обратиться к врачу и полезные статьи.`
    return {
      title: `${symptom.title} — причины и что делать | ЗдравИнфо`,
      description: desc,
      openGraph: {
        title: `${symptom.title} — причины и что делать`,
        description: desc,
        type: 'article',
      },
      other: {
        'script:ld+json': JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: symptom.title,
            description: desc,
            about: { '@type': 'MedicalCondition', name: symptom.title },
            publisher: { '@type': 'Organization', name: 'ЗдравИнфо' },
          },
          ...(buildFAQ(symptom.title, symptom.description ?? null).length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: buildFAQ(symptom.title, symptom.description ?? null).map(item => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }] : []),
        ]),
      },
    }
  } catch { return { title: 'Симптом — ЗдравИнфо' } }
}

async function getData(slug: string) {
  // Последовательные запросы — connection_limit=1 не позволяет параллельные
  const symptom = await prisma.symptom.findUnique({
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
  const allSymptoms = await prisma.symptom.findMany({
    orderBy: [{ bodySystem: 'asc' }, { title: 'asc' }],
    select: { id: true, title: true, slug: true, bodySystem: true, severity: true },
  })
  return { symptom, allSymptoms }
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

function SymptomDescription({ text }: { text: string }) {
  // Разбиваем на секции по заголовкам (строки КАПСОМ с двоеточием)
  const sections = text.split(/\n(?=[А-ЯA-Z][А-ЯA-Z\s«»()\/–-]+:)/u)
  return (
    <div className="sp-desc-block">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n').filter(Boolean)
        if (!lines.length) return null
        const firstLine = lines[0]
        const isHeader = /^[А-ЯA-Z«»][А-ЯA-Z\s«»()\/–-]+:/u.test(firstLine)
        const header = isHeader ? firstLine : null
        const body = isHeader ? lines.slice(1) : lines
        return (
          <div key={i} className="sp-desc-section">
            {header && <div className="sp-desc-section-ttl">{header}</div>}
            <ul className="sp-desc-list">
              {body.map((line, j) => {
                const isBullet = line.startsWith('•')
                const text = isBullet ? line.substring(1).trim() : line
                if (!isBullet) return <p key={j} style={{fontSize:14, color:'var(--ink-60)', lineHeight:1.65, marginBottom:6}}>{text}</p>
                const safeText = escapeHtml(text)
                return <li key={j} dangerouslySetInnerHTML={{__html: safeText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^([^—]+—)/, '<strong>$1</strong>')}} />
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default async function SymptomPage({ params }: Props) {
  const { slug } = await params
  const { symptom, allSymptoms } = await getData(slug)
  if (!symptom) notFound()

  const sys = SYSTEMS[symptom.bodySystem] ?? { label: symptom.bodySystem, icon: '🩺' }
  const sev = SEVERITY[symptom.severity] ?? SEVERITY.medium
  const articles = symptom.articles.map((sa: any) => sa.article).filter((a: any) => a && a.isPublished)
  const sameSystem = allSymptoms.filter((s: any) => s.bodySystem === symptom.bodySystem && s.slug !== slug)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
.sp { font-family: 'Golos Text', sans-serif; background: var(--bord-d); }
        .sp-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .sp-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .sp-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .sp-logo span { color: var(--acc); }
        .sp-cats { background: var(--bord-m); overflow-x: auto; scrollbar-width: none; }
        .sp-cats::-webkit-scrollbar { display: none; }
        .sp-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .sp-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; } }
        .sp-cat-lnk { display: inline-flex; align-items: center; gap: 5px; padding: 9px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.75); text-decoration: none; white-space: nowrap; transition: color 0.15s; border-bottom: 2px solid transparent; }
        .sp-cat-lnk:hover { color: white; border-bottom-color: var(--acc); }

        /* BREADCRUMB */
        .sp-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .sp-bread-in { max-width: 1200px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .sp-bread a { color: var(--ink-60); text-decoration: none; }
        .sp-bread a:hover { color: var(--bord); }
        .sp-bread-sep { color: var(--rule); }

        /* HERO */
        .sp-crumbs { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .sp-crumbs-in { max-width: 1200px; margin: 0 auto; padding: 10px 24px; }
        .sp-hero { background: var(--white); border-bottom: 2px solid var(--ink); padding: 40px 24px 36px; }
        .sp-hero-in { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 280px; gap: 48px; align-items: start; }
        .sp-sys-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bord); margin-bottom: 14px; }
        .sp-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: var(--ink); line-height: 1.15; margin-bottom: 16px; }
        .sp-desc { font-size: 15px; color: var(--ink-60); line-height: 1.75; margin-bottom: 20px; white-space: pre-line; }
        .sp-desc-block { background: var(--paper); border: 1px solid var(--rule); border-radius: 2px; padding: 20px 24px; margin-bottom: 20px; }
        .sp-desc-block p { font-size: 15px; color: var(--ink-60); line-height: 1.75; margin-bottom: 14px; }
        .sp-desc-block p:last-child { margin-bottom: 0; }
        .sp-desc-block p strong { color: var(--ink); }
        .sp-desc-section { margin-bottom: 16px; }
        .sp-desc-section-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--bord); margin-bottom: 8px; letter-spacing: 0.01em; }
        .sp-desc-list { list-style: none; padding: 0; margin: 0 0 14px; display: flex; flex-direction: column; gap: 5px; }
        .sp-desc-list li { font-size: 14px; color: var(--ink-60); line-height: 1.6; padding-left: 16px; position: relative; }
        .sp-desc-list li::before { content: "•"; position: absolute; left: 0; color: var(--bord); font-weight: 700; }
        .sp-sev-box { border-radius: 2px; padding: 12px 16px; font-size: 13px; font-weight: 600; line-height: 1.5; }

        /* SIDEBAR */
        .sp-side { }
        .sp-side-box { background: var(--paper); border: 1px solid var(--rule); border-radius: 2px; padding: 20px; margin-bottom: 16px; }
        .sp-side-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--rule); }
        .sp-side-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .sp-side-item a { font-size: 13px; color: var(--ink-60); text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .sp-side-item a:hover { color: var(--bord); }
        .sp-side-item a::before { content: '→'; color: var(--acc); font-size: 11px; }

        /* ARTICLES */
        .sp-body { background: var(--paper); }
        .sp-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 24px 56px; }
        .sp-sec-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .sp-sec-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); }
        .sp-sec-line { flex: 1; height: 1px; background: var(--rule); }
        .sp-art-list { display: flex; flex-direction: column; gap: 16px; }
        .sp-art-item { background: var(--white); border: 1px solid var(--rule); border-radius: 2px; display: grid; grid-template-columns: 140px 1fr; gap: 0; text-decoration: none; transition: box-shadow 0.18s; overflow: hidden; }
        .sp-art-item:hover { box-shadow: 0 2px 16px rgba(107,31,42,0.10); }
        .sp-art-img { height: 100px; overflow: hidden; background: var(--bord-l); }
        .sp-art-img img { width: 100%; height: 100%; object-fit: cover; }
        .sp-art-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; opacity: 0.35; }
        .sp-art-body { padding: 14px 18px; }
        .sp-art-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--bord); margin-bottom: 5px; }
        .sp-art-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 6px; }
        .sp-art-exc { font-size: 12px; color: var(--ink-60); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sp-art-meta { font-size: 11px; color: var(--ink-30); margin-top: 8px; }

        .sp-empty { text-align: center; padding: 48px 0; color: var(--ink-60); font-size: 15px; }

        /* FOOTER */
        .sp-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; font-family: 'Golos Text', sans-serif; }
        .sp-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .sp-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .sp-foot-logo span { color: var(--acc); }
        .sp-foot-lnks { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; }
        .sp-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .sp-foot-lnks a:hover { color: var(--acc); }
        .sp-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }

        /* AD BLOCKS */
        .sp-ad-box { background: var(--white); border: 1px solid var(--rule); padding: 14px; }
        .sp-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .sp-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .sp-ad-incontent { margin: 28px 0; padding: 14px; background: var(--white); border: 1px solid var(--rule); border-top: 2px solid var(--bord); }
        .sp-ad-incontent-slot { min-height: 180px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .sp-ad-under { background: var(--white); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .sp-ad-under-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .sp-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        @media (max-width: 900px) {
          .sp-hero-in { grid-template-columns: 1fr; gap: 24px; }
          .sp-side { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .sp-ad-slot { min-height: 160px; }
        }
        @media (max-width: 600px) {
          .sp-title { font-size: 28px; }
          .sp-wrap { padding: 28px 14px 40px; }
          .sp-art-item { grid-template-columns: 100px 1fr; }
          .sp-art-img { height: 90px; }
          .sp-side { grid-template-columns: 1fr; }
          .sp-hero { padding: 28px 14px 24px; }
          .sp-ad-under-slot { min-height: 60px; font-size: 11px; }
          .sp-ad-under-in { padding: 0 14px; }
        }
        .sp-faq { margin-top: 32px; margin-bottom: 8px; }
        .sp-faq-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: var(--bord); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid var(--bord); }
        .sp-faq-item { border: 1px solid var(--rule); border-radius: 2px; margin-bottom: 6px; background: var(--white); transition: border-color 0.15s; }
        .sp-faq-item:hover { border-color: var(--bord); }
        .sp-faq-q { padding: 13px 16px; font-size: 14px; font-weight: 600; color: var(--ink); cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; line-height: 1.4; }
        .sp-faq-q::-webkit-details-marker { display: none; }
        .sp-faq-q::after { content: '+'; color: var(--bord); font-size: 20px; font-weight: 300; flex-shrink: 0; margin-left: 12px; }
        details[open] .sp-faq-q::after { content: '−'; }
        .sp-faq-q:hover { background: var(--bord-l); color: var(--bord); }
        .sp-faq-a { padding: 10px 16px 14px; font-size: 13px; color: var(--ink-60); line-height: 1.7; border-top: 1px solid var(--rule); }
      `}</style>

      


      <div className="sp-crumbs">
          <div className="sp-crumbs-in">
            <Breadcrumbs items={[
              { label: 'Симптомы', href: '/symptoms' },
              { label: symptom.title },
            ]} />
          </div>
        </div>
        <div className="sp-hero">
          <div className="sp-hero-in">
            <div>
              <div className="sp-sys-badge">{sys.icon} {sys.label}</div>
              <h1 className="sp-title">{symptom.title}</h1>
              {symptom.description && <SymptomDescription text={symptom.description} />}
              <div className="sp-sev-box" style={{ background: sev.bg, color: sev.color }}>
                {sev.label}
              </div>
            </div>

            <div className="sp-side">
              {sameSystem.length > 0 && (
                <div className="sp-side-box">
                  <div className="sp-side-ttl">{sys.icon} {sys.label}</div>
                  <ul className="sp-side-list">
                    {sameSystem.slice(0, 8).map((s: any) => (
                      <li key={s.id} className="sp-side-item">
                        <Link href={`/symptoms/${s.slug}`}>{s.title}</Link>
                      </li>
                    ))}
                  </ul>
                  {sameSystem.length > 8 && (
                    <div style={{ marginTop: 10, fontSize: 12 }}>
                      <Link href="/symptoms" style={{ color: 'var(--bord)', textDecoration: 'none' }}>Все симптомы →</Link>
                    </div>
                  )}
                </div>
              )}

              <div className="sp-side-box">
                <div className="sp-side-ttl">🔍 Все разделы</div>
                <ul className="sp-side-list">
                  {[
                    { href: '/symptoms', label: 'Справочник симптомов' },
                    { href: '/contacts', label: 'Задать вопрос' },
                  ].map(l => (
                    <li key={l.href} className="sp-side-item">
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sp-ad-box">
                <div className="sp-ad-label">Реклама</div>
                <div id="yandex_rtb_symptom_sidebar_1" className="sp-ad-slot">Реклама РСЯ — блок 1</div>
              </div>

              <div className="sp-ad-box">
                <div className="sp-ad-label">Реклама</div>
                <div id="yandex_rtb_symptom_sidebar_2" className="sp-ad-slot">Реклама РСЯ — блок 2</div>
              </div>
            </div>
          </div>
        </div>

      <div className="sp-body">
        <div className="sp-wrap">

            {/* FAQ блок — Schema.org + визуальный */}
            {symptom.description && (() => {
              const faqItems = buildFAQ(symptom.title, symptom.description)
              if (faqItems.length < 2) return null
              return (
                <div className="sp-faq">
                  <h2 className="sp-faq-ttl">Частые вопросы</h2>
                  {faqItems.map((item, i) => (
                    <details key={i} className="sp-faq-item">
                      <summary className="sp-faq-q">{item.q}</summary>
                      <div className="sp-faq-a">{item.a}</div>
                    </details>
                  ))}
                </div>
              )
            })()}

          {articles.length > 0 ? (
            <>
              <div className="sp-sec-hdr">
                <h2 className="sp-sec-ttl">Статьи по теме</h2>
                <div className="sp-sec-line" />
                <span style={{ fontSize: 12, color: 'var(--ink-30)' }}>{articles.length} материалов</span>
              </div>
              <div className="sp-art-list">
                {articles.map((a: any) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="sp-art-item">
                    <div className="sp-art-img">
                      {a.ogImageUrl
                        ? <img src={a.ogImageUrl} alt={a.title} />
                        : <div className="sp-art-ph">🩺</div>}
                    </div>
                    <div className="sp-art-body">
                      {a.category && <div className="sp-art-cat">{a.category.title}</div>}
                      <div className="sp-art-ttl">{a.title}</div>
                      {a.excerpt && <p className="sp-art-exc">{a.excerpt}</p>}
                      <div className="sp-art-meta">{a.author?.name} · {formatDate(a.publishedAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="sp-ad-incontent">
                <div className="sp-ad-label">Реклама</div>
                <div id="yandex_rtb_symptom_incontent" className="sp-ad-incontent-slot">Реклама внутри страницы симптома (РСЯ)</div>
              </div>
            </>
          ) : (
            <div className="sp-empty">Статьи по этому симптому скоро появятся</div>
          )}
        </div>
      </div>

      <div className="sp-ad-under">
        <div className="sp-ad-under-in">
          <div className="sp-ad-label">Реклама</div>
          <div id="yandex_rtb_symptom_under" className="sp-ad-under-slot">Реклама под страницей симптома (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      
    </>
  )
}
