import { UnifiedHeader } from '@/components/public/UnifiedHeader'
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Result {
  broca: number
  devine: number
  robinson: number
  miller: number
  lorentz: number
  avg: number
  range: [number, number]
}

function calcIdealWeight(height: number, sex: 'male' | 'female'): Result {
  const h = height
  const hIn = height / 2.54

  // Broca (1871, метрическая)
  const broca = sex === 'male' ? h - 100 - (h - 100) * 0.1 : h - 100 - (h - 100) * 0.15

  // Devine (1974)
  const devineBase = sex === 'male' ? 50 : 45.5
  const devine = devineBase + 2.3 * (hIn - 60)

  // Robinson (1983)
  const robBase = sex === 'male' ? 52 : 49
  const robK = sex === 'male' ? 1.9 : 1.7
  const robinson = robBase + robK * (hIn - 60)

  // Miller (1983)
  const milBase = sex === 'male' ? 56.2 : 53.1
  const milK = sex === 'male' ? 1.41 : 1.36
  const miller = milBase + milK * (hIn - 60)

  // Лоренц (простая, для женщин — мужская с коэф.)
  const lorentz = sex === 'male'
    ? h - 100 - (h - 150) / 4
    : h - 100 - (h - 150) / 2.5

  const vals = [broca, devine, robinson, miller, lorentz].map(v => Math.round(v * 10) / 10)
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
  const min = Math.round(Math.min(...vals) * 10) / 10
  const max = Math.round(Math.max(...vals) * 10) / 10

  return { broca: vals[0], devine: vals[1], robinson: vals[2], miller: vals[3], lorentz: vals[4], avg, range: [min, max] }
}

