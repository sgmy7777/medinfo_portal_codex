import type { Metadata } from 'next'
import SearchClient from './client'

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `«${q}» — поиск на ЗдравИнфо` : 'Поиск — ЗдравИнфо',
    description: 'Поиск по статьям, симптомам и справочнику анализов на медицинском портале ЗдравИнфо.',
    robots: { index: false },
  }
}

export default function SearchPage() {
  return <SearchClient />
}
