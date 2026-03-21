'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Zone {
  name: string
  desc: string
  effect: string
  icon: string
  color: string
  bg: string
  minBpm: number
  maxBpm: number
  minPct: number
  maxPct: number
}

function calcZones(age: number, restingHR?: number): Zone[] {
  const hrMax = 220 - age

  // Karvonen (если есть ЧСС покоя), иначе простая %
  const toHR = (pct: number) => {
    if (restingHR) return Math.round(restingHR + (hrMax - restingHR) * pct)
    return Math.round(hrMax * pct)
  }

  return [
    {
      name: 'Зона 1 — Восстановление',
      desc: 'Очень лёгкая нагрузка',
      effect: 'Активное восстановление, улучшение кровообращения',
      icon: '🧘',
      color: '#2563EB',
      bg: '#EFF6FF',
      minBpm: toHR(0.5),
      maxBpm: toHR(0.6),
      minPct: 50, maxPct: 60,
    },
    {
      name: 'Зона 2 — Жиросжигание',
      desc: 'Лёгкая аэробная нагрузка',
      effect: 'Сжигание жира, улучшение выносливости, здоровье сердца',
      icon: '🔥',
      color: '#16A34A',
      bg: '#F0FDF4',
      minBpm: toHR(0.6),
      maxBpm: toHR(0.7),
      minPct: 60, maxPct: 70,
    },
    {
      name: 'Зона 3 — Аэробная',
      desc: 'Умеренная нагрузка',
      effect: 'Повышение аэробной ёмкости, кардио-тренировка',
      icon: '🚴',
      color: '#D97706',
      bg: '#FFFBEB',
      minBpm: toHR(0.7),
      maxBpm: toHR(0.8),
      minPct: 70, maxPct: 80,
    },
    {
      name: 'Зона 4 — Анаэробная',
      desc: 'Высокая интенсивность',
      effect: 'Повышение лактатного порога, максимальная производительность',
      icon: '⚡',
      color: '#EA580C',
      bg: '#FFF7ED',
      minBpm: toHR(0.8),
      maxBpm: toHR(0.9),
      minPct: 80, maxPct: 90,
    },
    {
      name: 'Зона 5 — Максимальная',
      desc: 'Очень высокая нагрузка',
      effect: 'Развитие скорости, спринт. Краткосрочная, требует восстановления',
      icon: '🏃',
      color: '#DC2626',
      bg: '#FFF1F2',
      minBpm: toHR(0.9),
      maxBpm: Math.round(hrMax),
      minPct: 90, maxPct: 100,
    },
  ]
}

