import Link from 'next/link'

export default function UnifiedFooter() {
  return (
    <footer className="mt-16 bg-[#1C1208] text-white/65">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-8 border-b border-white/8 pb-8 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="font-[var(--font-playfair)] text-[22px] font-black text-white no-underline"
            >
              Здрав<span className="text-[#C8913A]">Инфо</span>
            </Link>
            <p className="mt-2 max-w-[280px] text-[11px] leading-[1.7] text-white/55">
              Медицинский информационный портал. Материалы носят образовательный характер и не
              заменяют консультацию врача.
            </p>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/75">Разделы</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="transition-colors hover:text-[#C8913A]">Поиск по сайту</Link></li> 
              <li><Link href="/symptoms" className="transition-colors hover:text-[#C8913A]">Симптомы</Link></li>
              <li><Link href="/tests" className="transition-colors hover:text-[#C8913A]">Анализы</Link></li>
              <li><Link href="/tests/decode" className="transition-colors hover:text-[#C8913A]">Расшифровка анализов</Link></li>
              <li><Link href="/calculators" className="transition-colors hover:text-[#C8913A]">Калькуляторы</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/75">Информация</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/author" className="transition-colors hover:text-[#C8913A]">Об авторе</Link></li>
              <li><Link href="/contacts" className="transition-colors hover:text-[#C8913A]">Контакты</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-[#C8913A]">Политика конфиденциальности</Link></li>
            </ul>
          </div>
        </div>

        {/* Партнёрская строка Яндекса */}
        <div className="border-b border-white/8 py-4 text-xs text-white/35">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-white/25">Рекомендуем:</span>
            <a
              href="https://redirect.appmetrica.yandex.com/serve/678295546972129669?partner_id=831050&appmetrica_js_redirect=0&full=0&clid=14871666&banerid=1314871661"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/65"
            >
              Яндекс Браузер
            </a>
            <a
              href="https://ya.ru/search/?clid=14871659&text="
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/65"
            >
              Поиск Яндекса
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-white/45 md:flex-row">
          <span>© {new Date().getFullYear()} ЗдравИнфо. Все права защищены.</span>
          <span className="text-center md:text-right">
            Материалы носят информационный характер. Не заменяют консультацию врача.
          </span>
        </div>
      </div>
    </footer>
  )
}
