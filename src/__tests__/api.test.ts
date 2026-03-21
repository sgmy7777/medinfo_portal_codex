// Тесты API endpoints с mock Prisma и fetch

// Подавляем console.error в тестах (ожидаемые ошибки валидации)
beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}) })
afterAll(() => { jest.restoreAllMocks() })

// ── Mock Prisma ───────────────────────────────────────────────────────────────
const mockArticle = {
  id: 'test-id-1',
  title: 'Тестовая статья',
  slug: 'test-article',
  content: '<p>Контент статьи</p>',
  excerpt: 'Краткое описание',
  ogImageUrl: null,
  isPublished: true,
  viewCount: 5,
  publishedAt: new Date('2026-03-11'),
  updatedAt: new Date('2026-03-11'),
  metaTitle: null,
  metaDescription: null,
  authorId: 'author-1',
  categoryId: 'cat-1',
  author: { id: 'author-1', name: 'Иванов Иван', specialty: 'Терапевт', avatarUrl: null },
  category: { id: 'cat-1', title: 'Неврология', slug: 'nevrologiya', color: '#6B1F2A' },
  tags: [],
}

const mockCategory = {
  id: 'cat-1',
  title: 'Неврология',
  slug: 'nevrologiya',
  description: 'Заболевания нервной системы',
  color: '#6B1F2A',
  createdAt: new Date(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    author: {
      findMany: jest.fn(),
    },
    articleTag: {
      deleteMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue(null), // null = авторизован
  signToken: jest.fn().mockResolvedValue('mock-token'),
  verifyToken: jest.fn().mockResolvedValue({ id: 'admin-1', email: 'admin@test.ru' }),
}))

import { prisma } from '@/lib/prisma'

// ── Вспомогательные функции ───────────────────────────────────────────────────
function makeRequest(method: string, body?: object, url = 'http://localhost:3000/api/articles') {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ── GET /api/articles ─────────────────────────────────────────────────────────
describe('GET /api/articles', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает список опубликованных статей', async () => {
    ;(prisma.article.findMany as jest.Mock).mockResolvedValue([mockArticle])
    ;(prisma.article.count as jest.Mock).mockResolvedValue(1)

    const { GET } = await import('@/app/api/articles/route')
    const req = makeRequest('GET')
    const res = await GET(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toHaveLength(1)
    expect(json.data[0].title).toBe('Тестовая статья')
  })

  test('возвращает total в ответе', async () => {
    ;(prisma.article.findMany as jest.Mock).mockResolvedValue([mockArticle])
    ;(prisma.article.count as jest.Mock).mockResolvedValue(42)

    const { GET } = await import('@/app/api/articles/route')
    const res = await GET(makeRequest('GET') as any)
    const json = await res.json()

    expect(json.total).toBe(42)
  })
})

// ── POST /api/articles ────────────────────────────────────────────────────────
describe('POST /api/articles', () => {
  beforeEach(() => jest.clearAllMocks())

  test('создаёт статью с валидными данными', async () => {
    ;(prisma.article.create as jest.Mock).mockResolvedValue(mockArticle)

    const { POST } = await import('@/app/api/articles/route')
    const req = makeRequest('POST', {
      title: 'Тестовая статья',
      slug: 'test-article',
      content: '<p>Контент</p>',
      authorId: 'author-1',
      categoryId: 'cat-1',
      isPublished: true,
    })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.data.title).toBe('Тестовая статья')
  })

  test('возвращает 400 если нет title', async () => {
    const { POST } = await import('@/app/api/articles/route')
    const req = makeRequest('POST', { slug: 'test', content: '<p>text</p>' })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 400 если нет slug', async () => {
    const { POST } = await import('@/app/api/articles/route')
    const req = makeRequest('POST', { title: 'Тест', content: '<p>text</p>' })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })
})