export default function HeartRateCalculatorClient() {
  const [age, setAge] = useState('')
  const [restingHR, setRestingHR] = useState('')
  const [result, setResult] = useState<{ zones: Zone[]; hrMax: number } | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    const a = parseInt(age)
    if (!a || a < 10 || a > 100) { setError('Введите возраст от 10 до 100 лет'); return }
    const rhr = restingHR ? parseInt(restingHR) : undefined
    if (rhr && (rhr < 30 || rhr > 120)) { setError('ЧСС покоя: 30–120 уд/мин'); return }
    setResult({ zones: calcZones(a, rhr), hrMax: 220 - a })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900&family=Golos+Text:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); }
        .hr { background: var(--bord-d); }
        .hr-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .hr-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .hr-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .hr-logo span { color: var(--acc); }
        .hr-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .hr-bread-in { max-width: 800px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .hr-bread a { color: var(--ink-60); text-decoration: none; }
        .hr-bread a:hover { color: var(--bord); }
        .hr-bread-sep { color: var(--rule); }
        .hr-body { background: var(--paper); min-height: 70vh; }
        .hr-wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px 72px; }
        .hr-hdr { margin-bottom: 32px; }
        .hr-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .hr-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .hr-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }
        .hr-card { background: var(--white); border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .hr-card-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
        .hr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .hr-field { display: flex; flex-direction: column; gap: 6px; }
        .hr-label { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); }
        .hr-hint { font-size: 11px; color: var(--ink-30); }
        .hr-input { padding: 12px 14px; border: 1px solid var(--rule); border-radius: 2px; font-size: 16px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; transition: border-color 0.15s; }
        .hr-input:focus { border-color: var(--heart); }
        .hr-btn { width: 100%; padding: 14px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; }
        .hr-btn:hover { background: var(--bord-m); }
        .hr-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .hr-result { background: var(--white); border: 1px solid var(--rule); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .hr-max-box { text-align: center; padding: 20px; background: var(--paper); border-radius: 2px; margin-bottom: 24px; }
        .hr-max-val { font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; color: var(--heart); line-height: 1; }
        .hr-max-lbl { font-size: 12px; color: var(--ink-30); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
        .hr-max-formula { font-size: 12px; color: var(--ink-30); margin-top: 4px; }

        .hr-zones { display: flex; flex-direction: column; gap: 12px; }
        .hr-zone { border-radius: 2px; padding: 16px 20px; }
        .hr-zone-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
        .hr-zone-left { display: flex; align-items: center; gap: 10px; }
        .hr-zone-ico { font-size: 22px; }
        .hr-zone-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; }
        .hr-zone-bpm { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; }
        .hr-zone-bpm-unit { font-size: 12px; font-weight: 400; margin-left: 2px; }
        .hr-zone-desc { font-size: 12px; opacity: 0.75; }
        .hr-zone-effect { font-size: 13px; opacity: 0.8; line-height: 1.5; margin-top: 4px; }
        .hr-zone-bar-wrap { height: 4px; background: rgba(0,0,0,0.08); border-radius: 2px; overflow: hidden; margin-top: 8px; }
        .hr-zone-bar { height: 100%; border-radius: 2px; }

        .hr-reset { font-size: 13px; color: var(--bord); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; margin-top: 20px; }
        .hr-info { background: var(--white); border: 1px solid var(--rule); border-radius: 2px; padding: 24px 28px; }
        .hr-info-ttl { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 14px; }
        .hr-info-p { font-size: 14px; color: var(--ink-60); line-height: 1.7; margin-bottom: 10px; }
        .hr-ad-box { background: var(--white); border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .hr-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .hr-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .hr-ad-under { background: var(--white); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .hr-ad-under-in { max-width: 800px; margin: 0 auto; padding: 0 24px; }
        .hr-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .hr-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .hr-foot-in { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .hr-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .hr-foot-logo span { color: var(--acc); }
        .hr-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .hr-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .hr-foot-lnks a:hover { color: var(--acc); }
        .hr-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
        @media (max-width: 600px) {
          .hr-wrap { padding: 28px 14px 48px; }
          .hr-ttl { font-size: 26px; }
          .hr-row { grid-template-columns: 1fr; }
          .hr-card { padding: 20px; }
          .hr-result { padding: 20px; }
          .hr-max-val { font-size: 52px; }
          .hr-zone-top { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      

      <div className="hr-bread">
        <div className="hr-bread-in">
          <Link href="/">Главная</Link>
          <span className="hr-bread-sep">›</span>
          <Link href="/calculators">Калькуляторы</Link>
          <span className="hr-bread-sep">›</span>
          <span>Пульсовые зоны</span>
        </div>
      </div>

      <div className="hr-body">
        <div className="hr-wrap">
          <div className="hr-hdr">
            <span className="hr-ico">❤️</span>
            <h1 className="hr-ttl">Пульсовые зоны</h1>
            <p className="hr-sub">Рассчитайте 5 зон пульса для кардио, жиросжигания и максимальной нагрузки</p>
          </div>

          {!result ? (
            <div className="hr-card">
              <div className="hr-card-ttl">Введите данные</div>
              <div className="hr-row">
                <div className="hr-field">
                  <label className="hr-label">Возраст (лет)</label>
                  <input className="hr-input" type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} min="10" max="100" />
                </div>
                <div className="hr-field">
                  <label className="hr-label">ЧСС покоя (уд/мин)</label>
                  <input className="hr-input" type="number" placeholder="60" value={restingHR} onChange={e => setRestingHR(e.target.value)} min="30" max="120" />
                  <span className="hr-hint">Необязательно — для формулы Карвонена</span>
                </div>
              </div>
              <button className="hr-btn" onClick={calculate}>Рассчитать пульсовые зоны</button>
              {error && <div className="hr-error">{error}</div>}
            </div>
          ) : (
            <div className="hr-result">
              <div className="hr-max-box">
                <div className="hr-max-val">{result.hrMax}</div>
                <div className="hr-max-lbl">Максимальный пульс (уд/мин)</div>
                <div className="hr-max-formula">Формула: 220 − возраст</div>
              </div>
              <div className="hr-zones">
                {result.zones.map(zone => (
                  <div key={zone.name} className="hr-zone" style={{ background: zone.bg, color: zone.color }}>
                    <div className="hr-zone-top">
                      <div className="hr-zone-left">
                        <span className="hr-zone-ico">{zone.icon}</span>
                        <div>
                          <div className="hr-zone-name">{zone.name}</div>
                          <div className="hr-zone-desc">{zone.minPct}–{zone.maxPct}% от ЧСС макс.</div>
                        </div>
                      </div>
                      <div>
                        <span className="hr-zone-bpm">{zone.minBpm}–{zone.maxBpm}</span>
                        <span className="hr-zone-bpm-unit">уд/мин</span>
                      </div>
                    </div>
                    <div className="hr-zone-effect">{zone.effect}</div>
                    <div className="hr-zone-bar-wrap">
                      <div className="hr-zone-bar" style={{ width: `${zone.maxPct}%`, background: zone.color, opacity: 0.5 }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="hr-reset" onClick={() => setResult(null)}>← Рассчитать заново</button>
            </div>
          )}


          <div className="hr-ad-box">
            <div className="hr-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_heart_rate_1" className="hr-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="hr-info">
            <div className="hr-info-ttl">Как использовать пульсовые зоны?</div>
            <p className="hr-info-p">Тренировки в зоне 2 (60–70% от ЧСС макс.) наиболее эффективны для сжигания жира — в этой зоне мышцы используют жиры как основной источник энергии. Кардиотренажёры часто ошибочно называют её «зоной сжигания жира».</p>
            <p className="hr-info-p">Зона 3 (70–80%) развивает общую выносливость и объём сердца. Это «рабочая» зона для большинства любительских тренировок.</p>
            <p className="hr-info-p" style={{ marginBottom: 0 }}>Зоны 4 и 5 — интервальные тренировки. Они эффективны для повышения результатов, но требуют достаточного восстановления. Людям с заболеваниями сердца перед началом тренировок в высоких зонах необходима консультация кардиолога.</p>
          </div>

          <div className="hr-ad-box">
            <div className="hr-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_heart_rate_2" className="hr-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="hr-ad-under">
        <div className="hr-ad-under-in">
          <div className="hr-ad-label">Реклама</div>
          <div id="yandex_rtb_calc_heart_rate_under" className="hr-ad-under-slot">Реклама под калькулятором (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      
    </>
  )
}
