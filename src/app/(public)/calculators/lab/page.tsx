import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Калькуляторы анализов: СКФ, SCORE2, CHA₂DS₂-VASc, Child-Pugh — ЗдравИнфо',
  description: 'СКФ (CKD-EPI), ЛПНП, HOMA-IR, SCORE2 (риск инфаркта), CHA₂DS₂-VASc (риск инсульта при ФП), Child-Pugh (цирроз) — 7 клинических калькуляторов.',
  openGraph: {
    title: 'Калькуляторы анализов: СКФ, SCORE2, CHA₂DS₂-VASc, Child-Pugh — ЗдравИнфо',
    description: 'СКФ (CKD-EPI), ЛПНП, HOMA-IR, SCORE2 (риск инфаркта), CHA₂DS₂-VASc (риск инсульта при ФП), Child-Pugh (цирроз) — 7 клинических калькуляторов.',
    type: 'website',
  },
}
import LabCalculatorsPageClient from './client'

export default function LabCalculatorsPage(props: any) {
  return <LabCalculatorsPageClient {...props} />
}
