import { UnifiedHeader } from '@/components/public/UnifiedHeader'
'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACTIVITY_LEVELS = [
  { key: 'sedentary',  label: 'Малоподвижный', desc: 'Офисная работа, почти нет тренировок', factor: 1.2 },
  { key: 'light',     label: 'Лёгкая активность', desc: '1–2 тренировки в неделю', factor: 1.375 },
  { key: 'moderate',  label: 'Умеренная активность', desc: '3–5 тренировок в неделю', factor: 1.55 },
  { key: 'active',    label: 'Высокая активность', desc: '6–7 тренировок в неделю', factor: 1.725 },
  { key: 'extreme',   label: 'Очень высокая', desc: 'Тяжёлый труд + ежедневные тренировки', factor: 1.9 },
]

const GOALS = [
  { key: 'lose2',   label: 'Сильное похудение', delta: -1000, color: '#1E40AF', note: 'Дефицит 1000 ккал — только под контролем врача' },
  { key: 'lose1',   label: 'Умеренное похудение', delta: -500, color: '#2563EB', note: 'Комфортный темп: −0,5 кг в неделю' },
  { key: 'maintain', label: 'Поддержание веса', delta: 0, color: '#16A34A', note: 'Оптимально для здоровья' },
  { key: 'gain1',   label: 'Набор массы', delta: +500, color: '#C8913A', note: 'Медленный качественный набор' },
]

interface Result {
  bmr: number
  tdee: number
  goals: { key: string; label: string; kcal: number; color: string; note: string }[]
}

function calc(weight: number, height: number, age: number, sex: 'male' | 'female', activityFactor: number): Result {
  // Mifflin-St Jeor
  const bmr = sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = Math.round(bmr * activityFactor)

  const goals = GOALS.map(g => ({ ...g, kcal: Math.max(1200, tdee + g.delta) }))

  return { bmr: Math.round(bmr), tdee, goals }
}

