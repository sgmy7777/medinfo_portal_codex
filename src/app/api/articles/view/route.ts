import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/articles/view  { slug }
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json()
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 })

    await prisma.article.update({
      where: { slug, isPublished: true },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ ok: true })
  } catch {
    // тихо игнорируем — счётчик не критичен
    return NextResponse.json({ ok: false })
  }
}
