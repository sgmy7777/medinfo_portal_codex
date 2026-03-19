import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Расшифровка анализов крови онлайн — ЗдравИнфо',
  description: 'Введите значение из бланка — узнайте норму, причины отклонений и к какому врачу обратиться.',
  openGraph: {
    title: 'Расшифровка анализов крови онлайн — ЗдравИнфо',
    description: 'Введите значение из бланка — узнайте норму, причины отклонений и к какому врачу обратиться.',
    type: 'website',
  },
}
import DecodePageClient from './client'

export default function DecodePage(props: any) {
  return <DecodePageClient {...props} />
}
