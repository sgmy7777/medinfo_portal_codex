// Тесты API симптомов: публичные и admin endpoints

beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}) })
afterAll(() => { jest.restoreAllMocks() })

// ── Mock данные ───────────────────────────────────────────────────────────────

const mockSymptom = {
  id: 'sym-1',
  title: 'Головная боль',
  slug: 'golovnaya-bol',
  description: 'Боль или неприятные ощущения в области головы',
  bodySystem: 'head',
  severity: 'medium',
  createdAt: new Date('2026-01-01'),
  articles: [],
}

const mockSymptomWithArticles = {
  ...mockSymptom,
  articles: [
    {
      symptomId: 'sym-1',
      articleId: 'art-1',
      article: {
        id: 'art-1',
        title: 'Мигрень: причины и лечение',
        slug: 'migren-prichiny-lechenie',
        excerpt: 'Подробно о мигрени',
        ogImageUrl: null,
        viewCount: 120,
        publishedAt: new Date('2026-02-01'),
        isPublished: true,
        category: { title: 'Неврология', slug: 'nevrologiya' },
        author: { name: 'Иванов И.И.' },
      },
    },
  ],
}

const mockSymptomChest = {
  id: 'sym-2',
  title: 'Боль в груди',
  slug: 'bol-v-grudi',
  description: 'Боль или давление в грудной клетке',
  bodySystem: 'chest',
  severity: 'high',
  createdAt: new Date('2026-01-02'),
  articles: [],
}

// ── Mock Prisma ───────────────────────────────────────────────────────────────

jest.mock('@/lib/prisma', () => ({
  prisma: {
    symptom: {
      findMany:  jest.fn(),
      findUnique: jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
      delete:    jest.fn(),
    },
    symptomArticle: {
      deleteMany: jest.fn(),
      create:    jest.fn(),
    },
    article: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue(null), // null = авторизован
}))

import { prisma } from '@/lib/prisma'

function makeRequest(method: string, body?: object, url = 'http://localhost:3000/api/symptoms') {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ── GET /api/symptoms ─────────────────────────────────────────────────────────

describe('GET /api/symptoms', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает список всех симптомов', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue([mockSymptom, mockSymptomChest])

    const { GET } = await import('@/app/api/symptoms/route')
    const res = await GET(makeRequest('GET') as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toHaveLength(2)
  })

  test('возвращает симптомы с полем articles', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue([mockSymptomWithArticles])

    const { GET } = await import('@/app/api/symptoms/route')
    const res = await GET(makeRequest('GET') as any)
    const json = await res.json()

    expect(json.data[0]).toHaveProperty('articles')
  })

  test('фильтрует по системе органов через ?system=', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue([mockSymptom])

    const { GET } = await import('@/app/api/symptoms/route')
    const req = makeRequest('GET', undefined, 'http://localhost:3000/api/symptoms?system=head')
    const res = await GET(req as any)
    const json = await res.json()

    expect(json.data).toHaveLength(1)
    expect(json.data[0].bodySystem).toBe('head')
    expect(prisma.symptom.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bodySystem: 'head' } })
    )
  })

  test('без параметра system не передаёт where-фильтр', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue([])

    const { GET } = await import('@/app/api/symptoms/route')
    await GET(makeRequest('GET') as any)

    expect(prisma.symptom.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    )
  })

  test('возвращает пустой массив если симптомов нет', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue([])

    const { GET } = await import('@/app/api/symptoms/route')
    const res = await GET(makeRequest('GET') as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toHaveLength(0)
  })

  test('возвращает 500 при ошибке базы данных', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))

    const { GET } = await import('@/app/api/symptoms/route')
    const res = await GET(makeRequest('GET') as any)

    expect(res.status).toBe(500)
  })
})

// ── GET /api/symptoms/[slug] ──────────────────────────────────────────────────

