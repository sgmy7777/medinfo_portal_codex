import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — ЗдравИнфо',
  description: 'Политика конфиденциальности медицинского портала ЗдравИнфо',
}

async function getAllCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true },
    })
  } catch { return [] }
}

export default async function PrivacyPage() {
  const categories = await getAllCategories()
  const year = new Date().getFullYear()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8;
          --paper: #F7F2EA; --paper-d: #EDE5D8;
          --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --rule: #D8CCBA; --white: #FFFDF9;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }

        .pv-hdr { background: var(--bord-d); }
        .pv-hdr-top { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 6px 0; }
        .pv-hdr-top-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .pv-hdr-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--acc); }
        .pv-hdr-main { max-width: 1200px; margin: 0 auto; padding: 20px 24px 16px; display: flex; justify-content: center; }
        .pv-logo { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: white; letter-spacing: -2px; text-decoration: none; line-height: 1; text-align: center; display: block; }
        .pv-logo span { color: var(--acc); }
        .pv-logo-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; text-align: center; }

        .pv-cats { background: var(--bord); border-bottom: 1px solid var(--bord-d); overflow-x: auto; scrollbar-width: none; }
        .pv-cats::-webkit-scrollbar { display: none; }
        .pv-cats-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: center; flex-wrap: wrap; }
        .pv-cat-lnk { padding: 9px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(255,255,255,0.65); text-decoration: none; white-space: nowrap; transition: all 0.15s; border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 2px solid transparent; }
        .pv-cat-lnk:hover { color: white; background: rgba(0,0,0,0.15); border-bottom-color: var(--acc); }

        .pv-wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 72px; }

        .pv-bc { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-30); margin-bottom: 32px; }
        .pv-bc a { color: var(--ink-30); text-decoration: none; transition: color 0.15s; }
        .pv-bc a:hover { color: var(--bord); }
        .pv-bc-sep { color: var(--rule); }

        .pv-title { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; line-height: 1.2; color: var(--ink); margin-bottom: 8px; }
        .pv-date { font-size: 12px; color: var(--ink-30); margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid var(--rule); }

        .pv-body { font-size: 16px; line-height: 1.8; color: var(--ink-60); }
        .pv-body h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); margin: 36px 0 12px; padding-top: 8px; border-top: 1px solid var(--rule); }
        .pv-body p { margin-bottom: 16px; }
        .pv-body ul { margin: 0 0 16px 22px; }
        .pv-body li { margin-bottom: 6px; }
        .pv-body a { color: var(--bord); text-decoration: underline; text-underline-offset: 3px; }
        .pv-body strong { font-weight: 600; color: var(--ink); }

        .pv-footer { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; }
        .pv-foot-in { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        .pv-foot-logo { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: white; text-decoration: none; }
        .pv-foot-logo span { color: var(--acc); }
        .pv-foot-lnks { display: flex; gap: 16px; font-size: 12px; }
        .pv-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.15s; }
        .pv-foot-lnks a:hover { color: var(--acc); }
        .pv-foot-copy { font-size: 11px; color: rgba(255,255,255,0.45); }

        @media (max-width: 600px) {
          .pv-wrap { padding: 28px 16px 48px; }
          .pv-title { font-size: 22px; }
          .pv-logo { font-size: 26px; }
          .pv-logo-sub { display: none; }
          .pv-body { font-size: 14px; }
          .pv-body h2 { font-size: 18px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <header className="pv-hdr">
          <div className="pv-hdr-top">
            <div className="pv-hdr-top-in">
              <span className="pv-hdr-badge">Медицинский информационный портал</span>
            </div>
          </div>
          <div className="pv-hdr-main">
            <Link href="/" className="pv-logo">
              Здрав<span>Инфо</span>
              <div className="pv-logo-sub">Медицинский портал</div>
            </Link>
          </div>
        </header>

        <div className="pv-cats">
          <div className="pv-cats-in">
            {(categories as any[]).map((cat: any) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="pv-cat-lnk">
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        <main style={{ flex: 1 }}>
          <div className="pv-wrap">
            <nav className="pv-bc">
              <Link href="/">Главная</Link>
              <span className="pv-bc-sep">/</span>
              <span>Политика конфиденциальности</span>
            </nav>

            <h1 className="pv-title">Политика конфиденциальности</h1>
            <div className="pv-date">Дата последнего обновления: 1 января {year} г.</div>

            <div className="pv-body">
              <p>Настоящая Политика конфиденциальности описывает, как сайт <strong>ЗдравИнфо</strong> (далее — «Сайт») собирает, использует и защищает информацию, которую вы предоставляете при использовании Сайта.</p>

              <h2>1. Какую информацию мы собираем</h2>
              <p>Сайт может автоматически собирать следующую информацию при вашем посещении:</p>
              <ul>
                <li>IP-адрес и тип браузера</li>
                <li>Страницы, которые вы посещаете, и время посещения</li>
                <li>Поисковые запросы, по которым вы нашли Сайт</li>
                <li>Технические характеристики устройства (тип ОС, разрешение экрана)</li>
              </ul>
              <p>Мы не собираем и не храним персональные данные (имя, email, телефон) без вашего явного согласия.</p>

              <h2>2. Файлы cookie</h2>
              <p>Сайт использует файлы cookie для улучшения работы и анализа посещаемости. Cookie — это небольшие текстовые файлы, которые сохраняются в вашем браузере.</p>
              <p>Мы используем следующие типы cookie:</p>
              <ul>
                <li><strong>Технические cookie</strong> — необходимы для корректной работы Сайта</li>
                <li><strong>Аналитические cookie</strong> — Яндекс.Метрика для анализа посещаемости</li>
                <li><strong>Рекламные cookie</strong> — Яндекс РСЯ для показа релевантной рекламы</li>
              </ul>
              <p>Вы можете отключить cookie в настройках браузера, однако это может повлиять на работу некоторых функций Сайта.</p>

              <h2>3. Яндекс РСЯ и рекламные технологии</h2>
              <p>На Сайте используется рекламная сеть Яндекса (РСЯ). Яндекс может использовать cookie и аналогичные технологии для показа персонализированной рекламы на основе ваших интересов и истории просмотров.</p>
              <p>Для управления рекламными предпочтениями посетите <a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer">страницу настроек Яндекса</a>. Подробнее об использовании данных Яндексом читайте в <a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer">Политике конфиденциальности Яндекса</a>.</p>

              <h2>4. Яндекс.Метрика</h2>
              <p>Сайт использует сервис веб-аналитики Яндекс.Метрика для сбора обезличенной статистики посещений. Яндекс.Метрика собирает данные об использовании Сайта (просмотренные страницы, время на сайте, источники трафика) в агрегированном виде, не позволяющем идентифицировать конкретного пользователя.</p>

              <h2>5. Медицинская информация</h2>
              <p>Все материалы, опубликованные на Сайте, носят исключительно <strong>информационный и образовательный характер</strong>. Они не являются медицинской консультацией, диагнозом или рекомендацией к лечению.</p>
              <p>Перед принятием любых решений, касающихся вашего здоровья, обязательно проконсультируйтесь с квалифицированным врачом.</p>

              <h2>6. Передача данных третьим лицам</h2>
              <p>Мы не продаём, не обмениваем и не передаём ваши персональные данные третьим лицам, за исключением:</p>
              <ul>
                <li>Случаев, предусмотренных законодательством Российской Федерации</li>
                <li>Партнёров по обработке данных (Яндекс), действующих в рамках своих политик конфиденциальности</li>
              </ul>

              <h2>7. Защита информации</h2>
              <p>Мы применяем разумные технические и организационные меры для защиты информации от несанкционированного доступа, изменения, раскрытия или уничтожения. Соединение с Сайтом защищено протоколом HTTPS.</p>

              <h2>8. Права пользователей</h2>
              <p>В соответствии с законодательством РФ вы имеете право:</p>
              <ul>
                <li>Запросить информацию о том, какие данные о вас обрабатываются</li>
                <li>Потребовать удаления или исправления своих данных</li>
                <li>Отозвать согласие на обработку данных</li>
              </ul>

              <h2>9. Ссылки на сторонние сайты</h2>
              <p>Сайт может содержать ссылки на внешние ресурсы. Мы не несём ответственности за политику конфиденциальности и содержимое сторонних сайтов.</p>

              <h2>10. Изменения политики</h2>
              <p>Мы оставляем за собой право обновлять настоящую Политику. Актуальная версия всегда доступна на этой странице. Продолжение использования Сайта после внесения изменений означает ваше согласие с обновлённой Политикой.</p>

              <h2>11. Контакты</h2>
              <p>По вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам по электронной почте, указанной в разделе «Контакты» на главной странице Сайта.</p>
            </div>
          </div>
        </main>

        <footer className="pv-footer">
          <div className="pv-foot-in">
            <Link href="/" className="pv-foot-logo">Здрав<span>Инфо</span></Link>
            <div className="pv-foot-lnks">
              <Link href="/">Главная</Link>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/contacts">Контакты</Link>
            </div>
            <div className="pv-foot-copy">© {year} ЗдравИнфо. Все материалы носят информационный характер.</div>
          </div>
        </footer>

      </div>
    </>
  )
}
