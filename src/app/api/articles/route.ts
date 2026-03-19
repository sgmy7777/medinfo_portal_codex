import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sanitizeRichTextHtml, sanitizeText } from '@/lib/sanitize'


// GET /api/articles — список статей (публичный + фильтры для админки)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10')
  const categorySlug = searchParams.get('category')
  const isAdmin = searchParams.get('admin') === 'true'
  const search = searchParams.get('search') ?? ''

  const where = {
    ...(!isAdmin && { isPublished: true }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        ogImageUrl: true,
        isPublished: true,
        publishedAt: true,
        viewCount: true,
        createdAt: true,
        category: { select: { id: true, title: true, slug: true, color: true } },
        author: { select: { id: true, name: true, specialty: true, avatarUrl: true } },
      },
    })
  const total = await prisma.article.count({ where })

  return NextResponse.json({
    data: articles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

// POST /api/articles — создать статью (только для админа)
export async function POST(req: NextRequest) {
  const authError = await requireAuth(req)
  if (authError) return authError

  const body = await req.json()
  const {
    title, slug, content, excerpt,
    metaTitle, metaDescription, ogImageUrl,
    authorId, categoryId, tagIds,
    isPublished,
  } = body

  const safeTitle = sanitizeText(title)
  const safeSlug = sanitizeText(slug)
  const safeContent = sanitizeRichTextHtml(content)
  const safeExcerpt = sanitizeText(excerpt)
  const safeMetaTitle = sanitizeText(metaTitle)
  const safeMetaDescription = sanitizeText(metaDescription)
  const safeOgImageUrl = sanitizeText(ogImageUrl)
  const safeAuthorId = sanitizeText(authorId)
  const safeCategoryId = sanitizeText(categoryId)

  const missing: string[] = []
  if (!safeTitle) missing.push('заголовок')
  if (!safeSlug) missing.push('slug')
  if (!safeContent) missing.push('содержание')
  if (!safeAuthorId) missing.push('автор')
  if (!safeCategoryId) missing.push('категория')

  if (missing.length > 0) {
    console.error('[POST /api/articles] Missing:', missing, '| body keys:', Object.keys(body))
    return NextResponse.json({ error: 'Не заполнено: ' + missing.join(', ') }, { status: 400 })
  }

  // Проверка уникальности slug
  const existing = await prisma.article.findUnique({ where: { slug: safeSlug } })
  if (existing) {
    return NextResponse.json({ error: 'Статья с таким slug уже существует' }, { status: 400 })
  }

  const article = await prisma.article.create({
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
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json({ data: article }, { status: 201 })
}
