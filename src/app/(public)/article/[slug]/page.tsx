import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ViewCounter from '@/components/public/ViewCounter'
import { UnifiedHeader } from '@/components/public/UnifiedHeader'

async function getArticle(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/articles/${slug}`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Статья не найдена' }
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt,
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt,
      images: article.ogImageUrl ? [article.ogImageUrl] : [],
      type: 'article',
      publishedTime: article.publishedAt,
    },
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: article.title,
        description: article.excerpt,
        author: { '@type': 'Person', name: article.author?.name, jobTitle: article.author?.specialty },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        reviewedBy: { '@type': 'Person', name: article.author?.name },
      }),
    },
  }
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  const categories = await prisma.category.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true, slug: true } }).catch(() => [])
  if (!article || !article.isPublished) notFound()

  // Похожие статьи из той же категории
  const related = article.categoryId ? await prisma.article.findMany({
    where: { categoryId: article.categoryId, isPublished: true, NOT: { slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, slug: true, ogImageUrl: true, excerpt: true, publishedAt: true, category: { select: { title: true } } },
  }).catch(() => []) : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Golos+Text:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }

        :root {
          --bord: #6B1F2A;
          --bord-d: #4A0F17;
          --bord-l: #F5EBE8;
          --bord-m: #8B2D3A;
          --paper: #F7F2EA;
          --paper-d: #EDE5D8;
          --paper-dd: #E0D5C4;
          --ink: #1C1208;
          --ink-60: #5A4A38;
          --ink-30: #9A8A78;
          --acc: #C8913A;
          --acc-l: #F5EDD8;
          --rule: #D8CCBA;
          --white: #FFFDF9;
        }

        .ap { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); min-height: 100vh; display: flex; flex-direction: column; }

        /* HEADER */
        .ap-hdr { background: var(--bord-d); }
        .ap-hdr-top { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 6px 0; }
        .ap-hdr-top-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; }
        .ap-hdr-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acc); }
        .ap-hdr-main { max-width: 1200px; margin: 0 auto; padding: 18px 24px 14px; display: flex; align-items: center; justify-content: center; }
        .ap-logo { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: white; letter-spacing: -1px; text-decoration: none; line-height: 1; text-align: center; }
        .ap-logo span { color: var(--acc); }
        .ap-nav { display: flex; gap: 2px; }
        .ap-nav a { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.55); text-decoration: none; padding: 5px 12px; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; border-bottom: 2px solid transparent; }
        .ap-nav a:hover { color: var(--acc); border-bottom-color: var(--acc); }
        .ap-cats { background: var(--bord); border-bottom: 1px solid var(--bord-d); overflow-x: auto; scrollbar-width: none; }
        .ap-cats::-webkit-scrollbar { display: none; }
        .ap-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .ap-cats-in { padding: 0 8px; justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; } }
        .ap-cat-lnk { padding: 9px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(255,255,255,0.65); text-decoration: none; white-space: nowrap; transition: all 0.15s; display: flex; align-items: center; gap: 5px; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid transparent; }
        .ap-cat-lnk:hover { color: white; background: rgba(0,0,0,0.15); border-bottom-color: var(--acc); }

        /* BODY */
        .ap-body { flex: 1; }
        .ap-body-in { max-width: 1200px; width: 100%; margin: 0 auto; padding: 40px 24px 60px; display: grid; grid-template-columns: 1fr 280px; gap: 52px; }

        /* BREADCRUMB */
        .ap-bc { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-30); margin-bottom: 20px; flex-wrap: wrap; letter-spacing: 0.03em; }
        .ap-bc a { color: var(--ink-30); text-decoration: none; transition: color 0.15s; }
        .ap-bc a:hover { color: var(--bord); }
        .ap-bc-sep { color: var(--rule); }

        /* ARTICLE */
        .ap-cat-line { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bord); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .ap-cat-line::before { content: ''; display: inline-block; width: 20px; height: 2px; background: var(--bord); }

        .ap-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; line-height: 1.2; color: var(--ink); margin-bottom: 16px; }

        .ap-deck { font-size: 18px; color: var(--ink-60); line-height: 1.65; border-left: 3px solid var(--acc); padding-left: 16px; margin-bottom: 28px; font-style: italic; }

        .ap-byline { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); margin-bottom: 28px; }
        .ap-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .ap-avatar-ph { width: 46px; height: 46px; border-radius: 50%; background: var(--bord-l); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--bord); flex-shrink: 0; }
        .ap-author-name { font-size: 14px; font-weight: 600; color: var(--ink); }
        .ap-author-spec { font-size: 12px; color: var(--ink-60); margin-top: 1px; }
        .ap-verified { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #2D6A4F; font-weight: 600; margin-top: 3px; }
        .ap-byline-meta { margin-left: auto; text-align: right; font-size: 11px; color: var(--ink-30); line-height: 1.8; }

        .ap-hero-img { width: 100%; border-radius: 2px; margin-bottom: 28px; max-height: 480px; object-fit: cover; }

        .ap-content { font-size: 17px; line-height: 1.85; color: var(--ink-60); }
        .ap-content h2 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--ink); margin: 36px 0 14px; padding-top: 8px; border-top: 1px solid var(--rule); }
        .ap-content h3 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin: 24px 0 10px; }
        .ap-content p { margin-bottom: 18px; }
        .ap-content ul, .ap-content ol { margin: 0 0 18px 22px; }
        .ap-content li { margin-bottom: 6px; }
        .ap-content a { color: var(--bord); text-decoration: underline; text-underline-offset: 3px; }
        .ap-content strong { font-weight: 600; color: var(--ink); }
        .ap-content blockquote { border-left: 3px solid var(--acc); padding: 12px 16px; background: var(--acc-l); margin: 24px 0; font-style: italic; color: var(--ink-60); }
        .ap-content img { max-width: 100%; border-radius: 2px; }

        .ap-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--rule); }
        .ap-tag { font-size: 11px; font-weight: 600; color: var(--ink-60); background: var(--paper-d); padding: 5px 12px; border-radius: 2px; letter-spacing: 0.04em; }

        .ap-disclaimer { margin-top: 24px; padding: 14px 16px; background: var(--acc-l); border: 1px solid #E8C97A; border-radius: 2px; font-size: 13px; color: #7A5C10; line-height: 1.6; }

        /* SIDEBAR */
        .ap-side { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 20px; align-self: start; }

        .ap-ad-box { background: var(--white); border: 1px solid var(--rule); padding: 14px; }
        .ap-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .ap-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }

        .ap-author-box { background: var(--white); border: 1px solid var(--rule); border-top: 3px solid var(--bord); padding: 20px; }
        .ap-author-box-ttl { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 14px; }
        .ap-author-box-ava { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
        .ap-author-box-ph { width: 52px; height: 52px; border-radius: 50%; background: var(--bord-l); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--bord); margin-bottom: 10px; }
        .ap-author-box-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
        .ap-author-box-spec { font-size: 12px; color: var(--ink-60); margin-bottom: 10px; }
        .ap-author-box-bio { font-size: 12px; color: var(--ink-60); line-height: 1.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; }

        .ap-note-box { background: var(--bord-d); color: white; padding: 20px; }
        .ap-note-ttl { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--acc); }
        .ap-note-txt { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.65; }

        .ap-in-content-ad { margin: 32px 0; padding: 14px; background: var(--white); border: 1px solid var(--rule); border-top: 2px solid var(--bord); }
        .ap-under-ad { background: var(--white); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; margin-bottom: 0; }
        .ap-under-ad-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .ap-under-ad-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        /* RELATED */
        .ap-related { max-width: 1200px; margin: 0 auto; padding: 40px 24px 48px; border-top: 2px solid var(--ink); }
        .ap-related-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .ap-related-ttl::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
        .ap-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .ap-rel-item { text-decoration: none; display: block; transition: opacity 0.2s; }
        .ap-rel-item:hover { opacity: 0.75; }
        .ap-rel-img { aspect-ratio: 16/9; overflow: hidden; border-radius: 2px; background: var(--bord-l); margin-bottom: 12px; }
        .ap-rel-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .ap-rel-item:hover .ap-rel-img img { transform: scale(1.05); }
        .ap-rel-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; opacity: 0.35; }
        .ap-rel-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--bord); margin-bottom: 6px; }
        .ap-rel-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.3; }
        @media (max-width: 700px) { .ap-related-grid { grid-template-columns: 1fr; } }

        /* FOOTER */
        .ap-footer { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; }
        .ap-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        .ap-foot-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: white; text-decoration: none; }
        .ap-foot-logo span { color: var(--acc); }
        .ap-foot-lnks { display: flex; gap: 16px; font-size: 12px; }
        .ap-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.15s; }
        .ap-foot-lnks a:hover { color: var(--acc); }
        .ap-foot-copy { font-size: 11px; color: rgba(255,255,255,0.45); }

        @media (max-width: 900px) {
          .ap-body-in { grid-template-columns: 1fr; gap: 32px; }
          .ap-title { font-size: 28px; }
          .ap-nav { display: none; }
          .ap-side { position: static; }
          .ap-ad-slot { min-height: 160px; }
        }
        @media (max-width: 600px) {
          .ap-body-in { padding: 24px 16px 40px; }
          .ap-title { font-size: 22px; }
          .ap-deck { font-size: 15px; }
          .ap-content { font-size: 15px; line-height: 1.75; }
          .ap-content h2 { font-size: 20px; }
          .ap-content h3 { font-size: 17px; }
          .ap-hero-img { max-height: 220px; }
          .ap-byline { flex-wrap: wrap; gap: 10px; }
          .ap-byline-meta { margin-left: 0; text-align: left; }
          .ap-hdr-main { padding: 14px 16px 12px; }
          .ap-logo { font-size: 28px; }
          .ap-logo-sub { display: none; }
          .ap-cat-lnk { padding: 8px 10px; font-size: 10px; }
          .ap-related { padding: 28px 16px 36px; }
          .ap-related-ttl { font-size: 18px; }
          .ap-under-ad-in { padding: 0 16px; }
          .ap-under-ad-slot { min-height: 60px; font-size: 11px; }
          .ap-bc { padding: 0; }
        }
      `}</style>

      <div className="ap">
        <UnifiedHeader />
        {categories.length > 0 && (
          <div className="ap-cats">
            <div className="ap-cats-in">
              {(categories as any[]).map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="ap-cat-lnk">{cat.title}</Link>
              ))}
            </div>
          </div>
        )}

        <div className="ap-body">
          <div className="ap-body-in">
            <article>
              <nav className="ap-bc">
                <Link href="/">Главная</Link>
                <span className="ap-bc-sep">/</span>
                {article.category && (
                  <>
                    <Link href={`/category/${article.category?.slug}`}>{article.category?.title}</Link>
                    <span className="ap-bc-sep">/</span>
                  </>
                )}
                <span style={{ color: 'var(--ink-60)' }}>{article.title.substring(0, 45)}…</span>
              </nav>

              {article.category && (
                <div className="ap-cat-line">{article.category.title}</div>
              )}

              <h1 className="ap-title">{article.title}</h1>

              {article.excerpt && <p className="ap-deck">{article.excerpt}</p>}

              <div className="ap-byline">
                {article.author?.avatarUrl
                  ? <img src={article.author.avatarUrl} alt={article.author.name} className="ap-avatar" />
                  : <div className="ap-avatar-ph">{article.author?.name?.charAt(0) ?? 'А'}</div>}
                <div>
                  <div className="ap-author-name">{article.author?.name}</div>
                  <div className="ap-author-spec">{article.author?.specialty}</div>
                  <div className="ap-verified">✓ Статья проверена автором</div>
                </div>
                <div className="ap-byline-meta">
                  {article.publishedAt && <div>{formatDate(article.publishedAt)}</div>}
                  <div>{article.viewCount} просмотров</div>
                </div>
              </div>

              {article.ogImageUrl && (
                <img src={article.ogImageUrl} alt={article.title} className="ap-hero-img" />
              )}

              <div className="ap-content" dangerouslySetInnerHTML={{ __html: article.content }} />

              <div className="ap-in-content-ad">
                <div className="ap-ad-label">Реклама</div>
                <div id="yandex_rtb_incontent" className="ap-ad-slot" style={{ minHeight: "200px" }}>Реклама внутри статьи (РСЯ)</div>
              </div>

              {article.tags?.length > 0 && (
                <div className="ap-tags">
                  {article.tags.map((at: any) => (
                    <span key={at.tag.id} className="ap-tag">#{at.tag.title}</span>
                  ))}
                </div>
              )}

              <div className="ap-disclaimer">
                ⚠️ Статья носит информационный характер. Перед лечением обязательно проконсультируйтесь с врачом.
              </div>
            </article>

            <aside className="ap-side">
              <div className="ap-ad-box">
                <div className="ap-ad-label">Реклама</div>
                <div id="yandex_rtb_sidebar_1" className="ap-ad-slot">Реклама РСЯ — блок 1</div>
              </div>

              <div className="ap-note-box">
                <div className="ap-note-ttl">Важно знать</div>
                <div className="ap-note-txt">
                  Все материалы написаны практикующими врачами и регулярно проверяются на соответствие актуальным медицинским рекомендациям.
                </div>
              </div>

              <div className="ap-ad-box">
                <div className="ap-ad-label">Реклама</div>
                <div id="yandex_rtb_sidebar_2" className="ap-ad-slot">Реклама РСЯ — блок 2</div>
              </div>

              <div className="ap-ad-box">
                <div className="ap-ad-label">Реклама</div>
                <div id="yandex_rtb_sidebar_3" className="ap-ad-slot">Реклама РСЯ — блок 3</div>
              </div>
            </aside>
          </div>
        </div>

        <ViewCounter slug={article.slug} />

        {related.length > 0 && (
          <div className="ap-related">
            <div className="ap-related-ttl">Читать также</div>
            <div className="ap-related-grid">
              {(related as any[]).map((r: any) => (
                <Link key={r.id} href={`/article/${r.slug}`} className="ap-rel-item">
                  <div className="ap-rel-img">
                    {r.ogImageUrl
                      ? <img src={r.ogImageUrl} alt={r.title} />
                      : <div className="ap-rel-ph">🩺</div>}
                  </div>
                  {r.category && <div className="ap-rel-cat">{r.category.title}</div>}
                  <div className="ap-rel-ttl">{r.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="ap-under-ad">
          <div className="ap-under-ad-in">
            <div className="ap-ad-label">Реклама</div>
            <div id="yandex_rtb_under_article" className="ap-under-ad-slot">Реклама под статьёй (горизонтальный баннер РСЯ 728×90)</div>
          </div>
        </div>

        <footer className="ap-footer">
          <div className="ap-foot-in">
            <Link href="/" className="ap-foot-logo">Здрав<span>Инфо</span></Link>
            <div className="ap-foot-lnks">
              <Link href="/">Главная</Link>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/contacts">Контакты</Link>
            </div>
            <div className="ap-foot-copy">© {new Date().getFullYear()} ЗдравИнфо</div>
          </div>
        </footer>
      </div>
    </>
  )
}