describe('GET /api/symptoms/[slug]', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает симптом по slug', async () => {
    ;(prisma.symptom.findUnique as jest.Mock).mockResolvedValue(mockSymptomWithArticles)

    const { GET } = await import('@/app/api/symptoms/[slug]/route')
    const res = await GET(makeRequest('GET') as any, {
      params: Promise.resolve({ slug: 'golovnaya-bol' }),
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.slug).toBe('golovnaya-bol')
  })

  test('возвращает 404 для несуществующего slug', async () => {
    ;(prisma.symptom.findUnique as jest.Mock).mockResolvedValue(null)

    const { GET } = await import('@/app/api/symptoms/[slug]/route')
    const res = await GET(makeRequest('GET') as any, {
      params: Promise.resolve({ slug: 'ne-suschestvuet' }),
    })

    expect(res.status).toBe(404)
  })

  test('включает связанные статьи в ответ', async () => {
    ;(prisma.symptom.findUnique as jest.Mock).mockResolvedValue(mockSymptomWithArticles)

    const { GET } = await import('@/app/api/symptoms/[slug]/route')
    const res = await GET(makeRequest('GET') as any, {
      params: Promise.resolve({ slug: 'golovnaya-bol' }),
    })
    const json = await res.json()

    expect(json.data.articles).toHaveLength(1)
    expect(json.data.articles[0].article.title).toBe('Мигрень: причины и лечение')
  })

  test('возвращает корректные поля симптома', async () => {
    ;(prisma.symptom.findUnique as jest.Mock).mockResolvedValue(mockSymptom)

    const { GET } = await import('@/app/api/symptoms/[slug]/route')
    const res = await GET(makeRequest('GET') as any, {
      params: Promise.resolve({ slug: 'golovnaya-bol' }),
    })
    const json = await res.json()

    expect(json.data).toHaveProperty('title')
    expect(json.data).toHaveProperty('bodySystem')
    expect(json.data).toHaveProperty('severity')
  })
})

// ── GET /api/admin/symptoms ───────────────────────────────────────────────────

describe('GET /api/admin/symptoms', () => {
  beforeEach(() => jest.clearAllMocks())

  test('возвращает список симптомов для авторизованного', async () => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue([mockSymptom])

    const { GET } = await import('@/app/api/admin/symptoms/route')
    const res = await GET(makeRequest('GET') as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toHaveLength(1)
  })

  test('блокирует неавторизованный доступ', async () => {
    const { requireAuth } = await import('@/lib/auth')
    ;(requireAuth as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    )

    const { GET } = await import('@/app/api/admin/symptoms/route')
    const res = await GET(makeRequest('GET') as any)

    expect(res.status).toBe(401)
  })
})

// ── POST /api/admin/symptoms ──────────────────────────────────────────────────

describe('POST /api/admin/symptoms', () => {
  beforeEach(() => jest.clearAllMocks())

  test('создаёт симптом с валидными данными', async () => {
    ;(prisma.symptom.create as jest.Mock).mockResolvedValue(mockSymptom)

    const { POST } = await import('@/app/api/admin/symptoms/route')
    const res = await POST(makeRequest('POST', {
      title: 'Головная боль',
      slug: 'golovnaya-bol',
      bodySystem: 'head',
      severity: 'medium',
      description: 'Боль в голове',
    }) as any)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.data.title).toBe('Головная боль')
  })

  test('возвращает 400 если нет title', async () => {
    const { POST } = await import('@/app/api/admin/symptoms/route')
    const res = await POST(makeRequest('POST', {
      slug: 'golovnaya-bol',
      bodySystem: 'head',
    }) as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 400 если нет slug', async () => {
    const { POST } = await import('@/app/api/admin/symptoms/route')
    const res = await POST(makeRequest('POST', {
      title: 'Головная боль',
      bodySystem: 'head',
    }) as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 400 если нет bodySystem', async () => {
    const { POST } = await import('@/app/api/admin/symptoms/route')
    const res = await POST(makeRequest('POST', {
      title: 'Головная боль',
      slug: 'golovnaya-bol',
    }) as any)

    expect(res.status).toBe(400)
  })

  test('возвращает 409 при дублирующемся slug', async () => {
    ;(prisma.symptom.create as jest.Mock).mockRejectedValue(
      Object.assign(new Error('Unique constraint'), { code: 'P2002' })
    )

    const { POST } = await import('@/app/api/admin/symptoms/route')
    const res = await POST(makeRequest('POST', {
      title: 'Головная боль',
      slug: 'golovnaya-bol',
      bodySystem: 'head',
    }) as any)

    expect(res.status).toBe(409)
  })

  test('использует severity medium по умолчанию', async () => {
    ;(prisma.symptom.create as jest.Mock).mockResolvedValue({ ...mockSymptom, severity: 'medium' })

    const { POST } = await import('@/app/api/admin/symptoms/route')
    await POST(makeRequest('POST', {
      title: 'Тест',
      slug: 'test-sym',
      bodySystem: 'general',
      // severity не передаём
    }) as any)

    expect(prisma.symptom.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ severity: 'medium' }),
      })
    )
  })
})