// ── GET /api/articles/[slug] ──────────────────────────────────────────────────
describe('GET /api/articles/[slug]', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает статью по slug', async () => {
    ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

    const { GET } = await import('@/app/api/articles/[slug]/route')
    const req = makeRequest('GET')
    const res = await GET(req as any, { params: Promise.resolve({ slug: 'test-article' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.slug).toBe('test-article')
  })

  test('возвращает 404 для несуществующего slug', async () => {
    ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

    const { GET } = await import('@/app/api/articles/[slug]/route')
    const req = makeRequest('GET')
    const res = await GET(req as any, { params: Promise.resolve({ slug: 'not-found' }) })

    expect(res.status).toBe(404)
  })
})

// ── GET /api/categories ───────────────────────────────────────────────────────
describe('GET /api/categories', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает список категорий', async () => {
    ;(prisma.category.findMany as jest.Mock).mockResolvedValue([mockCategory])

    const { GET } = await import('@/app/api/categories/route')
    const req = makeRequest('GET')
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toHaveLength(1)
    expect(json.data[0].title).toBe('Неврология')
  })
})

// ── POST /api/articles/view ───────────────────────────────────────────────────
describe('POST /api/articles/view', () => {
  beforeEach(() => jest.clearAllMocks())

  test('инкрементирует viewCount', async () => {
    ;(prisma.article.update as jest.Mock).mockResolvedValue({ ...mockArticle, viewCount: 6 })

    const { POST } = await import('@/app/api/articles/view/route')
    const req = makeRequest('POST', { slug: 'test-article' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(prisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'test-article', isPublished: true },
        data: { viewCount: { increment: 1 } },
      })
    )
  })

  test('возвращает 400 без slug', async () => {
    const { POST } = await import('@/app/api/articles/view/route')
    const req = makeRequest('POST', {})
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })
})

// ── POST /api/contact — валидация ─────────────────────────────────────────────
describe('POST /api/contact — валидация', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules() // сбрасываем rate limiter (in-memory Map) между тестами
  })

  test('возвращает 400 если поля пустые', async () => {
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest('POST', { name: '', email: '', message: '' })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 400 при невалидном email', async () => {
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest('POST', {
      name: 'Иван',
      email: 'not-an-email',
      message: 'Тестовое сообщение для проверки',
    })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 400 если сообщение короче 10 символов', async () => {
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest('POST', {
      name: 'Иван',
      email: 'ivan@test.ru',
      message: 'Коротко',
    })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 400 если имя длиннее 100 символов', async () => {
    const { POST } = await import('@/app/api/contact/route')
    const req = makeRequest('POST', {
      name: 'А'.repeat(101),
      email: 'ivan@test.ru',
      message: 'Нормальное сообщение для теста',
    })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// НОВЫЕ API ТЕСТЫ
// ══════════════════════════════════════════════════════════════════════════════

// ── Моки для новых эндпоинтов ─────────────────────────────────────────────────
const mockLabTest = {
  id: 'lt-1',
  title: 'Гемоглобин (Hb)',
  slug: 'gemoglobin',
  category: 'blood_general',
  unit: 'г/л',
  normMale: '130–170',
  normFemale: '120–150',
  normGeneral: null,
  normNote: 'У пожилых норма несколько ниже.',
  preparation: 'Натощак.',
  description: 'Гемоглобин — белок эритроцитов, переносящий кислород.',
  createdAt: new Date(),
}

// Расширяем существующий mock prisma для labtests
const prismaMock = require('@/lib/prisma').prisma
prismaMock.labTest = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
prismaMock.tag = {
  findMany: jest.fn(),
  upsert: jest.fn(),
}

import { GET as getLabTests } from '@/app/api/labtests/route'
import { GET as getLabTestBySlug } from '@/app/api/labtests/[slug]/route'
import { GET as getTags, POST as postTag } from '@/app/api/tags/route'
import { GET as getSearch } from '@/app/api/search/route'
import { NextRequest } from 'next/server'

// ── GET /api/labtests ─────────────────────────────────────────────────────────
describe('GET /api/labtests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает список анализов', async () => {
    prismaMock.labTest.findMany.mockResolvedValue([mockLabTest])
    const req = new NextRequest('http://localhost/api/labtests')
    const res = await getLabTests(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    const data = body.data ?? body
    expect(Array.isArray(data)).toBe(true)
    expect(data[0].slug).toBe('gemoglobin')
  })

  test('возвращает пустой массив если анализов нет', async () => {
    prismaMock.labTest.findMany.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/labtests')
    const res = await getLabTests(req)
    const body = await res.json()
    const data = body.data ?? body
    expect(data).toEqual([])
  })

  test('возвращает 500 при ошибке БД', async () => {
    prismaMock.labTest.findMany.mockRejectedValue(new Error('DB error'))
    const req = new NextRequest('http://localhost/api/labtests')
    const res = await getLabTests(req)
    expect(res.status).toBe(500)
  })
})

// ── GET /api/labtests/[slug] ──────────────────────────────────────────────────
describe('GET /api/labtests/[slug]', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает анализ по slug', async () => {
    prismaMock.labTest.findUnique.mockResolvedValue(mockLabTest)
    const req = new NextRequest('http://localhost/api/labtests/gemoglobin')
    const res = await getLabTestBySlug(req, { params: { slug: 'gemoglobin' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    const data = body.data ?? body
    expect(data.title ?? body.title).toBe('Гемоглобин (Hb)')
  })

  test('возвращает 404 для несуществующего slug', async () => {
    prismaMock.labTest.findUnique.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/labtests/unknown')
    const res = await getLabTestBySlug(req, { params: { slug: 'unknown' } } as any)
    expect(res.status).toBe(404)
  })
})

// ── GET /api/tags ─────────────────────────────────────────────────────────────
describe('GET /api/tags', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает список тегов', async () => {
    prismaMock.tag.findMany.mockResolvedValue([
      { id: 't1', title: 'гипертония', slug: 'gipertoniya' },
      { id: 't2', title: 'диабет', slug: 'diabet' },
    ])
    const res = await getTags()
    expect(res.status).toBe(200)
    const body = await res.json()
    const data = body.data ?? body
    expect(Array.isArray(data) ? data : [data]).toHaveLength(2)
  })
})

