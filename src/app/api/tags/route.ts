import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — список всех тегов
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true },
    })
    return NextResponse.json({ data: tags })
  } catch {
    return NextResponse.json({ error: 'Ошибка загрузки тегов' }, { status: 500 })
  }
}

// POST — создать новый тег
export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Название обязательно' }, { status: 400 })
    const slug = title.trim().toLowerCase()
      .replace(/[а-яё]/g, (c: string) => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' } as Record<string,string>)[c] ?? c)
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { title: title.trim(), slug },
    })
    return NextResponse.json({ data: tag })
  } catch {
    return NextResponse.json({ error: 'Ошибка создания тега' }, { status: 500 })
  }
}
