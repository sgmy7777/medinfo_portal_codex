'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACTIVITY = [
  { key: 'low',    label: 'Низкая', desc: 'Менее 30 мин в день', extra: 0 },
  { key: 'medium', label: 'Средняя', desc: '30–60 мин активности', extra: 350 },
  { key: 'high',   label: 'Высокая', desc: 'Более 60 мин или спорт', extra: 700 },
]

const CLIMATE = [
  { key: 'cool',   label: '🌤 Прохладный', extra: 0 },
  { key: 'normal', label: '☀️ Умеренный', extra: 200 },
  { key: 'hot',    label: '🔥 Жаркий', extra: 500 },
]

interface Result {
  base: number
  withActivity: number
  withClimate: number
  total: number
  glasses: number
  bottles05: number
  bottles15: number
}

function calcWater(weight: number, actExtra: number, climateExtra: number): Result {
  const base = Math.round(weight * 30)
  const withActivity = base + actExtra
  const withClimate = withActivity + climateExtra
  const total = withClimate
  return {
    base,
    withActivity,
    withClimate,
    total,
    glasses: Math.round(total / 250),
    bottles05: Math.round(total / 500 * 10) / 10,
    bottles15: Math.round(total / 1500 * 10) / 10,
  }
}

export default function WaterCalculatorClient() {
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState('medium')
  const [climate, setClimate] = useState('normal')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    const w = parseFloat(weight)
    if (!w || w < 20 || w > 300) { setError('Введите вес от 20 до 300 кг'); return }
    const act = ACTIVITY.find(a => a.key === activity)!
    const cli = CLIMATE.find(c => c.key === climate)!
    setResult(calcWater(w, act.extra, cli.extra))
  }

  const fillPercent = result ? Math.min((result.total / 4000) * 100, 100) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --rule: #DDD5C5; --water: #2D6EA0; --water-l: #EBF4FD;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }
        .wt { background: var(--bord-d); }
        .wt-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .wt-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .wt-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .wt-logo span { color: var(--acc); }
        .wt-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .wt-bread-in { max-width: 800px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .wt-bread a { color: var(--ink-60); text-decoration: none; }
        .wt-bread a:hover { color: var(--bord); }
        .wt-bread-sep { color: var(--rule); }
        .wt-body { background: var(--paper); min-height: 70vh; }
        .wt-wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px 72px; }
        .wt-hdr { margin-bottom: 32px; }
        .wt-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .wt-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .wt-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }
        .wt-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .wt-card-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
        .wt-field { margin-bottom: 20px; }
        .wt-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); margin-bottom: 8px; display: block; }
        .wt-input { width: 100%; padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 16px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; transition: border-color 0.15s; }
        .wt-input:focus { border-color: var(--water); }
        .wt-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .wt-pill { padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; background: white; border: 1px solid var(--rule); border-radius: 20px; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .wt-pill.active { background: var(--water); border-color: var(--water); color: white; }
        .wt-pill:hover:not(.active) { border-color: var(--water); color: var(--water); }
        .wt-btn { width: 100%; padding: 14px; background: var(--water); color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; }
        .wt-btn:hover { background: #235A8A; }
        .wt-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .wt-result { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .wt-big { text-align: center; margin-bottom: 28px; }
        .wt-big-val { font-family: 'Playfair Display', serif; font-size: 80px; font-weight: 900; color: var(--water); line-height: 1; }
        .wt-big-unit { font-size: 28px; }
        .wt-big-lbl { font-size: 13px; color: var(--ink-30); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }

        .wt-gauge { margin: 0 auto 24px; max-width: 240px; }
        .wt-gauge-track { height: 12px; background: var(--paper); border-radius: 6px; overflow: hidden; margin-bottom: 6px; }
        .wt-gauge-fill { height: 100%; background: linear-gradient(90deg, #7EBFE8, var(--water)); border-radius: 6px; transition: width 0.6s ease; }
        .wt-gauge-lbl { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-30); }

        .wt-equiv { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; padding: 20px; background: var(--water-l); border-radius: 2px; }
        .wt-equiv-item { text-align: center; }
        .wt-equiv-ico { font-size: 24px; margin-bottom: 4px; }
        .wt-equiv-val { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--water); }
        .wt-equiv-lbl { font-size: 11px; color: var(--ink-30); }

        .wt-breakdown { border-top: 1px solid var(--rule); padding-top: 20px; }
        .wt-breakdown-ttl { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 12px; }
        .wt-br-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--rule); font-size: 14px; }
        .wt-br-row:last-child { border-bottom: none; }
        .wt-br-val { font-weight: 600; color: var(--water); }

        .wt-reset { font-size: 13px; color: var(--bord); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; margin-top: 16px; }
        .wt-tips { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 24px 28px; }
        .wt-tips-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 14px; }
        .wt-tip { display: flex; gap: 10px; margin-bottom: 12px; font-size: 14px; color: var(--ink-60); line-height: 1.6; }
        .wt-tip-ico { flex-shrink: 0; }
        .wt-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .wt-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .wt-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .wt-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .wt-ad-under-in { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .wt-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .wt-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .wt-foot-in { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .wt-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .wt-foot-logo span { color: var(--acc); }
        .wt-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .wt-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .wt-foot-lnks a:hover { color: var(--acc); }
        .wt-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
        @media (max-width: 600px) {
          .wt-wrap { padding: 28px 14px 48px; }
          .wt-ttl { font-size: 26px; }
          .wt-card { padding: 20px; }
          .wt-result { padding: 20px; }
          .wt-big-val { font-size: 60px; }
          .wt-equiv { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        }
      `}</style>

      

      <div className="wt-bread">
        <div className="wt-bread-in">
          <Link href="/">Главная</Link>
          <span className="wt-bread-sep">›</span>
          <Link href="/calculators">Калькуляторы</Link>
          <span className="wt-bread-sep">›</span>
          <span>Норма воды в день</span>
        </div>
      </div>

      <div className="wt-body">
        <div className="wt-wrap">
          <div className="wt-hdr">
            <span className="wt-ico">💧</span>
            <h1 className="wt-ttl">Норма воды в день</h1>
            <p className="wt-sub">Узнайте, сколько воды нужно пить с учётом веса, активности и климата</p>
          </div>

          {!result ? (
            <div className="wt-card">
              <div className="wt-card-ttl">Введите данные</div>
              <div className="wt-field">
                <label className="wt-label">Ваш вес (кг)</label>
                <input className="wt-input" type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div className="wt-field">
                <label className="wt-label">Уровень физической активности</label>
                <div className="wt-pills">
                  {ACTIVITY.map(a => (
                    <button key={a.key} className={`wt-pill${activity === a.key ? ' active' : ''}`} onClick={() => setActivity(a.key)}>
                      {a.label} — {a.desc}
                    </button>
                  ))}
                </div>
              </div>
              <div className="wt-field">
                <label className="wt-label">Климат / температура</label>
                <div className="wt-pills">
                  {CLIMATE.map(c => (
                    <button key={c.key} className={`wt-pill${climate === c.key ? ' active' : ''}`} onClick={() => setClimate(c.key)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="wt-btn" onClick={calculate}>Рассчитать норму воды</button>
              {error && <div className="wt-error">{error}</div>}
            </div>
          ) : (
            <div className="wt-result">
              <div className="wt-big">
                <div className="wt-big-val">{(result.total / 1000).toFixed(1)} <span className="wt-big-unit">л</span></div>
                <div className="wt-big-lbl">Суточная норма воды</div>
              </div>
              <div className="wt-gauge">
                <div className="wt-gauge-track">
                  <div className="wt-gauge-fill" style={{ width: `${fillPercent}%` }} />
                </div>
                <div className="wt-gauge-lbl"><span>0</span><span>4 л</span></div>
              </div>
              <div className="wt-equiv">
                <div className="wt-equiv-item">
                  <div className="wt-equiv-ico">🥛</div>
                  <div className="wt-equiv-val">{result.glasses}</div>
                  <div className="wt-equiv-lbl">стаканов (250 мл)</div>
                </div>
                <div className="wt-equiv-item">
                  <div className="wt-equiv-ico">🧴</div>
                  <div className="wt-equiv-val">{result.bottles05}</div>
                  <div className="wt-equiv-lbl">бутылки 0,5 л</div>
                </div>
                <div className="wt-equiv-item">
                  <div className="wt-equiv-ico">🍶</div>
                  <div className="wt-equiv-val">{result.bottles15}</div>
                  <div className="wt-equiv-lbl">бутылки 1,5 л</div>
                </div>
              </div>
              <div className="wt-breakdown">
                <div className="wt-breakdown-ttl">Из чего складывается норма</div>
                <div className="wt-br-row">
                  <span>Базовая потребность (30 мл × вес)</span>
                  <span className="wt-br-val">{result.base} мл</span>
                </div>
                <div className="wt-br-row">
                  <span>Надбавка за активность</span>
                  <span className="wt-br-val">+{result.withActivity - result.base} мл</span>
                </div>
                <div className="wt-br-row">
                  <span>Надбавка за климат</span>
                  <span className="wt-br-val">+{result.total - result.withActivity} мл</span>
                </div>
                <div className="wt-br-row" style={{ fontWeight: 700, fontSize: 15 }}>
                  <span>Итого</span>
                  <span className="wt-br-val">{result.total} мл</span>
                </div>
              </div>
              <button className="wt-reset" onClick={() => setResult(null)}>← Рассчитать заново</button>
            </div>
          )}

          <div className="wt-ad-box">
            <div className="wt-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_water_1" className="wt-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="wt-tips">
            <div className="wt-tips-ttl">Советы по гидратации</div>
            {[
              ['💧', 'Начинайте утро со стакана воды — это запускает метаболизм и восполняет ночные потери жидкости.'],
              ['⏰', 'Пейте равномерно в течение дня, а не залпом. Оптимально — стакан каждые 1–1,5 часа.'],
              ['🍵', 'Чай, кофе и другие напитки частично учитываются. Но учтите: кофе обладает мочегонным эффектом.'],
              ['🥗', 'До 20% суточной нормы воды мы получаем из еды — фрукты и овощи на 80–95% состоят из воды.'],
              ['🌡️', 'В жару и при болезни потребность в воде значительно возрастает. Не ждите жажды — пейте профилактически.'],
            ].map(([ico, txt]) => (
              <div key={String(txt)} className="wt-tip">
                <span className="wt-tip-ico">{ico}</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>

          <div className="wt-ad-box">
            <div className="wt-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_water_2" className="wt-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="wt-ad-under">
        <div className="wt-ad-under-in">
          <div className="wt-ad-label">Реклама</div>
          <div id="yandex_rtb_calc_water_under" className="wt-ad-under-slot">Реклама под калькулятором (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      
    </>
  )
}
