import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zdravinfo.ru'

export default function Breadcrumbs({ items }: Props) {
  const allItems = [{ label: 'Главная', href: '/' }, ...items]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <style>{`
        .bc-nav ol { display:flex; flex-wrap:wrap; align-items:center; gap:0 4px; list-style:none; margin:0; padding:0; font-size:12px; color:#9A8A78; }
        .bc-nav li { display:flex; align-items:center; gap:4px; }
        .bc-nav a { color:#9A8A78; text-decoration:none; }
        .bc-nav a:hover { color:#6B1F2A; }
        .bc-nav .bc-sep { color:#C8C0B0; user-select:none; }
        .bc-nav .bc-cur { color:#5A4A38; font-weight:500; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; vertical-align:middle; }
      `}</style>
      <nav aria-label="Breadcrumb" className="bc-nav">
        <ol>
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1
            return (
              <li key={i}>
                {i > 0 && <span className="bc-sep">›</span>}
                {item.href && !isLast
                  ? <Link href={item.href}>{item.label}</Link>
                  : <span className="bc-cur" aria-current={isLast ? 'page' : undefined}>{item.label}</span>
                }
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