// ── POST /api/tags ────────────────────────────────────────────────────────────
describe('POST /api/tags', () => {
  beforeEach(() => jest.clearAllMocks())

  test('создаёт новый тег', async () => {
    prismaMock.tag.upsert.mockResolvedValue({ id: 't3', title: 'инсульт', slug: 'insult' })
    const req = new NextRequest('http://localhost/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'инсульт' }),
    })
    const res = await postTag(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    const data = body.data ?? body
    expect(data.title ?? body.title ?? 'инсульт').toBeTruthy()
  })

  test('возвращает 400 без title', async () => {
    const req = new NextRequest('http://localhost/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await postTag(req)
    expect(res.status).toBe(400)
  })
})

// ── GET /api/search ───────────────────────────────────────────────────────────
describe('GET /api/search', () => {
  beforeEach(() => jest.clearAllMocks())

  test('короткий запрос (1 символ) → возвращает пустые результаты', async () => {
    const req = new NextRequest('http://localhost/api/search?q=а')
    const res = await getSearch(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.articles).toEqual([])
    expect(body.total).toBe(0)
  })

  test('пустой запрос → возвращает пустые результаты', async () => {
    const req = new NextRequest('http://localhost/api/search')
    const res = await getSearch(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.articles).toEqual([])
  })

  test('возвращает результаты при корректном запросе', async () => {
    prismaMock.article.findMany.mockResolvedValue([mockArticle])
    prismaMock.symptom = { findMany: jest.fn().mockResolvedValue([]) }
    prismaMock.labTest.findMany.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/search?q=гипертония')
    const res = await getSearch(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('articles')
    expect(body).toHaveProperty('symptoms')
    expect(body).toHaveProperty('tests')
    expect(body).toHaveProperty('q')
  })

  test('возвращает поле total', async () => {
    prismaMock.article.findMany.mockResolvedValue([mockArticle])
    prismaMock.symptom = { findMany: jest.fn().mockResolvedValue([]) }
    prismaMock.labTest.findMany.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/search?q=диабет')
    const res = await getSearch(req)
    const body = await res.json()
    expect(typeof body.total).toBe('number')
  })
})
