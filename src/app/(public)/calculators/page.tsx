import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Медицинские калькуляторы — ЗдравИнфо',
  description: 'Онлайн медицинские калькуляторы: ИМТ, идеальный вес, норма калорий, суточная норма воды, пульсовые зоны.',
}

const CALCULATORS = [
  {
    slug: 'bmi',
    icon: '⚖️',
    title: 'Индекс массы тела (ИМТ)',
    desc: 'Рассчитайте ИМТ и узнайте, соответствует ли ваш вес норме для вашего роста',
    tags: ['Ожирение', 'Похудение', 'Питание'],
    color: '#6B1F2A',
  },
  {
    slug: 'ideal-weight',
    icon: '🎯',
    title: 'Идеальный вес',
    desc: 'Вычислите идеальную массу тела по нескольким медицинским формулам',
    tags: ['Вес', 'Рост', 'Телосложение'],
    color: '#2D7A4F',
  },
  {
    slug: 'calories',
    icon: '🔥',
    title: 'Норма калорий в день',
    desc: 'Суточная потребность в калориях с учётом возраста, пола и уровня активности',
    tags: ['Питание', 'Диета', 'Энергия'],
    color: '#C8913A',
  },
  {
    slug: 'water',
    icon: '💧',
    title: 'Норма воды в день',
    desc: 'Сколько воды нужно пить в сутки с поправкой на вес и физическую активность',
    tags: ['Гидратация', 'Здоровье'],
    color: '#2D6EA0',
  },
  {
    slug: 'heart-rate',
    icon: '❤️',
    title: 'Пульсовые зоны',
    desc: 'Целевые зоны пульса для кардио, жиросжигания и улучшения выносливости',
    tags: ['Кардио', 'Тренировки', 'Сердце'],
    color: '#8B1F2A',
  },
  {
    slug: 'lab',
    icon: '🧪',
    title: 'Калькуляторы анализов',
    desc: 'СКФ (функция почек), ЛПНП по Фридевальду, индекс атерогенности, HOMA-IR',
    tags: ['СКФ', 'LDL', 'HOMA-IR', 'Почки'],
    color: '#1C3A5E',
  },
]

export default function CalculatorsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100%; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --acc-l: #FBF3E3; --rule: #DDD5C5; --white: #FFFFFF;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }

        .ca { background: var(--bord-d); }
        .ca-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .ca-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .ca-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .ca-logo span { color: var(--acc); }

        .ca-hero { background: linear-gradient(135deg, var(--bord-d) 0%, var(--bord) 100%); padding: 52px 24px; text-align: center; }
        .ca-hero-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--acc); margin-bottom: 12px; }
        .ca-hero-ttl { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; color: white; margin-bottom: 12px; }
        .ca-hero-sub { font-size: 16px; color: rgba(255,255,255,0.65); max-width: 520px; margin: 0 auto 24px; line-height: 1.6; }
        .ca-disclaimer { display: inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 2px; padding: 10px 18px; font-size: 12px; color: rgba(255,255,255,0.55); max-width: 540px; line-height: 1.6; }

        .ca-body { background: var(--paper); min-height: 60vh; }
        .ca-wrap { max-width: 900px; margin: 0 auto; padding: 52px 24px 72px; }
        .ca-sec-hdr { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; padding-bottom: 12px; border-bottom: 2px solid var(--ink); }
        .ca-sec-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; }
        .ca-sec-line { flex: 1; height: 1px; background: var(--rule); position: relative; top: -2px; }

        .ca-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ca-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 28px; text-decoration: none; display: block; transition: all 0.18s; position: relative; overflow: hidden; border-top: 3px solid var(--rule); }
        .ca-card:hover { box-shadow: 0 4px 20px rgba(107,31,42,0.1); transform: translateY(-2px); }
        .ca-card-ico { font-size: 36px; margin-bottom: 14px; display: block; }
        .ca-card-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 8px; line-height: 1.25; }
        .ca-card-desc { font-size: 13px; color: var(--ink-60); line-height: 1.6; margin-bottom: 16px; }
        .ca-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .ca-card-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; background: var(--paper); border: 1px solid var(--rule); color: var(--ink-60); border-radius: 1px; }
        .ca-card-btn { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--bord); display: inline-flex; align-items: center; gap: 6px; transition: gap 0.15s; }
        .ca-card:hover .ca-card-btn { gap: 10px; }

        .ca-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 28px 0 20px; }
        .ca-foot-in { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .ca-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .ca-foot-logo span { color: var(--acc); }
        .ca-foot-lnks { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; }
        .ca-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .ca-foot-lnks a:hover { color: var(--acc); }
        .ca-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 640px) {
          .ca-hero-ttl { font-size: 30px; }
          .ca-wrap { padding: 32px 14px 48px; }
          .ca-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      

      <div className="ca-hero">
        <div className="ca-hero-badge">Онлайн-инструменты</div>
        <h1 className="ca-hero-ttl">Медицинские калькуляторы</h1>
        <p className="ca-hero-sub">Рассчитайте ИМТ, норму калорий, воды и пульсовые зоны — быстро и без регистрации</p>
        <div className="ca-disclaimer">⚠️ Результаты носят ознакомительный характер. Проконсультируйтесь с врачом перед изменением рациона или режима тренировок.</div>
      </div>

      <div className="ca-body">
        <div className="ca-wrap">
          <div className="ca-sec-hdr">
            <h2 className="ca-sec-ttl">Все калькуляторы</h2>
            <div className="ca-sec-line" />
            <span style={{ fontSize: 12, color: 'var(--ink-30)' }}>{CALCULATORS.length} инструментов</span>
          </div>
          <div className="ca-grid">
            {CALCULATORS.map(calc => (
              <Link
                key={calc.slug}
                href={`/calculators/${calc.slug}`}
                className="ca-card"
                style={{ borderTopColor: calc.color }}
              >
                <span className="ca-card-ico">{calc.icon}</span>
                <div className="ca-card-ttl">{calc.title}</div>
                <p className="ca-card-desc">{calc.desc}</p>
                <div className="ca-card-tags">
                  {calc.tags.map(t => <span key={t} className="ca-card-tag">{t}</span>)}
                </div>
                <div className="ca-card-btn">Открыть калькулятор →</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      
    </>
  )
}
