import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Об авторе — ДентаМед',
  description: 'Врач-стоматолог, автор статей о здоровье полости рта',
}

async function getAuthorWithArticles() {
  try {
    const author = await prisma.author.findFirst({
      include: {
        articles: {
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true, title: true, slug: true, excerpt: true,
            publishedAt: true, viewCount: true, ogImageUrl: true,
            category: { select: { title: true, color: true, slug: true } },
          },
        },
      },
    })
    return author
  } catch { return null }
}

export default async function AuthorPage() {
  const author = await getAuthorWithArticles()
  if (!author) notFound()

  const totalViews = author.articles.reduce((s: number, a: { viewCount: number }) => s + a.viewCount, 0)

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DC]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A6B4A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Д</span>
            </div>
            <div>
              <div className="font-bold text-[#1C1917] text-lg leading-tight">ДентаМед</div>
              <div className="text-xs text-[#78716C]">Советы стоматолога</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#57534E]">
            <Link href="/" className="hover:text-[#1A6B4A] transition-colors">Статьи</Link>
            <Link href="/author" className="text-[#1A6B4A] font-medium">Об авторе</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Profile hero */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-10">
          <div className="h-32 bg-gradient-to-r from-[#1A6B4A] to-[#2D9B6F]" />
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end gap-6 -mt-12 mb-6">
              <div className="relative">
                {author.avatarUrl ? (
                  <img
                    src={author.avatarUrl}
                    alt={author.name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-[#DCFCE7] border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#166534]">
                      {author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#1A6B4A] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="pb-2">
                <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#166534] text-xs font-semibold px-3 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Верифицированный специалист
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#1C1917] mb-1">{author.name}</h1>
            <p className="text-[#57534E] mb-6">{author.specialty}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 py-5 border-y border-[#F7F5F0]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1C1917]">{author.articles.length}</div>
                <div className="text-xs text-[#78716C]">статей</div>
              </div>
              <div className="w-px bg-[#E8E4DC]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1C1917]">{totalViews.toLocaleString('ru-RU')}</div>
                <div className="text-xs text-[#78716C]">просмотров</div>
              </div>
              <div className="w-px bg-[#E8E4DC]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1C1917]">100%</div>
                <div className="text-xs text-[#78716C]">проверено лично</div>
              </div>
            </div>

            {/* Bio */}
            {author.bio && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-[#78716C] uppercase tracking-wide mb-3">О враче</h2>
                <div className="text-[#44403C] leading-relaxed whitespace-pre-wrap">{author.bio}</div>
              </div>
            )}
          </div>
        </div>

        {/* Diploma / credentials */}
        {author.diplomaPhotoUrl && (
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-10">
            <h2 className="text-sm font-semibold text-[#78716C] uppercase tracking-wide mb-4">Документы и дипломы</h2>
            <img
              src={author.diplomaPhotoUrl}
              alt="Диплом"
              className="rounded-xl border border-[#E8E4DC] max-w-sm"
            />
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🎓', title: 'Медицинское образование', text: 'Высшее стоматологическое образование, подтверждённое документами' },
            { icon: '🔬', title: 'Практический опыт', text: 'Все статьи основаны на реальной клинической практике' },
            { icon: '📚', title: 'Актуальная информация', text: 'Материалы регулярно обновляются согласно новым данным' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl border border-[#E8E4DC] p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-[#1C1917] mb-1">{item.title}</h3>
              <p className="text-sm text-[#78716C]">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Articles by this author */}
        {author.articles.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#1C1917] mb-6">
              Статьи автора
              <span className="ml-2 text-sm font-normal text-[#78716C]">({author.articles.length})</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(author.articles as any[]).map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {article.ogImageUrl ? (
                    <img
                      src={article.ogImageUrl}
                      alt={article.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] flex items-center justify-center">
                      <span className="text-3xl">🦷</span>
                    </div>
                  )}
                  <div className="p-4">
                    {article.category && (
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded mb-2"
                        style={{
                          backgroundColor: article.category.color ? `${article.category.color}20` : '#DCFCE7',
                          color: article.category.color ?? '#166534',
                        }}
                      >
                        {article.category.title}
                      </span>
                    )}
                    <h3 className="font-bold text-[#1C1917] text-sm leading-snug group-hover:text-[#1A6B4A] transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-[#78716C] mt-1.5 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-xs text-[#A8A29E]">
                      {article.publishedAt && (
                        <span>{new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      )}
                      <span>·</span>
                      <span>{article.viewCount} просм.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#1C1917] text-[#A8A29E] text-sm mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-white font-bold mb-1">ДентаМед</div>
            <div>Информационный ресурс. Не заменяет консультацию врача.</div>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">Главная</Link>
            <Link href="/author" className="hover:text-white transition-colors">Об авторе</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