export default function IdealWeightCalculator() {
  const [height, setHeight] = useState('')
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    const h = parseFloat(height)
    if (!h || h < 100 || h > 230) { setError('Введите рост от 100 до 230 см'); return }
    setResult(calcIdealWeight(h, sex))
  }

  const FORMULAS = result ? [
    { name: 'Броки (1871)', value: result.broca, desc: 'Классическая европейская формула' },
    { name: 'Дивайна (1974)', value: result.devine, desc: 'Широко используется в медицине' },
    { name: 'Робинсона (1983)', value: result.robinson, desc: 'Уточнённая версия Дивайна' },
    { name: 'Миллера (1983)', value: result.miller, desc: 'Даёт несколько меньший результат' },
    { name: 'Лоренца', value: result.lorentz, desc: 'Учитывает конституцию тела' },
  ] : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bord: #6B1F2A; --bord-d: #4A0F17; --bord-l: #F5EBE8; --bord-m: #8B2D3A;
          --paper: #F7F2EA; --paper-d: #EDE5D8; --ink: #1C1208; --ink-60: #5A4A38; --ink-30: #9A8A78;
          --acc: #C8913A; --rule: #DDD5C5; --white: #FFFFFF; --green: #16A34A;
        }
        body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }
        .iw { background: var(--bord-d); }
        .iw-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .iw-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .iw-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .iw-logo span { color: var(--acc); }
        .iw-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .iw-bread-in { max-width: 800px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .iw-bread a { color: var(--ink-60); text-decoration: none; }
        .iw-bread a:hover { color: var(--bord); }
        .iw-bread-sep { color: var(--rule); }
        .iw-body { background: var(--paper); min-height: 70vh; }
        .iw-wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px 72px; }
        .iw-hdr { margin-bottom: 32px; }
        .iw-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .iw-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .iw-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }
        .iw-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .iw-card-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
        .iw-sex { display: flex; gap: 0; margin-bottom: 20px; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
        .iw-sex-btn { flex: 1; padding: 11px; font-size: 14px; font-weight: 600; text-align: center; cursor: pointer; background: white; border: none; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .iw-sex-btn.active { background: var(--bord); color: white; }
        .iw-sex-btn:hover:not(.active) { background: var(--bord-l); color: var(--bord); }
        .iw-field { margin-bottom: 20px; }
        .iw-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); margin-bottom: 6px; display: block; }
        .iw-input { width: 100%; padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 16px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; transition: border-color 0.15s; }
        .iw-input:focus { border-color: var(--bord); }
        .iw-btn { width: 100%; padding: 14px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; }
        .iw-btn:hover { background: var(--bord-m); }
        .iw-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .iw-result { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .iw-avg { text-align: center; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--rule); }
        .iw-avg-val { font-family: 'Playfair Display', serif; font-size: 72px; font-weight: 900; color: var(--green); line-height: 1; }
        .iw-avg-lbl { font-size: 13px; color: var(--ink-30); margin-top: 4px; }
        .iw-range-txt { font-size: 14px; color: var(--ink-60); margin-top: 8px; }
        .iw-formulas-ttl { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 14px; }
        .iw-formula-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rule); gap: 16px; }
        .iw-formula-row:last-child { border-bottom: none; }
        .iw-formula-name { flex: 1; }
        .iw-formula-nm { font-size: 14px; font-weight: 600; color: var(--ink); }
        .iw-formula-desc { font-size: 12px; color: var(--ink-30); }
        .iw-formula-val { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--bord); }
        .iw-formula-unit { font-size: 12px; color: var(--ink-30); margin-left: 2px; }

        .iw-reset { font-size: 13px; color: var(--bord); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; margin-top: 16px; }
        .iw-info { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 24px 28px; }
        .iw-info-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 14px; }
        .iw-info-p { font-size: 14px; color: var(--ink-60); line-height: 1.7; margin-bottom: 10px; }
        .iw-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .iw-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .iw-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .iw-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .iw-ad-under-in { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .iw-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .iw-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .iw-foot-in { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .iw-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .iw-foot-logo span { color: var(--acc); }
        .iw-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .iw-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .iw-foot-lnks a:hover { color: var(--acc); }
        .iw-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
        @media (max-width: 600px) {
          .iw-wrap { padding: 28px 14px 48px; }
          .iw-ttl { font-size: 26px; }
          .iw-card { padding: 20px; }
          .iw-result { padding: 20px; }
          .iw-avg-val { font-size: 52px; }
        }
      `}</style>

      <UnifiedHeader />

      <div className="iw-bread">
        <div className="iw-bread-in">
          <Link href="/">Главная</Link>
          <span className="iw-bread-sep">›</span>
          <Link href="/calculators">Калькуляторы</Link>
          <span className="iw-bread-sep">›</span>
          <span>Идеальный вес</span>
        </div>
      </div>

      <div className="iw-body">
        <div className="iw-wrap">
          <div className="iw-hdr">
            <span className="iw-ico">🎯</span>
            <h1 className="iw-ttl">Идеальный вес</h1>
            <p className="iw-sub">Рассчитайте оптимальную массу тела по 5 медицинским формулам</p>
          </div>

          {!result ? (
            <div className="iw-card">
              <div className="iw-card-ttl">Введите данные</div>
              <div className="iw-sex">
                <button className={`iw-sex-btn${sex === 'male' ? ' active' : ''}`} onClick={() => setSex('male')}>👨 Мужской</button>
                <button className={`iw-sex-btn${sex === 'female' ? ' active' : ''}`} onClick={() => setSex('female')}>👩 Женский</button>
              </div>
              <div className="iw-field">
                <label className="iw-label">Рост (см)</label>
                <input className="iw-input" type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} min="100" max="230" />
              </div>
              <button className="iw-btn" onClick={calculate}>Рассчитать идеальный вес</button>
              {error && <div className="iw-error">{error}</div>}
            </div>
          ) : (
            <div className="iw-result">
              <div className="iw-avg">
                <div className="iw-avg-val">{result.avg} <span style={{ fontSize: 28 }}>кг</span></div>
                <div className="iw-avg-lbl">Среднее по всем формулам</div>
                <div className="iw-range-txt">Диапазон: от <strong>{result.range[0]}</strong> до <strong>{result.range[1]}</strong> кг</div>
              </div>
              <div className="iw-formulas-ttl">Результаты по формулам</div>
              {FORMULAS.map(f => (
                <div key={f.name} className="iw-formula-row">
                  <div className="iw-formula-name">
                    <div className="iw-formula-nm">{f.name}</div>
                    <div className="iw-formula-desc">{f.desc}</div>
                  </div>
                  <div>
                    <span className="iw-formula-val">{f.value}</span>
                    <span className="iw-formula-unit"> кг</span>
                  </div>
                </div>
              ))}
              <button className="iw-reset" onClick={() => setResult(null)}>← Рассчитать заново</button>
            </div>
          )}


          <div className="iw-ad-box">
            <div className="iw-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_ideal_weight_1" className="iw-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="iw-info">
            <div className="iw-info-ttl">Почему формулы дают разные результаты?</div>
            <p className="iw-info-p">Каждая формула разрабатывалась в разные эпохи, на разных популяциях и с разными целями. Поэтому результаты закономерно различаются на 2–5 кг.</p>
            <p className="iw-info-p">Среднее значение — хороший ориентир, но помните: понятие «идеального веса» условно. Оно не учитывает мышечную массу, тип телосложения, возраст и индивидуальные особенности.</p>
            <p className="iw-info-p" style={{ marginBottom: 0 }}>Используйте результат как отправную точку для разговора с врачом или диетологом, а не как жёсткую цель.</p>
          </div>

          <div className="iw-ad-box">
            <div className="iw-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_ideal_weight_2" className="iw-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="iw-ad-under">
        <div className="iw-ad-under-in">
          <div className="iw-ad-label">Реклама</div>
          <div id="yandex_rtb_calc_ideal_weight_under" className="iw-ad-under-slot">Реклама под калькулятором (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      <footer className="iw-foot">
        <div className="iw-foot-in">
          <Link href="/" className="iw-foot-logo">Здрав<span>Инфо</span></Link>
          <div className="iw-foot-lnks">
            <Link href="/calculators">Калькуляторы</Link>
            <Link href="/calculators/bmi">ИМТ</Link>
            <Link href="/calculators/calories">Норма калорий</Link>
          </div>
          <div className="iw-foot-copy">© {new Date().getFullYear()} ЗдравИнфо. Информация носит образовательный характер.</div>
        </div>
      </footer>
    </>
  )
}
