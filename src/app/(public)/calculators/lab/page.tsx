import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькуляторы анализов: СКФ, HOMA-IR, индекс атерогенности — ЗдравИнфо',
  description: 'Рассчитайте скорость клубочковой фильтрации (СКФ), HOMA-IR, ЛПНП по Фридевальду и индекс атерогенности.',
  openGraph: {
    title: 'Калькуляторы анализов: СКФ, HOMA-IR, индекс атерогенности — ЗдравИнфо',
    description: 'Рассчитайте скорость клубочковой фильтрации (СКФ), HOMA-IR, ЛПНП по Фридевальду и индекс атерогенности.',
    type: 'website',
  },
}
import LabCalculatorsPageClient from './client'

export default function LabCalculatorsPage(props: any) {
  return <LabCalculatorsPageClient {...props} />
}
