import Link from 'next/link'

type HeaderCategory = {
  id: string
  title: string
  slug: string
  _count: {
    articles: number
  }
}

const QUICK_LINKS = [
  { href: '/symptoms', label: '🌡️ Симптомы' },
  { href: '/tests', label: '🧪 Анализы' },
  { href: '/tests/decode', label: '🔬 Расшифровка' },
  { href: '/calculators', label: '⚖️ Калькуляторы' },
]

const CATEGORY_ICONS: Record<string, string> = {
  kardiologiya: '❤️',
  nevrologiya: '🧠',
  gastroenterologiya: '🫁',
  stomatologiya: '🦷',
  dermatologiya: '🫧',
  pediatriya: '👶',
  endokrinologiya: '⚗️',
  onkologiya: '🔬',
  travmatologiya: '🦴',
  khirurgiya: '🩺',
  urologiya: '💧',
  ginekologiya: '🌸',
  oftalmologiya: '👁️',
  lor: '👂',
  psikhiatriya: '🧩',
  pulmonologiya: '💨',
  revmatologiya: '💊',
  nefrologiya: '🫘',
}

export default function UnifiedHeader({ categories }: { categories: HeaderCategory[] }) {
  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="border-b border-[#4A0F17] bg-[#4A0F17] text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-2 md:justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8913A]">
            Медицинский информационный портал
          </span>

          <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55 transition-colors hover:text-[#C8913A]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <span className="text-[11px] italic text-white/30">{today}</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] justify-center px-6 py-5">
        <Link href="/" className="text-center no-underline">
          <div className="font-[var(--font-playfair)] text-[clamp(2rem,5vw,2.875rem)] font-black leading-none tracking-[-0.04em] text-white">
            Здрав<span className="text-[#C8913A]">Инфо</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/30">
            Медицинский портал
          </div>
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="overflow-x-auto border-t border-[#4A0F17] bg-[#6B1F2A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-nowrap justify-start px-2 md:flex-wrap md:justify-center md:px-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-r border-r-white/10 border-b-transparent px-4 py-[9px] text-[11px] font-semibold uppercase tracking-[0.07em] text-white/65 transition-all hover:border-b-[#C8913A] hover:bg-black/15 hover:text-white"
              >
                {CATEGORY_ICONS[category.slug] && <span>{CATEGORY_ICONS[category.slug]}</span>}
                <span>{category.title}</span>
                {category._count.articles > 0 && (
                  <span className="text-[9px] font-normal opacity-50">{category._count.articles}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
