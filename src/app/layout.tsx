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
    icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
   verification: {
    yandex: '65r5fqhad4nvg55p',
  },
}

const themeScript = `(function(){try{var t=localStorage.getItem('zi-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}else if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${playfair.variable} ${ptSerif.variable} ${ptSans.variable}`}>
      <body className="font-sans antialiased">
	<script type="text/javascript" dangerouslySetInnerHTML={{ __html: `
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108286850', 'ym');
          ym(108286850, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
        `}} />
        <noscript><div><img src="https://mc.yandex.ru/watch/108286850" style={{position:'absolute', left:'-9999px'}} alt="" /></div></noscript>
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
