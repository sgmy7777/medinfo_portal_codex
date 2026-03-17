import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type Props = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  const test = await prisma.labTest.findUnique({
    where: { slug },
    include: { articles: { include: { article: { select: { id: true, title: true, slug: true } } } } },
  })
  if (!test) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  return NextResponse.json({ data: test })
}

export async function PUT(req: NextRequest, { params }: Props) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  const body = await req.json()
  const { title, description, category, unit, normMale, normFemale, normGeneral, preparation, articleSlugs } = body
  if (!title || !category) return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })

  try {
    const test = await prisma.labTest.update({
      where: { slug },
      data: {
        title, description: description || null, category,
        unit: unit || null,
        normMale: normMale || null,
        normFemale: normFemale || null,
        normGeneral: normGeneral || null,
        preparation: preparation || null,
      }
    })

    // Обновить связанные статьи — один findMany вместо цикла (connection_limit=1)
    if (Array.isArray(articleSlugs)) {
      await prisma.labTestArticle.deleteMany({ where: { labTestId: test.id } })
      const articles = await prisma.article.findMany({
        where: { slug: { in: articleSlugs } },
        select: { id: true },
      })
      if (articles.length > 0) {
        await prisma.labTestArticle.createMany({
          data: articles.map((a: { id: string }) => ({ labTestId: test.id, articleId: a.id })),
          skipDuplicates: true,
        })
      }
    }
    return NextResponse.json({ data: test })
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const { slug } = await params
  try {
    await prisma.labTest.delete({ where: { slug } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
