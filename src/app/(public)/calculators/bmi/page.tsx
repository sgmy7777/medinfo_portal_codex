import { UnifiedHeader } from '@/components/public/UnifiedHeader'
'use client'

import { useState } from 'react'
import Link from 'next/link'

type Unit = 'metric' | 'imperial'

interface Result {
  bmi: number
  category: string
  color: string
  bg: string
  advice: string
  healthyMin: number
  healthyMax: number
}

function calcBMI(weight: number, height: number): Result {
  const bmi = weight / ((height / 100) ** 2)
  const rounded = Math.round(bmi * 10) / 10

  if (bmi < 16)    return { bmi: rounded, category: 'Выраженный дефицит массы', color: '#1E40AF', bg: '#EFF6FF', advice: 'Выраженный дефицит массы тела требует медицинской консультации. Обратитесь к терапевту или диетологу.', healthyMin: 0, healthyMax: 0 }
  if (bmi < 18.5)  return { bmi: rounded, category: 'Дефицит массы тела', color: '#2563EB', bg: '#DBEAFE', advice: 'Рекомендуется проконсультироваться с врачом или диетологом для разработки плана питания.', healthyMin: 0, healthyMax: 0 }
  if (bmi < 25)    return { bmi: rounded, category: 'Норма', color: '#16A34A', bg: '#F0FDF4', advice: 'Отличный результат! Поддерживайте вес с помощью сбалансированного питания и регулярной активности.', healthyMin: 0, healthyMax: 0 }
  if (bmi < 30)    return { bmi: rounded, category: 'Избыточная масса тела', color: '#D97706', bg: '#FFFBEB', advice: 'Рекомендуется скорректировать питание и повысить физическую активность. Проконсультируйтесь с врачом.', healthyMin: 0, healthyMax: 0 }
  if (bmi < 35)    return { bmi: rounded, category: 'Ожирение I степени', color: '#EA580C', bg: '#FFF7ED', advice: 'Рекомендуется обратиться к терапевту для оценки рисков и разработки плана снижения веса.', healthyMin: 0, healthyMax: 0 }
  if (bmi < 40)    return { bmi: rounded, category: 'Ожирение II степени', color: '#DC2626', bg: '#FFF1F2', advice: 'Необходима консультация врача. Ожирение II степени сопряжено с серьёзными рисками для здоровья.', healthyMin: 0, healthyMax: 0 }
  return { bmi: rounded, category: 'Ожирение III степени', color: '#9B1C1C', bg: '#FFF1F2', advice: 'Требуется обязательная медицинская консультация. Ожирение III степени значительно повышает риск заболеваний.', healthyMin: 0, healthyMax: 0 }
}

const SCALE = [
  { label: 'Дефицит', max: 18.5, color: '#2563EB' },
  { label: 'Норма', max: 25, color: '#16A34A' },
  { label: 'Избыток', max: 30, color: '#D97706' },
  { label: 'Ожирение I', max: 35, color: '#EA580C' },
  { label: 'Ожирение II', max: 40, color: '#DC2626' },
  { label: 'Ожирение III', max: 50, color: '#9B1C1C' },
]

