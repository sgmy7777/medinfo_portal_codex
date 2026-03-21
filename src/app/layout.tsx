import type { Metadata, Viewport } from 'next'
import { Playfair_Display, PT_Serif, PT_Sans } from 'next/font/google'
import './globals.css'
import CookieBanner from '@/components/public/CookieBanner'
import ThemeProvider from '@/components/public/ThemeProvider'
import SearchHotkey from '@/components/public/SearchHotkey'

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

const themeScript = `(function(){try{var t=localStorage.getItem('zi-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}else if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${playfair.variable} ${ptSerif.variable} ${ptSans.variable}`}>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          {children}
          <SearchHotkey />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
