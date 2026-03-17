import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200/80">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-[#1A6B4A] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 3 1.5 4L6 21l2-1 2 1 2-1 2 1 2-1 2 1-1.5-10C17.5 10 18 8.5 18 7c0-2.5-2.5-5-6-5z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-stone-900 text-[1.05rem] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                ДентаМед
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                Советы стоматолога
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/category/stomatologiya', label: 'Стоматология' },
              { href: '/category/profilaktika', label: 'Профилактика' },
              { href: '/category/detskaya-stomatologiya', label: 'Детям' },
              { href: '/author', label: 'Об авторе' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm text-stone-600 hover:text-[#1A6B4A] hover:bg-emerald-50 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <div className="w-8 h-8 flex flex-col gap-1.5 justify-center items-center">
              <span className="w-5 h-0.5 bg-stone-600 rounded" />
              <span className="w-5 h-0.5 bg-stone-600 rounded" />
              <span className="w-3 h-0.5 bg-stone-600 rounded" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
          <div>
            <div className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              ДентаМед
            </div>
            <p className="text-sm leading-relaxed">
              Достоверные статьи о здоровье полости рта, написанные и проверенные практикующим стоматологом.
            </p>
          </div>
          <div>
            <div className="text-stone-300 font-semibold text-sm uppercase tracking-wide mb-3">Разделы</div>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/category/stomatologiya', label: 'Стоматология' },
                { href: '/category/bolezni-dyosen', label: 'Болезни дёсен' },
                { href: '/category/profilaktika', label: 'Профилактика' },
                { href: '/category/detskaya-stomatologiya', label: 'Детская стоматология' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-stone-300 font-semibold text-sm uppercase tracking-wide mb-3">Информация</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/author" className="hover:text-white transition-colors">Об авторе</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <span>© {new Date().getFullYear()} ДентаМед. Все права защищены.</span>
          <span className="text-stone-600">Материалы носят информационный характер. Не заменяют консультацию врача.</span>
        </div>
      </div>
    </footer>
  )
}
