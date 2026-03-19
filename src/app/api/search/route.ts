import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ articles: [], symptoms: [], tests: [], total: 0, q })
  }

  try {
    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        title: true, slug: true, excerpt: true,
        category: { select: { title: true, slug: true } },
      },
      take: 5,
      orderBy: { viewCount: 'desc' },
    })

    const symptoms = await prisma.symptom.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { title: true, slug: true, description: true },
      take: 4,
    })

    const tests = await prisma.labTest.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { normGeneral: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { title: true, slug: true, unit: true, category: true, description: true },
      take: 4,
    })

    const total = articles.length + symptoms.length + tests.length
    return NextResponse.json({ articles, symptoms, tests, total, q })
  } catch {
    return NextResponse.json({ articles: [], symptoms: [], tests: [], total: 0, q })
  }
}
