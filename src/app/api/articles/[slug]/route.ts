import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sanitizeRichTextHtml, sanitizeText } from '@/lib/sanitize'


type RouteContext = { params: Promise<{ slug: string }> }

// GET /api/articles/[slug]
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
  })

  if (!article) {
    return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
  }

  try { revalidatePath(`/article/${article.slug}`) } catch { /* вне Next.js runtime */ }
  return NextResponse.json({ data: article })
}

// PUT /api/articles/[slug]
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const { slug } = await params
  const body = await req.json()
  const {
    title, slug: newSlug, content, excerpt,
    metaTitle, metaDescription, ogImageUrl,
    authorId, categoryId, tagIds,
    isPublished,
  } = body

  const safeTitle = sanitizeText(title)
  const safeSlug = sanitizeText(newSlug)
  const safeContent = sanitizeRichTextHtml(content)
  const safeExcerpt = sanitizeText(excerpt)
  const safeMetaTitle = sanitizeText(metaTitle)
  const safeMetaDescription = sanitizeText(metaDescription)
  const safeOgImageUrl = sanitizeText(ogImageUrl)
  const safeAuthorId = sanitizeText(authorId)
  const safeCategoryId = sanitizeText(categoryId)

  const existing = await prisma.article.findUnique({ where: { slug } })
  if (!existing) {
    return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
  }

  // Обновляем теги только если tagIds явно передан в запросе
  if (Array.isArray(tagIds)) {
    await prisma.articleTag.deleteMany({ where: { articleId: existing.id } })
    if (tagIds.length > 0) {
      await prisma.articleTag.createMany({
        data: tagIds.map((tagId: string) => ({ articleId: existing.id, tagId })),
        skipDuplicates: true,
      })
    }
  }

  const article = await prisma.article.update({
    where: { slug },
    data: {
      title: safeTitle,
      slug: safeSlug,
      content: safeContent,
      excerpt: safeExcerpt || null,
      metaTitle: safeMetaTitle || null,
      metaDescription: safeMetaDescription || null,
      ogImageUrl: safeOgImageUrl || null,
      authorId: safeAuthorId,
      categoryId: safeCategoryId,
      isPublished,
      publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  })

  try { revalidatePath(`/article/${article.slug}`) } catch { /* вне Next.js runtime */ }
  return NextResponse.json({ data: article })
}

// DELETE /api/articles/[slug]
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const { slug } = await params
  await prisma.article.delete({ where: { slug } })
  return NextResponse.json({ data: { success: true } })
}
