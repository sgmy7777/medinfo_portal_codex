import type { Metadata } from 'next'
import ContactsClient from './client'

export const metadata: Metadata = {
  title: 'Контакты — ЗдравИнфо',
  description: 'Свяжитесь с редакцией медицинского портала ЗдравИнфо. Форма обратной связи.',
  openGraph: {
    title: 'Контакты — ЗдравИнфо',
    description: 'Свяжитесь с редакцией медицинского портала ЗдравИнфо. Форма обратной связи.',
    type: 'website',
  },
}

export default function ContactsPage() {
  return <ContactsClient />
}
