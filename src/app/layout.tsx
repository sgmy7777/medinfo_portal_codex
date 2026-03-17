import type { Metadata, Viewport } from 'next'
import { Playfair_Display, PT_Serif, PT_Sans } from 'next/font/google'
import './globals.css'
import CookieBanner from '@/components/public/CookieBanner'

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
})

const ptSerif = PT_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  display: 'swap',
})

const ptSans = PT_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'ЗдравИнфо — Медицинский портал',
  description: 'Медицинский информационный портал. Статьи проверены практикующими врачами.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${playfair.variable} ${ptSerif.variable} ${ptSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
