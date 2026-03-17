import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { slug } = await params
  try {
    const test = await prisma.labTest.findUnique({
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
    if (!test) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    return NextResponse.json({ data: test })
  } catch {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
