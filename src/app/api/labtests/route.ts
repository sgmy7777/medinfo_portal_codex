import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
      include: { articles: { include: { article: { select: { id: true, title: true, slug: true, isPublished: true } } } } },
    })
    return NextResponse.json({ data: tests })
  } catch {
    return NextResponse.json({ error: 'Ошибка получения данных' }, { status: 500 })
  }
}
