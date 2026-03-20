import type { Metadata } from 'next'
import { Suspense } from 'react'
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

function SearchFallback() {
  return (
    <div style={{ background: '#F7F2EA', minHeight: '60vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ height: 36, width: 200, background: '#EDE5D8', borderRadius: 2, marginBottom: 24 }} />
        <div style={{ height: 52, background: 'white', border: '2px solid #DDD5C5', borderRadius: 2 }} />
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  )
}
