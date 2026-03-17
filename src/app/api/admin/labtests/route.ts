import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const tests = await prisma.labTest.findMany({
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
    include: { articles: true },
  })
  return NextResponse.json({ data: tests })
}

export async function POST(req: NextRequest) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const body = await req.json()
  const { title, slug, description, category, unit, normMale, normFemale, normGeneral, preparation } = body
  if (!title || !slug || !category) {
    return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
  }
  try {
    const test = await prisma.labTest.create({
      data: {
        title, slug, description: description || null, category,
        unit: unit || null,
        normMale: normMale || null,
        normFemale: normFemale || null,
        normGeneral: normGeneral || null,
        preparation: preparation || null,
      }
    })
    return NextResponse.json({ data: test }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Slug уже существует' }, { status: 409 })
  }
}
