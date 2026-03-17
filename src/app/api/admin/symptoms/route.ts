import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const symptoms = await prisma.symptom.findMany({
    orderBy: [{ bodySystem: 'asc' }, { title: 'asc' }],
    include: { articles: true },
  })
  return NextResponse.json({ data: symptoms })
}

export async function POST(req: NextRequest) {
  const authErr = await requireAuth(req); if (authErr) return authErr
  const body = await req.json()
  const { title, slug, description, bodySystem, severity } = body
  if (!title || !slug || !bodySystem) {
    return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 })
  }
  try {
    const symptom = await prisma.symptom.create({
      data: { title, slug, description: description || null, bodySystem, severity: severity || 'medium' }
    })
    return NextResponse.json({ data: symptom }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Slug уже существует' }, { status: 409 })
  }
}
