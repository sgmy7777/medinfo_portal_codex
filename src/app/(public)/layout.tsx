import UnifiedFooter from '@/components/public/UnifiedFooter'
import UnifiedHeader from '@/components/public/UnifiedHeader'
import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'

async function getHeaderCategories() {
  noStore()
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
      <UnifiedFooter />
    </>
  )
}
