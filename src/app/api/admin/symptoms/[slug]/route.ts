import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from "@/lib/auth"

type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  const symptom = await prisma.symptom.findUnique({
    where: { slug },
    include: {
      articles: {
        include: { article: { select: { id: true, title: true, slug: true } } }
      }
    }
  })
  if (!symptom) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  return NextResponse.json({ data: symptom })
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  const body = await req.json()
  const { title, description, bodySystem, severity, articleSlugs } = body

  const symptom = await prisma.symptom.update({
    where: { slug },
    data: {
      title,
      description: description || null,
      bodySystem,
      severity: severity || 'medium',
    }
  })

  // Обновляем связанные статьи если переданы
  if (Array.isArray(articleSlugs)) {
    await prisma.symptomArticle.deleteMany({ where: { symptomId: symptom.id } })
    for (const artSlug of articleSlugs) {
      const article = await prisma.article.findUnique({ where: { slug: artSlug } })
      if (article) {
        await prisma.symptomArticle.create({
          data: { symptomId: symptom.id, articleId: article.id }
        })
      }
    }
  }

  return NextResponse.json({ data: symptom })
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  await prisma.symptom.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
