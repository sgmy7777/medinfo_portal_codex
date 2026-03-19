import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zdravinfo.ru'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Статические страницы ───────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/symptoms`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/tests`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/tests/decode`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/calculators`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/calculators/bmi`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/calculators/ideal-weight`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/calculators/calories`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/calculators/water`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/calculators/heart-rate`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/calculators/lab`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/search`,   lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/contacts`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/privacy`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // ── Статьи ─────────────────────────────────────────────────────────────────
  let articles: MetadataRoute.Sitemap = []
  try {
    const rows = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    articles = rows.map(a => ({
      url: `${BASE_URL}/article/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch { /* БД недоступна при build — пропускаем */ }

  // ── Категории ──────────────────────────────────────────────────────────────
  let categories: MetadataRoute.Sitemap = []
  try {
    const rows = await prisma.category.findMany({
      select: { slug: true },
    })
    categories = rows.map(cat => ({
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  } catch { /* пропускаем */ }

  // ── Симптомы ───────────────────────────────────────────────────────────────
  let symptoms: MetadataRoute.Sitemap = []
  try {
    const rows = await prisma.symptom.findMany({
      select: { slug: true, createdAt: true },
    })
    symptoms = rows.map(s => ({
      url: `${BASE_URL}/symptoms/${s.slug}`,
      lastModified: s.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch { /* пропускаем */ }

  // ── Анализы ────────────────────────────────────────────────────────────────
  let labTests: MetadataRoute.Sitemap = []
  try {
    const rows = await prisma.labTest.findMany({
      select: { slug: true, createdAt: true },
    })
    labTests = rows.map(t => ({
      url: `${BASE_URL}/tests/${t.slug}`,
      lastModified: t.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch { /* пропускаем */ }

  return [
    ...staticPages,
    ...categories,
    ...articles,
    ...symptoms,
    ...labTests,
  ]
}