// ── PUT /api/admin/symptoms/[slug] ────────────────────────────────────────────

describe('PUT /api/admin/symptoms/[slug]', () => {
  beforeEach(() => jest.clearAllMocks())

  test('обновляет симптом', async () => {
    const updated = { ...mockSymptom, title: 'Сильная головная боль', severity: 'high' }
    ;(prisma.symptom.update as jest.Mock).mockResolvedValue(updated)

    const { PUT } = await import('@/app/api/admin/symptoms/[slug]/route')
    const res = await PUT(makeRequest('PUT', {
      title: 'Сильная головная боль',
      bodySystem: 'head',
      severity: 'high',
    }) as any, { params: Promise.resolve({ slug: 'golovnaya-bol' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.title).toBe('Сильная головная боль')
  })

  test('обновляет связанные статьи при передаче articleSlugs', async () => {
    ;(prisma.symptom.update as jest.Mock).mockResolvedValue(mockSymptom)
    ;(prisma.symptomArticle.deleteMany as jest.Mock).mockResolvedValue({})
    ;(prisma.article.findUnique as jest.Mock).mockResolvedValue({ id: 'art-1', slug: 'test-art' })
    ;(prisma.symptomArticle.create as jest.Mock).mockResolvedValue({})

    const { PUT } = await import('@/app/api/admin/symptoms/[slug]/route')
    await PUT(makeRequest('PUT', {
      title: 'Головная боль',
      bodySystem: 'head',
      severity: 'medium',
      articleSlugs: ['test-art'],
    }) as any, { params: Promise.resolve({ slug: 'golovnaya-bol' }) })

    expect(prisma.symptomArticle.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { symptomId: 'sym-1' } })
    )
    expect(prisma.symptomArticle.create).toHaveBeenCalledTimes(1)
  })

  test('не обновляет статьи если articleSlugs не передан', async () => {
    ;(prisma.symptom.update as jest.Mock).mockResolvedValue(mockSymptom)

    const { PUT } = await import('@/app/api/admin/symptoms/[slug]/route')
    await PUT(makeRequest('PUT', {
      title: 'Головная боль',
      bodySystem: 'head',
    }) as any, { params: Promise.resolve({ slug: 'golovnaya-bol' }) })

    expect(prisma.symptomArticle.deleteMany).not.toHaveBeenCalled()
  })
})

// ── DELETE /api/admin/symptoms/[slug] ─────────────────────────────────────────

describe('DELETE /api/admin/symptoms/[slug]', () => {
  beforeEach(() => jest.clearAllMocks())

  test('удаляет симптом и возвращает ok: true', async () => {
    ;(prisma.symptom.delete as jest.Mock).mockResolvedValue(mockSymptom)

    const { DELETE } = await import('@/app/api/admin/symptoms/[slug]/route')
    const res = await DELETE(makeRequest('DELETE') as any, {
      params: Promise.resolve({ slug: 'golovnaya-bol' }),
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(prisma.symptom.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'golovnaya-bol' } })
    )
  })
})

// ── Валидация severity ────────────────────────────────────────────────────────

describe('Значения severity симптомов', () => {
  const VALID_SEVERITIES = ['low', 'medium', 'high']

  test.each(VALID_SEVERITIES)('severity "%s" принимается', async (severity) => {
    ;(prisma.symptom.create as jest.Mock).mockResolvedValue({ ...mockSymptom, severity })

    const { POST } = await import('@/app/api/admin/symptoms/route')
    const res = await POST(makeRequest('POST', {
      title: 'Тест',
      slug: `test-${severity}`,
      bodySystem: 'general',
      severity,
    }) as any)

    expect(res.status).toBe(201)
  })
})

// ── Значения bodySystem ───────────────────────────────────────────────────────

describe('Значения bodySystem симптомов', () => {
  const VALID_SYSTEMS = ['head', 'chest', 'abdomen', 'skin', 'joints', 'general', 'neuro', 'urology', 'women']

  test.each(VALID_SYSTEMS)('bodySystem "%s" передаётся корректно', async (system) => {
    ;(prisma.symptom.findMany as jest.Mock).mockResolvedValue(
      [{ ...mockSymptom, bodySystem: system }]
    )

    const { GET } = await import('@/app/api/symptoms/route')
    const req = makeRequest('GET', undefined, `http://localhost:3000/api/symptoms?system=${system}`)
    const res = await GET(req as any)
    const json = await res.json()

    expect(json.data[0].bodySystem).toBe(system)
  })
})
