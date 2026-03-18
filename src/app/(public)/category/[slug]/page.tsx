import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const catIcons: Record<string, string> = {
  'kardiologiya': '❤️', 'nevrologiya': '🧠', 'gastroenterologiya': '🫁',
  'stomatologiya': '🦷', 'dermatologiya': '🫧', 'pediatriya': '👶',
  'endokrinologiya': '⚗️', 'onkologiya': '🔬', 'travmatologiya': '🦴',
  'khirurgiya': '🩺', 'urologiya': '💧', 'ginekologiya': '🌸',
  'oftalmologiya': '👁️', 'lor': '👂', 'psikhiatriya': '🧩',
  'pulmonologiya': '💨', 'revmatologiya': '💊', 'nefrologiya': '🫘',
}

async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      select: { id: true, title: true, slug: true, description: true, color: true },
    })
  } catch { return null }
}

async function getCategoryArticles(categoryId: string) {
  try {
    return await prisma.article.findMany({
      where: { categoryId, isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        ogImageUrl: true, viewCount: true, publishedAt: true,
        author: { select: { name: true, specialty: true } },
      },
    })
  } catch { return [] }
}

async function getAllCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true, _count: { select: { articles: true } } },
    })
  } catch { return [] }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return { title: 'Раздел не найден' }
  return {
    title: `${category.title} — ЗдравИнфо`,
    description: category.description ?? `Статьи по разделу "${category.title}" — медицинский портал ЗдравИнфо`,
  }
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return `${n} ${many}`
  if (mod10 === 1) return `${n} ${one}`
  if (mod10 >= 2 && mod10 <= 4) return `${n} ${few}`
  return `${n} ${many}`
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Последовательные запросы — connection_limit=1
  const category = await getCategory(slug)
  const allCategories = await getAllCategories()
  if (!category) notFound()
  const articles = await getCategoryArticles(category.id)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Golos+Text:wght@400;500;600&display=swap');

        *, *::before, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }

        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --paper-dd: #E0D5C4;
          --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --acc-l: #F5EDD8; --rule: #D8CCBA; --white: #FFFDF9;
        }

        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }

        /* HEADER */
        .cp-hdr { background: var(--bord-d); }
        .cp-hdr-top { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 6px 0; }
        .cp-hdr-top-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; }
        .cp-hdr-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acc); }
        .cp-hdr-main { max-width: 1200px; margin: 0 auto; padding: 20px 24px 16px; display: flex; justify-content: center; }
        .cp-logo { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: white; letter-spacing: -2px; text-decoration: none; line-height: 1; display: block; text-align: center; }
        .cp-logo span { color: var(--acc); }
        .cp-logo-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; text-align: center; }

        /* CAT BAR */
        .cp-cats { background: var(--bord); border-bottom: 1px solid var(--bord-d); overflow-x: auto; scrollbar-width: none; }
        .cp-cats::-webkit-scrollbar { display: none; }
        .cp-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .cp-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; } }
        .cp-cat-lnk { padding: 9px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(255,255,255,0.65); text-decoration: none; white-space: nowrap; transition: all 0.15s; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid transparent; }
        .cp-cat-lnk:hover, .cp-cat-lnk.active { color: white; background: rgba(0,0,0,0.15); border-bottom-color: var(--acc); }

        /* HERO BANNER */
        .cp-hero { background: linear-gradient(135deg, var(--bord-d) 0%, var(--bord-m) 100%); padding: 48px 0; }
        .cp-hero-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 24px; }
        .cp-hero-ico { font-size: 64px; line-height: 1; flex-shrink: 0; }
        .cp-hero-bc { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; margin-bottom: 10px; display: flex; gap: 6px; align-items: center; }
        .cp-hero-bc a { color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.15s; }
        .cp-hero-bc a:hover { color: var(--acc); }
        .cp-hero-ttl { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; color: white; letter-spacing: -1px; line-height: 1.1; margin-bottom: 10px; }
        .cp-hero-desc { font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.6; max-width: 500px; }
        .cp-hero-cnt { margin-top: 16px; display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.45); padding: 6px 14px; border-radius: 2px; font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 600; letter-spacing: 0.06em; }

        /* WRAP */
        .cp-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* CONTENT AREA */
        .cp-layout { display: grid; grid-template-columns: 1fr 260px; gap: 48px; padding: 40px 0 60px; }

        /* ARTICLES */
        .cp-main {}
        .cp-sec-hdr { display: flex; align-items: baseline; gap: 14px; margin-bottom: 28px; padding-bottom: 10px; border-bottom: 2px solid var(--ink); }
        .cp-sec-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; }
        .cp-sec-line { flex: 1; height: 1px; background: var(--rule); position: relative; top: -4px; }
        .cp-sec-cnt { font-size: 12px; color: var(--ink-30); font-weight: 600; white-space: nowrap; }

        /* Article list — first item big, rest normal */
        .cp-art-list { display: flex; flex-direction: column; gap: 0; }

        .cp-art-featured { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding-bottom: 32px; margin-bottom: 32px; border-bottom: 1px solid var(--rule); text-decoration: none; transition: opacity 0.2s; }
        .cp-art-featured:hover { opacity: 0.85; }
        .cp-art-featured:hover .cp-art-ttl { color: var(--bord); }
        .cp-feat-img { aspect-ratio: 16/9; overflow: hidden; border-radius: 2px; background: var(--bord-l); }
        .cp-feat-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .cp-art-featured:hover .cp-feat-img img { transform: scale(1.04); }
        .cp-feat-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.4; }
        .cp-feat-body { display: flex; flex-direction: column; justify-content: center; }
        .cp-art-ttl { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; line-height: 1.25; color: var(--ink); margin-bottom: 12px; transition: color 0.2s; }
        .cp-art-exc { font-size: 15px; color: var(--ink-60); line-height: 1.65; margin-bottom: 14px; }
        .cp-art-meta { font-size: 11px; color: var(--ink-30); display: flex; gap: 8px; align-items: center; }
        .cp-art-author { font-weight: 600; color: var(--ink-60); }
        .cp-dot { color: var(--rule); }
        .cp-read-lnk { font-size: 11px; font-weight: 700; color: var(--bord); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 14px; display: inline-flex; align-items: center; gap: 5px; transition: gap 0.2s; }
        .cp-read-lnk:hover { gap: 9px; }

        .cp-art-item { display: grid; grid-template-columns: 140px 1fr; gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--rule); text-decoration: none; transition: opacity 0.2s; }
        .cp-art-item:last-child { border-bottom: none; }
        .cp-art-item:hover { opacity: 0.75; }
        .cp-art-item:hover .cp-item-ttl { color: var(--bord); }
        .cp-item-img { aspect-ratio: 4/3; overflow: hidden; border-radius: 2px; background: var(--bord-l); flex-shrink: 0; }
        .cp-item-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .cp-art-item:hover .cp-item-img img { transform: scale(1.06); }
        .cp-item-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; opacity: 0.4; }
        .cp-item-body { display: flex; flex-direction: column; justify-content: center; gap: 6px; }
        .cp-item-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; line-height: 1.3; color: var(--ink); transition: color 0.2s; }
        .cp-item-exc { font-size: 13px; color: var(--ink-60); line-height: 1.55; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .cp-item-meta { font-size: 11px; color: var(--ink-30); display: flex; gap: 6px; }

        /* EMPTY */
        .cp-empty { text-align: center; padding: 60px 0; }
        .cp-empty-ico { font-size: 52px; margin-bottom: 16px; opacity: 0.3; }
        .cp-empty-txt { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--ink-60); margin-bottom: 8px; }
        .cp-empty-sub { font-size: 14px; color: var(--ink-30); }

        /* SIDEBAR */
        .cp-side { display: flex; flex-direction: column; gap: 20px; padding-top: 52px; }

        .cp-side-box { background: var(--white); border: 1px solid var(--rule); padding: 20px; }
        .cp-side-ttl { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 16px; }
        .cp-side-cats { display: flex; flex-direction: column; gap: 0; }
        .cp-side-cat { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--rule); text-decoration: none; transition: all 0.15s; }
        .cp-side-cat:last-child { border-bottom: none; }
        .cp-side-cat:hover .cp-side-cat-name { color: var(--bord); }
        .cp-side-cat-name { font-size: 13px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 8px; transition: color 0.15s; }
        .cp-side-cat-ico { font-size: 14px; }
        .cp-side-cat-cnt { font-size: 11px; color: var(--ink-30); font-weight: 600; }

        .cp-ad-box { background: var(--white); border: 1px solid var(--rule); padding: 14px; }
        .cp-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .cp-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }

        /* FOOTER */
        .cp-footer { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; }
        .cp-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        .cp-foot-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: white; text-decoration: none; }
        .cp-foot-logo span { color: var(--acc); }
        .cp-foot-lnks { display: flex; gap: 16px; font-size: 12px; }
        .cp-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.15s; }
        .cp-foot-lnks a:hover { color: var(--acc); }
        .cp-foot-copy { font-size: 11px; color: rgba(255,255,255,0.45); }

        @media (max-width: 900px) {
          .cp-layout { grid-template-columns: 1fr; }
          .cp-side { padding-top: 0; }
          .cp-art-featured { grid-template-columns: 1fr; }
          .cp-hero-ttl { font-size: 32px; }
        }
        @media (max-width: 600px) {
          .cp-wrap { padding: 0 16px; }
          .cp-art-item { grid-template-columns: 96px 1fr; gap: 12px; }
          .cp-logo { font-size: 28px; }
          .cp-logo-sub { display: none; }
          .cp-hdr-main { padding: 14px 16px 12px; }
          .cp-cat-lnk { padding: 8px 10px; font-size: 10px; }
          .cp-hero { padding: 28px 0; }
          .cp-hero-ttl { font-size: 24px; }
          .cp-hero-ico { font-size: 44px; }
          .cp-hero-desc { font-size: 13px; }
          .cp-art-ttl { font-size: 20px; }
          .cp-item-ttl { font-size: 14px; }
          .cp-item-exc { display: none; }
          .cp-sec-ttl { font-size: 17px; }
          .cp-feat-body { padding-top: 4px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        

        {/* CAT BAR */}
        <div className="cp-cats">
          <div className="cp-cats-in">
            {(allCategories as any[]).map((cat: any) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`cp-cat-lnk${cat.slug === slug ? ' active' : ''}`}
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="cp-hero">
          <div className="cp-hero-in">
            <div className="cp-hero-ico">{catIcons[slug] ?? '🩺'}</div>
            <div>
              <div className="cp-hero-bc">
                <Link href="/">Главная</Link>
                <span>·</span>
                <span>Разделы</span>
                <span>·</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{category.title}</span>
              </div>
              <h1 className="cp-hero-ttl">{category.title}</h1>
              {category.description && (
                <p className="cp-hero-desc">{category.description}</p>
              )}
              <div className="cp-hero-cnt">
                {plural(articles.length, 'статья', 'статьи', 'статей')}
              </div>
            </div>
          </div>
        </div>

        <main style={{ flex: 1 }}>
          <div className="cp-wrap">
            <div className="cp-layout">

              {/* ARTICLES */}
              <div className="cp-main">
                <div className="cp-sec-hdr">
                  <h2 className="cp-sec-ttl">Статьи раздела</h2>
                  <div className="cp-sec-line" />
                  <span className="cp-sec-cnt">{plural(articles.length, 'материал', 'материала', 'материалов')}</span>
                </div>

                {articles.length === 0 ? (
                  <div className="cp-empty">
                    <div className="cp-empty-ico">{catIcons[slug] ?? '🩺'}</div>
                    <div className="cp-empty-txt">Статьи появятся совсем скоро</div>
                    <div className="cp-empty-sub">Раздел в процессе наполнения</div>
                  </div>
                ) : (
                  <div className="cp-art-list">
                    {/* First article — featured big */}
                    {articles[0] && (
                      <Link href={`/article/${articles[0].slug}`} className="cp-art-featured">
                        <div className="cp-feat-img">
                          {articles[0].ogImageUrl
                            ? <img src={articles[0].ogImageUrl} alt={articles[0].title} />
                            : <div className="cp-feat-ph">{catIcons[slug] ?? '🩺'}</div>}
                        </div>
                        <div className="cp-feat-body">
                          <div className="cp-art-ttl">{articles[0].title}</div>
                          {articles[0].excerpt && <p className="cp-art-exc">{articles[0].excerpt}</p>}
                          <div className="cp-art-meta">
                            {articles[0].author?.name && <span className="cp-art-author">{articles[0].author.name}</span>}
                            {articles[0].publishedAt && <><span className="cp-dot">·</span><span>{formatDate(articles[0].publishedAt)}</span></>}
                            <span className="cp-dot">·</span>
                            <span>{articles[0].viewCount} просм.</span>
                          </div>
                          <span className="cp-read-lnk">Читать далее →</span>
                        </div>
                      </Link>
                    )}

                    {/* Rest — compact list */}
                    {articles.slice(1).map((a: any) => (
                      <Link key={a.id} href={`/article/${a.slug}`} className="cp-art-item">
                        <div className="cp-item-img">
                          {a.ogImageUrl
                            ? <img src={a.ogImageUrl} alt={a.title} />
                            : <div className="cp-item-ph">{catIcons[slug] ?? '🩺'}</div>}
                        </div>
                        <div className="cp-item-body">
                          <div className="cp-item-ttl">{a.title}</div>
                          {a.excerpt && <p className="cp-item-exc">{a.excerpt}</p>}
                          <div className="cp-item-meta">
                            {a.author?.name && <span style={{ fontWeight: 600, color: 'var(--ink-60)' }}>{a.author.name}</span>}
                            {a.publishedAt && <><span className="cp-dot">·</span><span>{formatDate(a.publishedAt)}</span></>}
                            <span className="cp-dot">·</span>
                            <span>{a.viewCount} просм.</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* SIDEBAR */}
              <aside className="cp-side">
                <div className="cp-ad-box">
                  <div className="cp-ad-label">Реклама</div>
                  <div id="yandex_rtb_cat_sidebar" className="cp-ad-slot">Реклама РСЯ</div>
                </div>

                <div className="cp-side-box">
                  <div className="cp-side-ttl">Другие разделы</div>
                  <div className="cp-side-cats">
                    {(allCategories as any[])
                      .filter((c: any) => c.slug !== slug)
                      .slice(0, 10)
                      .map((cat: any) => (
                        <Link key={cat.id} href={`/category/${cat.slug}`} className="cp-side-cat">
                          <span className="cp-side-cat-name">
                            <span className="cp-side-cat-ico">{catIcons[cat.slug] ?? '🩺'}</span>
                            {cat.title}
                          </span>
                          <span className="cp-side-cat-cnt">{cat._count?.articles ?? 0}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </main>

        <footer className="cp-footer">
          <div className="cp-foot-in">
            <Link href="/" className="cp-foot-logo">Здрав<span>Инфо</span></Link>
            <div className="cp-foot-lnks">
              <Link href="/">Главная</Link>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/contacts">Контакты</Link>
            </div>
            <div className="cp-foot-copy">© {new Date().getFullYear()} ЗдравИнфо</div>
          </div>
        </footer>

      </div>
    </>
  )
}