export default function CaloriesCalculator() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [activity, setActivity] = useState('moderate')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age)
    if (!w || !h || !a) { setError('Заполните все поля'); return }
    if (w < 30 || w > 300) { setError('Вес: 30–300 кг'); return }
    if (h < 100 || h > 250) { setError('Рост: 100–250 см'); return }
    if (a < 14 || a > 100) { setError('Возраст: 14–100 лет'); return }
    const actLevel = ACTIVITY_LEVELS.find(l => l.key === activity)!
    setResult(calc(w, h, a, sex, actLevel.factor))
  }

  const maxKcal = result ? Math.max(...result.goals.map(g => g.kcal)) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --rule: #DDD5C5; --white: #FFFFFF;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }
        .cl { background: var(--bord-d); }
        .cl-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .cl-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .cl-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .cl-logo span { color: var(--acc); }
        .cl-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .cl-bread-in { max-width: 800px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .cl-bread a { color: var(--ink-60); text-decoration: none; }
        .cl-bread a:hover { color: var(--bord); }
        .cl-bread-sep { color: var(--rule); }
        .cl-body { background: var(--paper); min-height: 70vh; }
        .cl-wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px 72px; }
        .cl-hdr { margin-bottom: 32px; }
        .cl-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .cl-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .cl-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }
        .cl-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .cl-card-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
        .cl-sex { display: flex; gap: 0; margin-bottom: 20px; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
        .cl-sex-btn { flex: 1; padding: 11px; font-size: 14px; font-weight: 600; text-align: center; cursor: pointer; background: white; border: none; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .cl-sex-btn.active { background: var(--bord); color: white; }
        .cl-sex-btn:hover:not(.active) { background: var(--bord-l); color: var(--bord); }
        .cl-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .cl-field { display: flex; flex-direction: column; gap: 6px; }
        .cl-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); }
        .cl-input { padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 16px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; transition: border-color 0.15s; }
        .cl-input:focus { border-color: var(--bord); }
        .cl-act-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); margin-bottom: 8px; display: block; }
        .cl-act-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .cl-act-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; cursor: pointer; transition: all 0.15s; background: white; }
        .cl-act-item.active { border-color: var(--bord); background: var(--bord-l); }
        .cl-act-item:hover:not(.active) { background: var(--paper); border-color: var(--ink-30); }
        .cl-act-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--rule); flex-shrink: 0; transition: all 0.15s; }
        .cl-act-item.active .cl-act-radio { border-color: var(--bord); background: var(--bord); }
        .cl-act-name { font-size: 14px; font-weight: 600; color: var(--ink); }
        .cl-act-desc { font-size: 12px; color: var(--ink-30); }
        .cl-btn { width: 100%; padding: 14px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; }
        .cl-btn:hover { background: var(--bord-m); }
        .cl-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .cl-result { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .cl-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--rule); }
        .cl-stat { background: var(--paper); border-radius: 2px; padding: 16px; text-align: center; }
        .cl-stat-val { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--bord); line-height: 1; }
        .cl-stat-lbl { font-size: 11px; color: var(--ink-30); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
        .cl-stat-sub { font-size: 12px; color: var(--ink-60); margin-top: 4px; }
        .cl-goals-ttl { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 14px; }
        .cl-goal { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--rule); }
        .cl-goal:last-child { border-bottom: none; }
        .cl-goal-info { flex: 1; min-width: 0; }
        .cl-goal-name { font-size: 14px; font-weight: 600; color: var(--ink); }
        .cl-goal-note { font-size: 12px; color: var(--ink-30); margin-top: 2px; }
        .cl-goal-bar-wrap { width: 120px; height: 6px; background: var(--paper); border-radius: 3px; overflow: hidden; flex-shrink: 0; }
        .cl-goal-bar { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .cl-goal-val { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; flex-shrink: 0; min-width: 70px; text-align: right; }
        .cl-goal-unit { font-size: 11px; color: var(--ink-30); font-weight: 400; }
        .cl-reset { font-size: 13px; color: var(--bord); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; margin-top: 16px; }
        .cl-info { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 24px 28px; }
        .cl-info-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 14px; }
        .cl-info-p { font-size: 14px; color: var(--ink-60); line-height: 1.7; margin-bottom: 10px; }
        .cl-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .cl-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .cl-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .cl-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .cl-ad-under-in { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .cl-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .cl-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .cl-foot-in { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .cl-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .cl-foot-logo span { color: var(--acc); }
        .cl-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .cl-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .cl-foot-lnks a:hover { color: var(--acc); }
        .cl-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
        @media (max-width: 600px) {
          .cl-wrap { padding: 28px 14px 48px; }
          .cl-ttl { font-size: 26px; }
          .cl-row { grid-template-columns: 1fr; }
          .cl-card { padding: 20px; }
          .cl-result { padding: 20px; }
          .cl-stats { grid-template-columns: 1fr; }
          .cl-goal-bar-wrap { display: none; }
        }
      `}</style>

      <UnifiedHeader />

      <div className="cl-bread">
        <div className="cl-bread-in">
          <Link href="/">Главная</Link>
          <span className="cl-bread-sep">›</span>
          <Link href="/calculators">Калькуляторы</Link>
          <span className="cl-bread-sep">›</span>
          <span>Норма калорий в день</span>
        </div>
      </div>

      <div className="cl-body">
        <div className="cl-wrap">
          <div className="cl-hdr">
            <span className="cl-ico">🔥</span>
            <h1 className="cl-ttl">Норма калорий в день</h1>
            <p className="cl-sub">Рассчитайте суточную потребность по формуле Миффлина–Сан-Жеора с учётом активности</p>
          </div>

          {!result ? (
            <div className="cl-card">
              <div className="cl-card-ttl">Введите данные</div>
              <div className="cl-sex">
                <button className={`cl-sex-btn${sex === 'male' ? ' active' : ''}`} onClick={() => setSex('male')}>👨 Мужской</button>
                <button className={`cl-sex-btn${sex === 'female' ? ' active' : ''}`} onClick={() => setSex('female')}>👩 Женский</button>
              </div>
              <div className="cl-row">
                <div className="cl-field">
                  <label className="cl-label">Вес (кг)</label>
                  <input className="cl-input" type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
                <div className="cl-field">
                  <label className="cl-label">Рост (см)</label>
                  <input className="cl-input" type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} />
                </div>
                <div className="cl-field">
                  <label className="cl-label">Возраст</label>
                  <input className="cl-input" type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} />
                </div>
              </div>
              <label className="cl-act-label">Уровень активности</label>
              <div className="cl-act-grid">
                {ACTIVITY_LEVELS.map(l => (
                  <div
                    key={l.key}
                    className={`cl-act-item${activity === l.key ? ' active' : ''}`}
                    onClick={() => setActivity(l.key)}
                  >
                    <div className="cl-act-radio" />
                    <div>
                      <div className="cl-act-name">{l.label}</div>
                      <div className="cl-act-desc">{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="cl-btn" onClick={calculate}>Рассчитать</button>
              {error && <div className="cl-error">{error}</div>}
            </div>
          ) : (
            <div className="cl-result">
              <div className="cl-stats">
                <div className="cl-stat">
                  <div className="cl-stat-val">{result.bmr}</div>
                  <div className="cl-stat-lbl">Базальный обмен (BMR)</div>
                  <div className="cl-stat-sub">Калории в покое</div>
                </div>
                <div className="cl-stat">
                  <div className="cl-stat-val">{result.tdee}</div>
                  <div className="cl-stat-lbl">Суточная норма (TDEE)</div>
                  <div className="cl-stat-sub">С учётом активности</div>
                </div>
              </div>
              <div className="cl-goals-ttl">Калории по целям</div>
              {result.goals.map(g => (
                <div key={g.key} className="cl-goal">
                  <div className="cl-goal-info">
                    <div className="cl-goal-name">{g.label}</div>
                    <div className="cl-goal-note">{g.note}</div>
                  </div>
                  <div className="cl-goal-bar-wrap">
                    <div className="cl-goal-bar" style={{ width: `${(g.kcal / maxKcal) * 100}%`, background: g.color }} />
                  </div>
                  <div className="cl-goal-val" style={{ color: g.color }}>
                    {g.kcal} <span className="cl-goal-unit">ккал</span>
                  </div>
                </div>
              ))}
              <button className="cl-reset" onClick={() => setResult(null)}>← Рассчитать заново</button>
            </div>
          )}


          <div className="cl-ad-box">
            <div className="cl-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_calories_1" className="cl-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="cl-info">
            <div className="cl-info-ttl">О формуле Миффлина–Сан-Жеора</div>
            <p className="cl-info-p">Формула разработана в 1990 году и признана наиболее точной для расчёта базального метаболизма у большинства людей. BMR — это количество калорий, необходимых для поддержания жизнедеятельности в состоянии полного покоя.</p>
            <p className="cl-info-p">TDEE (Total Daily Energy Expenditure) — суточная норма с учётом физической активности. Умножение BMR на коэффициент активности даёт оценку реальных энергозатрат.</p>
            <p className="cl-info-p" style={{ marginBottom: 0 }}>Безопасный дефицит для похудения — 300–500 ккал от TDEE. Не рекомендуется снижать потребление ниже 1200 ккал (женщины) и 1500 ккал (мужчины) без наблюдения врача.</p>
          </div>

          <div className="cl-ad-box">
            <div className="cl-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_calories_2" className="cl-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="cl-ad-under">
        <div className="cl-ad-under-in">
          <div className="cl-ad-label">Реклама</div>
          <div id="yandex_rtb_calc_calories_under" className="cl-ad-under-slot">Реклама под калькулятором (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      <footer className="cl-foot">
        <div className="cl-foot-in">
          <Link href="/" className="cl-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="cl-foot-lnks">
            <Link href="/calculators">Калькуляторы</Link>
            <Link href="/calculators/bmi">ИМТ</Link>
            <Link href="/calculators/water">Норма воды</Link>
          </div>
          <div className="cl-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Информация носит образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
