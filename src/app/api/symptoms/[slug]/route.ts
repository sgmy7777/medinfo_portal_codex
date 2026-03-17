import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params
    const symptom = await prisma.symptom.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { article: { isPublished: true } },
          include: {
            article: {
              select: {
                id: true, title: true, slug: true, excerpt: true,
                ogImageUrl: true, viewCount: true, publishedAt: true,
                category: { select: { title: true, slug: true } },
                author: { select: { name: true } },
              }
            }
          }
        }
      }
    })

    if (!symptom) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    return NextResponse.json({ data: symptom })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
