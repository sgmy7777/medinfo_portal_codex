import UnifiedHeader from '@/components/public/UnifiedHeader'
import { prisma } from '@/lib/prisma'

async function getHeaderCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { articles: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getHeaderCategories()

  return (
    <>
      <UnifiedHeader categories={categories} />
      {children}
    </>
  )
}
