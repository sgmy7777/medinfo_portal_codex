import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const system = searchParams.get('system')

    const symptoms = await prisma.symptom.findMany({
      where: system ? { bodySystem: system } : undefined,
      orderBy: [{ bodySystem: 'asc' }, { title: 'asc' }],
      include: {
        articles: {
          include: {
            article: {
              select: { id: true, title: true, slug: true, category: { select: { title: true, slug: true } } }
            }
          }
        }
      }
    })

    return NextResponse.json({ data: symptoms })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
