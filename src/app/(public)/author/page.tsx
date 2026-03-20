import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Об авторе — Пётр Дмитриевич | ЗдравИнфо',
  description: 'Пётр Дмитриевич — врач-стоматолог, выпускник Северного государственного медицинского университета. Автор и редактор медицинского портала ЗдравИнфо.',
  openGraph: {
    title: 'Об авторе — Пётр Дмитриевич',
    description: 'Врач-стоматолог, автор медицинского портала ЗдравИнфо.',
    type: 'profile',
  },
  other: {
    'script:ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Пётр Дмитриевич',
      jobTitle: 'Врач-стоматолог',
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'Северный государственный медицинский университет',
      },
      knowsAbout: ['Стоматология', 'Медицина', 'Здоровье'],
      worksFor: {
        '@type': 'Organization',
        name: 'ЗдравИнфо',
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://zdravinfo.ru',
      },
      description: 'Врач-стоматолог, выпускник Северного государственного медицинского университета. Автор и редактор медицинского портала ЗдравИнфо.',
    }),
  },
}

export default function AuthorPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8;
          --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --rule: #DDD5C5;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }

        .au-crumbs { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .au-crumbs-in { max-width: 860px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .au-crumbs a { color: var(--ink-60); text-decoration: none; }
        .au-crumbs a:hover { color: var(--bord); }

        .au-hero { background: white; border-bottom: 2px solid var(--ink); padding: 56px 24px 48px; }
        .au-hero-in { max-width: 860px; margin: 0 auto; display: flex; gap: 40px; align-items: flex-start; }

        .au-avatar { width: 120px; height: 120px; border-radius: 50%; background: var(--bord); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: white; flex-shrink: 0; }

        .au-hero-body { flex: 1; }
        .au-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bord); margin-bottom: 10px; }
        .au-name { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 900; color: var(--ink); line-height: 1.15; margin-bottom: 8px; }
        .au-title { font-size: 16px; color: var(--ink-60); margin-bottom: 16px; line-height: 1.5; }
        .au-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .au-tag { font-size: 12px; font-weight: 600; background: var(--bord-l); color: var(--bord); padding: 4px 12px; border-radius: 20px; }

        .au-body { max-width: 860px; margin: 0 auto; padding: 48px 24px 72px; }

        .au-section { margin-bottom: 40px; }
        .au-section-ttl { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--ink); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid var(--bord); display: flex; align-items: center; gap: 10px; }
        .au-section-ico { font-size: 20px; }

        .au-text { font-size: 15px; color: var(--ink-60); line-height: 1.8; margin-bottom: 14px; }
        .au-text:last-child { margin-bottom: 0; }

        .au-edu-item { background: white; border: 1px solid var(--rule); border-left: 3px solid var(--bord); border-radius: 2px; padding: 16px 20px; margin-bottom: 10px; }
        .au-edu-name { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
        .au-edu-spec { font-size: 13px; color: var(--ink-60); }
        .au-edu-year { font-size: 12px; color: var(--acc); font-weight: 600; margin-top: 4px; }

        .au-disclaimer { background: var(--bord-l); border: 1px solid #E8C8C0; border-radius: 2px; padding: 20px 24px; margin-top: 40px; }
        .au-disclaimer-ttl { font-size: 13px; font-weight: 700; color: var(--bord); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em; }
        .au-disclaimer-txt { font-size: 13px; color: var(--ink-60); line-height: 1.7; }

        @media (max-width: 600px) {
          .au-hero-in { flex-direction: column; gap: 24px; }
          .au-avatar { width: 88px; height: 88px; font-size: 36px; }
          .au-name { font-size: 28px; }
        }
      `}</style>

      {/* Хлебные крошки */}
      <div className="au-crumbs">
        <div className="au-crumbs-in">
          <Link href="/">Главная</Link>
          <span>›</span>
          <span>Об авторе</span>
        </div>
      </div>

      {/* Hero */}
      <div className="au-hero">
        <div className="au-hero-in">
          <div className="au-avatar">П</div>
          <div className="au-hero-body">
            <div className="au-badge">Автор и редактор портала</div>
            <h1 className="au-name">Пётр Дмитриевич</h1>
            <div className="au-title">
              Врач-стоматолог · Северный государственный медицинский университет
            </div>
            <div className="au-tags">
              <span className="au-tag">Стоматология</span>
              <span className="au-tag">Доказательная медицина</span>
              <span className="au-tag">Медицинское просвещение</span>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="au-body">

        <div className="au-section">
          <div className="au-section-ttl">
            <span className="au-section-ico">👨‍⚕️</span>
            О себе
          </div>
          <p className="au-text">
            Меня зовут Пётр Дмитриевич. Я врач-стоматолог с медицинским образованием, полученным в Северном государственном медицинском университете. Медицина — это не просто моя профессия, но и способ помогать людям разобраться в сложных вопросах здоровья.
          </p>
          <p className="au-text">
            Я создал ЗдравИнфо потому что вижу огромную потребность в достоверной медицинской информации на русском языке. Слишком много людей принимают решения о своём здоровье на основе мифов и непроверенных советов из интернета. Моя цель — дать читателям надёжную основу для понимания симптомов, анализов и заболеваний.
          </p>
          <p className="au-text">
            Все материалы портала основаны на принципах доказательной медицины и актуальных клинических рекомендациях. Я лично пишу и редактирую каждую статью, стараясь сочетать медицинскую точность с доступным языком.
          </p>
        </div>

        <div className="au-section">
          <div className="au-section-ttl">
            <span className="au-section-ico">🎓</span>
            Образование
          </div>
          <div className="au-edu-item">
            <div className="au-edu-name">Северный государственный медицинский университет</div>
            <div className="au-edu-spec">Специальность: Стоматология</div>
            <div className="au-edu-year">Высшее медицинское образование</div>
          </div>
        </div>

        <div className="au-section">
          <div className="au-section-ttl">
            <span className="au-section-ico">📋</span>
            О портале ЗдравИнфо
          </div>
          <p className="au-text">
            ЗдравИнфо — медицинский информационный портал, который я создал и веду самостоятельно. Портал включает справочник симптомов с клиническими описаниями, расшифровку анализов с нормами и причинами отклонений, медицинские калькуляторы и подробные статьи по всем основным разделам медицины.
          </p>
          <p className="au-text">
            На сайте представлено более 50 статей, 60 симптомов, 50 лабораторных показателей и 7 клинических калькуляторов — включая SCORE2, CHA₂DS₂-VASc и Child-Pugh.
          </p>
        </div>

        <div className="au-disclaimer">
          <div className="au-disclaimer-ttl">⚠️ Важное замечание</div>
          <div className="au-disclaimer-txt">
            Все материалы ЗдравИнфо носят исключительно информационный и образовательный характер. Они не заменяют консультацию врача, постановку диагноза и назначение лечения. При наличии симптомов или вопросов о здоровье обращайтесь к квалифицированному специалисту.
          </div>
        </div>

      </div>
    </>
  )
}