export default function BMICalculator() {
  const [unit, setUnit] = useState<Unit>('metric')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weightLbs, setWeightLbs] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    let w = 0, h = 0
    if (unit === 'metric') {
      w = parseFloat(weight)
      h = parseFloat(height)
    } else {
      w = parseFloat(weightLbs) * 0.453592
      const ft = parseFloat(heightFt) || 0
      const inch = parseFloat(heightIn) || 0
      h = (ft * 12 + inch) * 2.54
    }
    if (!w || !h || w <= 0 || h <= 0) { setError('Введите корректные значения роста и веса'); return }
    if (h < 50 || h > 280) { setError('Рост должен быть от 50 до 280 см'); return }
    if (w < 10 || w > 500) { setError('Вес должен быть от 10 до 500 кг'); return }
    setResult(calcBMI(w, h))
  }

  function reset() { setResult(null); setWeight(''); setHeight(''); setHeightFt(''); setHeightIn(''); setWeightLbs(''); setError('') }

  // Needle position on scale (16–50 range)
  const needlePos = result ? Math.min(Math.max((result.bmi - 16) / (50 - 16) * 100, 0), 100) : null

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

        .bm { background: var(--bord-d); }
        .bm-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .bm-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .bm-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .bm-logo span { color: var(--acc); }

        .bm-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .bm-bread-in { max-width: 800px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .bm-bread a { color: var(--ink-60); text-decoration: none; }
        .bm-bread a:hover { color: var(--bord); }
        .bm-bread-sep { color: var(--rule); }

        .bm-body { background: var(--paper); min-height: 70vh; }
        .bm-wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px 72px; }

        .bm-hdr { margin-bottom: 32px; }
        .bm-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .bm-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .bm-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }

        .bm-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .bm-card-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }

        .bm-tabs { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
        .bm-tab { flex: 1; padding: 10px; font-size: 13px; font-weight: 600; text-align: center; cursor: pointer; background: white; border: none; color: var(--ink-60); transition: all 0.15s; }
        .bm-tab.active { background: var(--bord); color: white; }
        .bm-tab:hover:not(.active) { background: var(--bord-l); color: var(--bord); }

        .bm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .bm-field { display: flex; flex-direction: column; gap: 6px; }
        .bm-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); }
        .bm-input { padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 16px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); transition: border-color 0.15s; outline: none; }
        .bm-input:focus { border-color: var(--bord); }
        .bm-unit { font-size: 12px; color: var(--ink-30); margin-top: 2px; }

        .bm-btn { width: 100%; padding: 14px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; }
        .bm-btn:hover { background: var(--bord-m); }
        .bm-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .bm-result { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .bm-result-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .bm-bmi-val { font-family: 'Playfair Display', serif; font-size: 72px; font-weight: 900; line-height: 1; }
        .bm-bmi-lbl { font-size: 12px; color: var(--ink-30); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
        .bm-cat-badge { font-size: 14px; font-weight: 700; padding: 8px 18px; border-radius: 2px; text-align: center; }
        .bm-advice { font-size: 14px; color: var(--ink-60); line-height: 1.65; padding: 14px 18px; background: var(--paper); border-radius: 2px; margin-bottom: 24px; }

        .bm-scale { margin-bottom: 20px; }
        .bm-scale-bar { display: flex; height: 10px; border-radius: 2px; overflow: hidden; margin-bottom: 8px; position: relative; }
        .bm-scale-seg { flex: 1; }
        .bm-scale-needle { position: absolute; top: -4px; width: 3px; height: 18px; background: var(--ink); border-radius: 1px; transform: translateX(-50%); transition: left 0.4s ease; }
        .bm-scale-labels { display: flex; }
        .bm-scale-lbl { flex: 1; font-size: 9px; color: var(--ink-30); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .bm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .bm-table th { text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-30); background: var(--paper); border-bottom: 1px solid var(--rule); }
        .bm-table td { padding: 10px 12px; border-bottom: 1px solid var(--rule); color: var(--ink-60); }
        .bm-table tr:last-child td { border-bottom: none; }
        .bm-table tr.current td { background: var(--bord-l); color: var(--bord); font-weight: 600; }

        .bm-reset { font-size: 13px; color: var(--bord); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; margin-top: 16px; }

        .bm-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .bm-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .bm-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .bm-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .bm-ad-under-in { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .bm-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .bm-info { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 24px 28px; }
        .bm-info-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 14px; }
        .bm-info-p { font-size: 14px; color: var(--ink-60); line-height: 1.7; margin-bottom: 10px; }

        .bm-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .bm-foot-in { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .bm-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .bm-foot-logo span { color: var(--acc); }
        .bm-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .bm-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .bm-foot-lnks a:hover { color: var(--acc); }
        .bm-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 600px) {
          .bm-wrap { padding: 28px 14px 48px; }
          .bm-ttl { font-size: 26px; }
          .bm-row { grid-template-columns: 1fr; }
          .bm-card { padding: 20px; }
          .bm-result { padding: 20px; }
          .bm-bmi-val { font-size: 56px; }
        }
      `}</style>

      <UnifiedHeader />

      <div className="bm-bread">
        <div className="bm-bread-in">
          <Link href="/">Главная</Link>
          <span className="bm-bread-sep">›</span>
          <Link href="/calculators">Калькуляторы</Link>
          <span className="bm-bread-sep">›</span>
          <span>Индекс массы тела (ИМТ)</span>
        </div>
      </div>

      <div className="bm-body">
        <div className="bm-wrap">

          <div className="bm-hdr">
            <span className="bm-ico">⚖️</span>
            <h1 className="bm-ttl">Индекс массы тела (ИМТ)</h1>
            <p className="bm-sub">Рассчитайте ИМТ по формуле ВОЗ и узнайте, соответствует ли ваш вес норме</p>
          </div>

          {!result ? (
            <div className="bm-card">
              <div className="bm-card-ttl">Введите данные</div>

              <div className="bm-tabs">
                <button className={`bm-tab${unit === 'metric' ? ' active' : ''}`} onClick={() => setUnit('metric')}>Метрическая (кг / см)</button>
                <button className={`bm-tab${unit === 'imperial' ? ' active' : ''}`} onClick={() => setUnit('imperial')}>Имперская (lbs / ft)</button>
              </div>

              {unit === 'metric' ? (
                <div className="bm-row">
                  <div className="bm-field">
                    <label className="bm-label">Вес</label>
                    <input className="bm-input" type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} min="10" max="500" />
                    <span className="bm-unit">килограммы (кг)</span>
                  </div>
                  <div className="bm-field">
                    <label className="bm-label">Рост</label>
                    <input className="bm-input" type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} min="50" max="280" />
                    <span className="bm-unit">сантиметры (см)</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bm-row">
                    <div className="bm-field">
                      <label className="bm-label">Вес (фунты)</label>
                      <input className="bm-input" type="number" placeholder="154" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} />
                      <span className="bm-unit">lbs</span>
                    </div>
                    <div className="bm-field">
                      <label className="bm-label">Рост (футы)</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input className="bm-input" type="number" placeholder="5" value={heightFt} onChange={e => setHeightFt(e.target.value)} style={{ flex: 1 }} />
                        <input className="bm-input" type="number" placeholder="9" value={heightIn} onChange={e => setHeightIn(e.target.value)} style={{ flex: 1 }} />
                      </div>
                      <span className="bm-unit">ft &nbsp; in</span>
                    </div>
                  </div>
                </>
              )}

              <button className="bm-btn" onClick={calculate}>Рассчитать ИМТ</button>
              {error && <div className="bm-error">{error}</div>}
            </div>
          ) : (
            <div className="bm-result">
              <div className="bm-result-top">
                <div>
                  <div className="bm-bmi-val" style={{ color: result.color }}>{result.bmi}</div>
                  <div className="bm-bmi-lbl">Индекс массы тела</div>
                </div>
                <div className="bm-cat-badge" style={{ background: result.bg, color: result.color }}>{result.category}</div>
              </div>

              <div className="bm-advice">{result.advice}</div>

              {/* Scale */}
              <div className="bm-scale">
                <div className="bm-scale-bar">
                  {SCALE.map(s => <div key={s.label} className="bm-scale-seg" style={{ background: s.color }} />)}
                  {needlePos !== null && <div className="bm-scale-needle" style={{ left: `${needlePos}%` }} />}
                </div>
                <div className="bm-scale-labels">
                  {SCALE.map(s => <div key={s.label} className="bm-scale-lbl">{s.label}</div>)}
                </div>
              </div>

              {/* Table */}
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>Категория</th>
                    <th>ИМТ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: 'Выраженный дефицит', range: '< 16' },
                    { cat: 'Дефицит массы', range: '16 – 18,4' },
                    { cat: 'Норма', range: '18,5 – 24,9' },
                    { cat: 'Избыточная масса', range: '25 – 29,9' },
                    { cat: 'Ожирение I', range: '30 – 34,9' },
                    { cat: 'Ожирение II', range: '35 – 39,9' },
                    { cat: 'Ожирение III', range: '≥ 40' },
                  ].map(row => {
                    const isCurrent = row.cat === result.category || result.category.startsWith(row.cat.replace('Ожирение', 'Ожирение'))
                    return (
                      <tr key={row.cat} className={isCurrent ? 'current' : ''}>
                        <td>{row.cat}</td>
                        <td>{row.range}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <button className="bm-reset" onClick={reset}>← Рассчитать заново</button>
            </div>
          )}

          <div className="bm-ad-box">
            <div className="bm-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_bmi_1" className="bm-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="bm-info">
            <div className="bm-info-ttl">Что такое ИМТ?</div>
            <p className="bm-info-p">Индекс массы тела (ИМТ) — показатель, рекомендованный ВОЗ для оценки соответствия веса росту. Рассчитывается по формуле: <strong>ИМТ = вес (кг) / рост² (м)</strong>.</p>
            <p className="bm-info-p">ИМТ имеет ограничения: не учитывает соотношение мышечной и жировой массы, возраст, этническую принадлежность и тип телосложения. Спортсмены с большой мышечной массой могут иметь высокий ИМТ при нормальном уровне жира.</p>
            <p className="bm-info-p" style={{ marginBottom: 0 }}>Для более точной оценки состава тела используйте дополнительные методы: измерение окружности талии, биоимпедансный анализ или консультацию с врачом.</p>
          </div>

          <div style={{ marginTop: 24 }} className="bm-ad-box">
            <div className="bm-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_bmi_2" className="bm-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="bm-ad-under">
        <div className="bm-ad-under-in">
          <div className="bm-ad-label">Реклама</div>
          <div id="yandex_rtb_calc_bmi_under" className="bm-ad-under-slot">Реклама под калькулятором (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      <footer className="bm-foot">
        <div className="bm-foot-in">
          <Link href="/" className="bm-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="bm-foot-lnks">
            <Link href="/calculators">Калькуляторы</Link>
            <Link href="/calculators/ideal-weight">Идеальный вес</Link>
            <Link href="/calculators/calories">Норма калорий</Link>
            <Link href="/symptoms">Симптомы</Link>
          </div>
          <div className="bm-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Информация носит образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
