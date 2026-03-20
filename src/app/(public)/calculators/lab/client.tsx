'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Типы ──────────────────────────────────────────────────────────────────────
type CalcId = 'gfr' | 'ldl' | 'ath' | 'homa' | 'score2' | 'cha2ds2' | 'childpugh'
type Sex = 'male' | 'female'

// ─── Расчёты ──────────────────────────────────────────────────────────────────

function calcGFR(creatinine: number, age: number, sex: Sex): { gfr: number; stage: string; color: string; bg: string; desc: string } {
  // CKD-EPI 2009
  const kappa = sex === 'female' ? 0.7 : 0.9
  const alpha = sex === 'female' ? -0.329 : -0.411
  const sexFactor = sex === 'female' ? 1.018 : 1.0
  const scrMg = creatinine / 88.4 // мкмоль/л → мг/дл
  const ratio = scrMg / kappa
  const gfr = Math.round(141 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.209) * Math.pow(0.993, age) * sexFactor)

  if (gfr >= 90) return { gfr, stage: 'G1 — Норма или высокая', color: '#16A34A', bg: '#F0FDF4', desc: 'Функция почек в норме. При наличии маркёров повреждения почек (белок в моче) — наблюдение.' }
  if (gfr >= 60) return { gfr, stage: 'G2 — Незначительное снижение', color: '#65A30D', bg: '#F7FEE7', desc: 'Незначительное снижение СКФ. Важно контролировать артериальное давление и исключить нефротоксичные препараты.' }
  if (gfr >= 45) return { gfr, stage: 'G3а — Умеренное снижение', color: '#D97706', bg: '#FFFBEB', desc: 'Умеренное снижение функции почек. Консультация нефролога, коррекция доз некоторых препаратов.' }
  if (gfr >= 30) return { gfr, stage: 'G3б — Умеренно-тяжёлое снижение', color: '#EA580C', bg: '#FFF7ED', desc: 'Значительное снижение. Обязательна консультация нефролога, ограничение белка, контроль АД и анемии.' }
  if (gfr >= 15) return { gfr, stage: 'G4 — Тяжёлое снижение', color: '#DC2626', bg: '#FFF1F2', desc: 'Тяжёлое снижение функции почек. Подготовка к заместительной почечной терапии.' }
  return { gfr, stage: 'G5 — Почечная недостаточность', color: '#9B1C1C', bg: '#FFF1F2', desc: 'Терминальная почечная недостаточность. Гемодиализ или трансплантация почки.' }
}

function calcLDL(totalChol: number, hdl: number, tg: number): { ldl: number; category: string; color: string; bg: string; desc: string } {
  // Формула Фридевальда (валидна при ТГ < 4.5 ммоль/л)
  const ldl = Math.round((totalChol - hdl - tg / 2.2) * 10) / 10

  if (ldl < 0) return { ldl: 0, category: 'Ошибка расчёта', color: '#6B7280', bg: '#F9FAFB', desc: 'Проверьте введённые значения. Формула недействительна при ТГ > 4.5 ммоль/л.' }
  if (ldl < 1.8) return { ldl, category: 'Оптимальный (очень высокий риск)', color: '#16A34A', bg: '#F0FDF4', desc: 'Целевой уровень при очень высоком ССЗ-риске (перенесённый инфаркт, инсульт, СД с поражением органов).' }
  if (ldl < 2.5) return { ldl, category: 'Хороший (высокий риск)', color: '#65A30D', bg: '#F7FEE7', desc: 'Целевой уровень при высоком ССЗ-риске (СД без поражения органов, выраженная АГ).' }
  if (ldl < 3.0) return { ldl, category: 'Умеренный риск', color: '#D97706', bg: '#FFFBEB', desc: 'Умеренный риск. Рекомендуется коррекция образа жизни, при необходимости — статины.' }
  if (ldl < 4.0) return { ldl, category: 'Высокий', color: '#EA580C', bg: '#FFF7ED', desc: 'Высокий ЛПНП. Необходимы изменения в питании и, вероятно, медикаментозное лечение.' }
  return { ldl, category: 'Очень высокий', color: '#DC2626', bg: '#FFF1F2', desc: 'Очень высокий ЛПНП. Обязательна консультация врача и назначение статинов.' }
}

function calcAtherogenicity(totalChol: number, hdl: number): { index: number; category: string; color: string; bg: string; desc: string } {
  if (hdl <= 0) return { index: 0, category: 'Ошибка', color: '#6B7280', bg: '#F9FAFB', desc: 'ЛПВП должен быть больше 0.' }
  const index = Math.round(((totalChol - hdl) / hdl) * 100) / 100

  if (index < 2.0) return { index, category: 'Минимальный риск', color: '#16A34A', bg: '#F0FDF4', desc: 'Очень низкий атерогенный потенциал. Риск атеросклероза минимален.' }
  if (index < 3.0) return { index, category: 'Низкий риск', color: '#65A30D', bg: '#F7FEE7', desc: 'Нормальный показатель. Продолжайте поддерживать здоровый образ жизни.' }
  if (index < 4.0) return { index, category: 'Умеренный риск', color: '#D97706', bg: '#FFFBEB', desc: 'Умеренный атерогенный потенциал. Рекомендуется коррекция питания и активности.' }
  if (index < 5.0) return { index, category: 'Высокий риск', color: '#EA580C', bg: '#FFF7ED', desc: 'Высокий риск атеросклероза. Консультация кардиолога или терапевта.' }
  return { index, category: 'Очень высокий риск', color: '#DC2626', bg: '#FFF1F2', desc: 'Очень высокий атерогенный потенциал. Срочная консультация врача, вероятно медикаментозное лечение.' }
}

function calcHOMA(glucose: number, insulin: number): { homa: number; category: string; color: string; bg: string; desc: string } {
  const homa = Math.round((glucose * insulin / 22.5) * 100) / 100

  if (homa < 1.0) return { homa, category: 'Нет инсулинорезистентности', color: '#16A34A', bg: '#F0FDF4', desc: 'Оптимальная чувствительность к инсулину. Поджелудочная железа работает эффективно.' }
  if (homa < 2.7) return { homa, category: 'Норма', color: '#65A30D', bg: '#F7FEE7', desc: 'Нормальная чувствительность к инсулину для взрослого человека.' }
  if (homa < 4.0) return { homa, category: 'Пограничная инсулинорезистентность', color: '#D97706', bg: '#FFFBEB', desc: 'Признаки начальной инсулинорезистентности. Рекомендуется снижение веса, ограничение быстрых углеводов.' }
  return { homa, category: 'Инсулинорезистентность', color: '#DC2626', bg: '#FFF1F2', desc: 'Выраженная инсулинорезистентность. Высокий риск СД 2 типа и метаболического синдрома. Консультация эндокринолога.' }
}


// ─── SCORE2 (риск ССЗ за 10 лет, Европа высокий риск) ─────────────────────
function calcSCORE2(age: number, sex: Sex, sbp: number, totalChol: number, hdl: number, smoker: boolean): { risk: number; category: string; color: string; bg: string; desc: string; action: string } {
  // SCORE2 2021 — регион высокого риска (Россия)
  // Логарифмическая модель на основе публикации ESC 2021
  const nonHDL = totalChol - hdl
  const ageFactor = sex === 'male' ? 0.3742 : 0.4648
  const sbpFactor = sex === 'male' ? 0.2628 : 0.3131
  const smokFactor = sex === 'male' ? 0.6010 : 0.7744
  const cholFactor = sex === 'male' ? 0.1249 : 0.1002
  
  const lp = (age - 60) * ageFactor +
             (sbp - 120) / 20 * sbpFactor +
             (smoker ? 1 : 0) * smokFactor +
             (nonHDL - 3.3) * cholFactor
  
  // Базовая выживаемость для высокого риска (Россия)
  const s0 = sex === 'male' ? 0.9605 : 0.9776
  const risk10 = Math.round((1 - Math.pow(s0, Math.exp(lp))) * 100 * 10) / 10

  const r = Math.max(0.1, Math.min(risk10, 50))
  
  if (age < 50) {
    if (r < 2.5) return { risk: r, category: 'Низкий / умеренный', color: '#16A34A', bg: '#F0FDF4', desc: 'Риск ССЗ за 10 лет низкий или умеренный.', action: 'Контроль факторов риска, здоровый образ жизни.' }
    if (r < 7.5) return { risk: r, category: 'Высокий', color: '#D97706', bg: '#FFFBEB', desc: 'Высокий сердечно-сосудистый риск.', action: 'Интенсивное изменение образа жизни. Рассмотреть медикаментозное лечение.' }
    return { risk: r, category: 'Очень высокий', color: '#DC2626', bg: '#FFF1F2', desc: 'Очень высокий риск сердечно-сосудистых событий.', action: 'Обязательное медикаментозное лечение. Консультация кардиолога.' }
  } else {
    if (r < 5) return { risk: r, category: 'Низкий / умеренный', color: '#16A34A', bg: '#F0FDF4', desc: 'Риск ССЗ за 10 лет низкий или умеренный.', action: 'Контроль факторов риска, здоровый образ жизни.' }
    if (r < 10) return { risk: r, category: 'Высокий', color: '#D97706', bg: '#FFFBEB', desc: 'Высокий сердечно-сосудистый риск.', action: 'Интенсивное изменение образа жизни и медикаментозное лечение.' }
    return { risk: r, category: 'Очень высокий', color: '#DC2626', bg: '#FFF1F2', desc: 'Очень высокий риск сердечно-сосудистых событий.', action: 'Обязательное медикаментозное лечение. Консультация кардиолога.' }
  }
}

// ─── CHA₂DS₂-VASc (риск инсульта при фибрилляции предсердий) ──────────────
function calcCHA2DS2(age: number, sex: Sex, chf: boolean, hyp: boolean, stroke: boolean, vasc: boolean, diabetes: boolean): { score: number; riskPct: number; category: string; color: string; bg: string; desc: string; action: string } {
  let score = 0
  if (chf) score += 1
  if (hyp) score += 1
  if (age >= 75) score += 2
  else if (age >= 65) score += 1
  if (diabetes) score += 1
  if (stroke) score += 2
  if (vasc) score += 1
  if (sex === 'female') score += 1

  // Скорректированный годовой риск инсульта (%)
  const riskTable: Record<number, number> = { 0: 0, 1: 1.3, 2: 2.2, 3: 3.2, 4: 4.0, 5: 6.7, 6: 9.8, 7: 9.6, 8: 6.7, 9: 15.2 }
  const riskPct = riskTable[Math.min(score, 9)] ?? 15.2

  if (score === 0 && sex === 'male') return { score, riskPct, category: 'Низкий риск', color: '#16A34A', bg: '#F0FDF4', desc: 'Антикоагулянты не показаны.', action: 'Антикоагулянты не нужны.' }
  if (score === 1 && sex === 'male') return { score, riskPct, category: 'Умеренный риск', color: '#D97706', bg: '#FFFBEB', desc: 'Возможно назначение антикоагулянтов.', action: 'Рассмотреть НОАК с учётом риска кровотечений (HAS-BLED).' }
  if ((score === 0 || score === 1) && sex === 'female') return { score, riskPct, category: 'Низкий риск', color: '#16A34A', bg: '#F0FDF4', desc: 'Пол сам по себе не является показанием.', action: 'Антикоагулянты, как правило, не нужны.' }
  return { score, riskPct, category: 'Высокий риск', color: '#DC2626', bg: '#FFF1F2', desc: 'Антикоагулянтная терапия показана.', action: 'НОАК (апиксабан, ривароксабан, дабигатран) или варфарин. Консультация кардиолога.' }
}

// ─── Child-Pugh (тяжесть цирроза печени) ───────────────────────────────────
function calcChildPugh(bilirubin: number, albumin: number, pt: number, ascites: number, encephalopathy: number): { score: number; cls: string; color: string; bg: string; survival1yr: string; survival2yr: string; desc: string } {
  let score = 0
  // Билирубин (мкмоль/л)
  if (bilirubin < 34) score += 1
  else if (bilirubin <= 51) score += 2
  else score += 3
  // Альбумин (г/л)
  if (albumin > 35) score += 1
  else if (albumin >= 28) score += 2
  else score += 3
  // Протромбиновое время (удлинение в секундах)
  if (pt < 4) score += 1
  else if (pt <= 6) score += 2
  else score += 3
  // Асцит (0=нет, 1=лёгкий, 2=тяжёлый)
  score += ascites === 0 ? 1 : ascites === 1 ? 2 : 3
  // Энцефалопатия (0=нет, 1=I-II, 2=III-IV)
  score += encephalopathy === 0 ? 1 : encephalopathy === 1 ? 2 : 3

  if (score <= 6) return { score, cls: 'A', color: '#16A34A', bg: '#F0FDF4', survival1yr: '100%', survival2yr: '85%', desc: 'Компенсированный цирроз. Хорошая переносимость операций.' }
  if (score <= 9) return { score, cls: 'B', color: '#D97706', bg: '#FFFBEB', survival1yr: '80%', survival2yr: '60%', desc: 'Умеренная декомпенсация. Операционный риск повышен.' }
  return { score, cls: 'C', color: '#DC2626', bg: '#FFF1F2', survival1yr: '45%', survival2yr: '35%', desc: 'Тяжёлая декомпенсация. Высокий операционный риск. Рассмотреть трансплантацию печени.' }
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function LabCalculatorsPageClient() {
  const [active, setActive] = useState<CalcId>('gfr')

  // GFR fields
  const [gfrCr, setGfrCr] = useState(''); const [gfrAge, setGfrAge] = useState(''); const [gfrSex, setGfrSex] = useState<Sex>('male')
  const [gfrResult, setGfrResult] = useState<ReturnType<typeof calcGFR> | null>(null)

  // LDL fields
  const [ldlTotal, setLdlTotal] = useState(''); const [ldlHdl, setLdlHdl] = useState(''); const [ldlTg, setLdlTg] = useState('')
  const [ldlResult, setLdlResult] = useState<ReturnType<typeof calcLDL> | null>(null)

  // Ath fields
  const [athTotal, setAthTotal] = useState(''); const [athHdl, setAthHdl] = useState('')
  const [athResult, setAthResult] = useState<ReturnType<typeof calcAtherogenicity> | null>(null)

  // HOMA fields
  const [homaGluc, setHomaGluc] = useState(''); const [homaIns, setHomaIns] = useState('')
  const [homaResult, setHomaResult] = useState<ReturnType<typeof calcHOMA> | null>(null)

  // SCORE2 fields
  const [s2age, setS2age] = useState(''); const [s2sex, setS2sex] = useState<Sex>('male')
  const [s2sbp, setS2sbp] = useState(''); const [s2chol, setS2chol] = useState('')
  const [s2hdl, setS2hdl] = useState(''); const [s2smoke, setS2smoke] = useState(false)
  const [s2result, setS2result] = useState<ReturnType<typeof calcSCORE2> | null>(null)

  // CHA2DS2-VASc fields
  const [chaAge, setChaAge] = useState(''); const [chaSex, setChaSex] = useState<Sex>('male')
  const [chaChf, setChaChf] = useState(false); const [chaHyp, setChaHyp] = useState(false)
  const [chaStroke, setChaStroke] = useState(false); const [chaVasc, setChaVasc] = useState(false)
  const [chaDm, setChaDm] = useState(false)
  const [chaResult, setChaResult] = useState<ReturnType<typeof calcCHA2DS2> | null>(null)

  // Child-Pugh fields
  const [cpBili, setCpBili] = useState(''); const [cpAlb, setCpAlb] = useState('')
  const [cpPt, setCpPt] = useState(''); const [cpAscites, setCpAscites] = useState(0)
  const [cpEnc, setCpEnc] = useState(0)
  const [cpResult, setCpResult] = useState<ReturnType<typeof calcChildPugh> | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  function setError(id: string, msg: string) { setErrors(e => ({ ...e, [id]: msg })) }
  function clearError(id: string) { setErrors(e => ({ ...e, [id]: '' })) }

  function runGFR() {
    clearError('gfr')
    const cr = parseFloat(gfrCr), age = parseFloat(gfrAge)
    if (!cr || cr < 20 || cr > 2000) { setError('gfr', 'Введите креатинин (20–2000 мкмоль/л)'); return }
    if (!age || age < 18 || age > 100) { setError('gfr', 'Введите возраст (18–100 лет)'); return }
    setGfrResult(calcGFR(cr, age, gfrSex))
  }

  function runLDL() {
    clearError('ldl')
    const total = parseFloat(ldlTotal), hdl = parseFloat(ldlHdl), tg = parseFloat(ldlTg)
    if (!total || total < 1 || total > 20) { setError('ldl', 'Общий холестерин: 1–20 ммоль/л'); return }
    if (!hdl || hdl < 0.1 || hdl > 5) { setError('ldl', 'ЛПВП: 0.1–5 ммоль/л'); return }
    if (!tg || tg < 0.1 || tg > 10) { setError('ldl', 'Триглицериды: 0.1–10 ммоль/л'); return }
    if (tg > 4.5) { setError('ldl', 'Формула Фридевальда недействительна при ТГ > 4.5 ммоль/л'); return }
    setLdlResult(calcLDL(total, hdl, tg))
  }

  function runAth() {
    clearError('ath')
    const total = parseFloat(athTotal), hdl = parseFloat(athHdl)
    if (!total || total < 1 || total > 20) { setError('ath', 'Общий холестерин: 1–20 ммоль/л'); return }
    if (!hdl || hdl < 0.1 || hdl > 5) { setError('ath', 'ЛПВП: 0.1–5 ммоль/л'); return }
    if (hdl >= total) { setError('ath', 'ЛПВП не может быть больше общего холестерина'); return }
    setAthResult(calcAtherogenicity(total, hdl))
  }

  function runHOMA() {
    clearError('homa')
    const gluc = parseFloat(homaGluc), ins = parseFloat(homaIns)
    if (!gluc || gluc < 2 || gluc > 30) { setError('homa', 'Глюкоза: 2–30 ммоль/л'); return }
    if (!ins || ins < 0.5 || ins > 300) { setError('homa', 'Инсулин: 0.5–300 мкЕд/мл'); return }
    setHomaResult(calcHOMA(gluc, ins))
  }

  const CALCS = [
    { id: 'gfr' as CalcId,  label: 'СКФ',           icon: '🫘', desc: 'Скорость клубочковой фильтрации (CKD-EPI)' },
    { id: 'ldl' as CalcId,  label: 'ЛПНП',          icon: '🧪', desc: 'Расчёт LDL по Фридевальду' },
    { id: 'ath' as CalcId,  label: 'Индекс атерогенности', icon: '❤️', desc: 'Атерогенный потенциал крови' },
    { id: 'homa' as CalcId,     label: 'HOMA-IR',         icon: '⚗️', desc: 'Индекс инсулинорезистентности' },
    { id: 'score2' as CalcId,    label: 'SCORE2',          icon: '❤️‍🔥', desc: 'Риск инфаркта/инсульта за 10 лет' },
    { id: 'cha2ds2' as CalcId,   label: 'CHA₂DS₂-VASc',   icon: '🩺', desc: 'Риск инсульта при фибрилляции' },
    { id: 'childpugh' as CalcId, label: 'Child-Pugh',      icon: '🫁', desc: 'Тяжесть цирроза печени' },
  ]

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
        .lc { background: var(--bord-d); }
        .lc-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .lc-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .lc-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .lc-logo span { color: var(--acc); }
        .lc-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .lc-bread-in { max-width: 860px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .lc-bread a { color: var(--ink-60); text-decoration: none; }
        .lc-bread a:hover { color: var(--bord); }
        .lc-bread-sep { color: var(--rule); }
        .lc-body { background: var(--paper); min-height: 70vh; }
        .lc-wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 72px; }
        .lc-hdr { margin-bottom: 32px; }
        .lc-ico { font-size: 44px; margin-bottom: 12px; display: block; }
        .lc-ttl { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
        .lc-sub { font-size: 15px; color: var(--ink-60); line-height: 1.6; }

        .lc-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 28px; }
        .lc-tab { padding: 14px 10px; background: white; border: 1px solid var(--rule); border-radius: 2px; cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'Golos Text', sans-serif; border-top: 3px solid var(--rule); }
        .lc-tab.active { border-top-color: var(--bord); background: var(--bord-l); }
        .lc-tab:hover:not(.active) { border-top-color: var(--bord-m); }
        .lc-tab-ico { font-size: 22px; margin-bottom: 4px; }
        .lc-tab-name { font-size: 13px; font-weight: 700; color: var(--ink); }
        .lc-tab-desc { font-size: 10px; color: var(--ink-30); margin-top: 2px; display: none; }
        .lc-tab.active .lc-tab-desc { display: block; }

        .lc-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 28px; margin-bottom: 24px; }
        .lc-card-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .lc-card-sub { font-size: 13px; color: var(--ink-30); margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--rule); }

        .lc-sex { display: flex; gap: 0; margin-bottom: 20px; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
        .lc-sex-btn { flex: 1; padding: 10px; font-size: 13px; font-weight: 600; text-align: center; cursor: pointer; background: white; border: none; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .lc-sex-btn.active { background: var(--bord); color: white; }
        .lc-sex-btn:hover:not(.active) { background: var(--bord-l); color: var(--bord); }

        .lc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .lc-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .lc-field { display: flex; flex-direction: column; gap: 5px; }
        .lc-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); }
        .lc-sublabel { font-size: 11px; color: var(--ink-30); }
        .lc-input { padding: 11px 13px; border: 1px solid var(--rule); border-radius: 2px; font-size: 16px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; transition: border-color 0.15s; }
        .lc-input:focus { border-color: var(--bord); }
        .lc-btn { width: 100%; padding: 13px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 14px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; margin-top: 4px; }
        .lc-btn:hover { background: var(--bord-m); }
        .lc-error { font-size: 13px; color: #DC2626; margin-top: 10px; padding: 10px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        .lc-result { border-radius: 2px; padding: 20px 24px; margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .lc-result-left { }
        .lc-result-val { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 900; line-height: 1; }
        .lc-result-unit { font-size: 16px; font-weight: 400; }
        .lc-result-right { flex: 1; min-width: 200px; }
        .lc-result-cat { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
        .lc-result-desc { font-size: 13px; line-height: 1.6; opacity: 0.85; }
        .lc-reset { font-size: 12px; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 8px; padding: 0; font-family: 'Golos Text', sans-serif; }

        .lc-info { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 20px 24px; margin-bottom: 24px; }
        .lc-info-ttl { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 10px; }
        .lc-info-p { font-size: 13px; color: var(--ink-60); line-height: 1.7; margin-bottom: 8px; }

        .lc-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-bottom: 24px; }
        .lc-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .lc-ad-slot { min-height: 250px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; padding: 16px; }
        .lc-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .lc-ad-under-in { max-width: 860px; margin: 0 auto; padding: 0 24px; }
        .lc-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .lc-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .lc-foot-in { max-width: 860px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .lc-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .lc-foot-logo span { color: var(--acc); }
        .lc-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .lc-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .lc-foot-lnks a:hover { color: var(--acc); }
        .lc-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 640px) {
          .lc-wrap { padding: 28px 14px 48px; }
          .lc-ttl { font-size: 26px; }
          .lc-tabs { grid-template-columns: repeat(2, 1fr); }
          .lc-row { grid-template-columns: 1fr; }
          .lc-row3 { grid-template-columns: 1fr; }
          .lc-result { flex-direction: column; }
          .lc-result-val { font-size: 44px; }
        }
      `}</style>

      

      <div className="lc-bread">
        <div className="lc-bread-in">
          <Link href="/">Главная</Link>
          <span className="lc-bread-sep">›</span>
          <Link href="/calculators">Калькуляторы</Link>
          <span className="lc-bread-sep">›</span>
          <span>Калькуляторы анализов</span>
        </div>
      </div>

      <div className="lc-body">
        <div className="lc-wrap">
          <div className="lc-hdr">
            <span className="lc-ico">🧪</span>
            <h1 className="lc-ttl">Калькуляторы анализов</h1>
            <p className="lc-sub">СКФ, ЛПНП, HOMA-IR, SCORE2, CHA₂DS₂-VASc, Child-Pugh</p>
          </div>

          {/* Вкладки */}
          <div className="lc-tabs">
            {CALCS.map(c => (
              <div key={c.id} className={`lc-tab${active === c.id ? ' active' : ''}`} onClick={() => setActive(c.id)}>
                <div className="lc-tab-ico">{c.icon}</div>
                <div className="lc-tab-name">{c.label}</div>
                <div className="lc-tab-desc">{c.desc}</div>
              </div>
            ))}
          </div>

          {/* ── СКФ ── */}
          {active === 'gfr' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">🫘 Скорость клубочковой фильтрации (СКФ)</div>
                <div className="lc-card-sub">Формула CKD-EPI 2009 — рекомендована KDIGO для оценки функции почек</div>
                <div className="lc-sex">
                  <button className={`lc-sex-btn${gfrSex === 'male' ? ' active' : ''}`} onClick={() => setGfrSex('male')}>👨 Мужской</button>
                  <button className={`lc-sex-btn${gfrSex === 'female' ? ' active' : ''}`} onClick={() => setGfrSex('female')}>👩 Женский</button>
                </div>
                <div className="lc-row">
                  <div className="lc-field">
                    <label className="lc-label">Креатинин сыворотки</label>
                    <input className="lc-input" type="number" placeholder="90" value={gfrCr} onChange={e => setGfrCr(e.target.value)} />
                    <span className="lc-sublabel">мкмоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Возраст</label>
                    <input className="lc-input" type="number" placeholder="40" value={gfrAge} onChange={e => setGfrAge(e.target.value)} />
                    <span className="lc-sublabel">лет (18–100)</span>
                  </div>
                </div>
                <button className="lc-btn" onClick={runGFR}>Рассчитать СКФ</button>
                {errors.gfr && <div className="lc-error">{errors.gfr}</div>}
                {gfrResult && (
                  <div className="lc-result" style={{ background: gfrResult.bg, color: gfrResult.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">{gfrResult.gfr} <span className="lc-result-unit">мл/мин/1.73м²</span></div>
                      <button className="lc-reset" style={{ color: gfrResult.color }} onClick={() => setGfrResult(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-cat">{gfrResult.stage}</div>
                      <div className="lc-result-desc">{gfrResult.desc}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">О формуле CKD-EPI</div>
                <p className="lc-info-p">CKD-EPI — наиболее точная формула расчёта СКФ для большинства взрослых. Рекомендована KDIGO (международные рекомендации по болезням почек) и основана на уровне креатинина, возрасте и поле.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>СКФ ≥60 мл/мин/1.73м² считается нормальной функцией почек. Хроническая болезнь почек диагностируется при стойком снижении СКФ &lt;60 в течение ≥3 месяцев или наличии маркёров повреждения (белок в моче).</p>
              </div>
            </>
          )}

          {/* ── ЛПНП ── */}
          {active === 'ldl' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">🧪 Расчётный ЛПНП (LDL) по Фридевальду</div>
                <div className="lc-card-sub">ЛПНП = Общий холестерин − ЛПВП − Триглицериды / 2.2 (валидно при ТГ &lt; 4.5 ммоль/л)</div>
                <div className="lc-row3">
                  <div className="lc-field">
                    <label className="lc-label">Общий холестерин</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="5.0" value={ldlTotal} onChange={e => setLdlTotal(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">ЛПВП (HDL)</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="1.3" value={ldlHdl} onChange={e => setLdlHdl(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Триглицериды</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="1.5" value={ldlTg} onChange={e => setLdlTg(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                </div>
                <button className="lc-btn" onClick={runLDL}>Рассчитать ЛПНП</button>
                {errors.ldl && <div className="lc-error">{errors.ldl}</div>}
                {ldlResult && (
                  <div className="lc-result" style={{ background: ldlResult.bg, color: ldlResult.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">{ldlResult.ldl} <span className="lc-result-unit">ммоль/л</span></div>
                      <button className="lc-reset" style={{ color: ldlResult.color }} onClick={() => setLdlResult(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-cat">{ldlResult.category}</div>
                      <div className="lc-result-desc">{ldlResult.desc}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">О формуле Фридевальда</div>
                <p className="lc-info-p">Расчётный ЛПНП используется в большинстве лабораторий вместо прямого измерения — он дешевле и хорошо коррелирует с прямым методом при нормальных триглицеридах.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>При ТГ &gt; 4.5 ммоль/л формула ненадёжна — в этом случае нужно прямое измерение ЛПНП или формула Мартина–Хопкинса.</p>
              </div>
            </>
          )}

          {/* ── Индекс атерогенности ── */}
          {active === 'ath' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">❤️ Индекс атерогенности (ИА)</div>
                <div className="lc-card-sub">ИА = (Общий холестерин − ЛПВП) / ЛПВП — отражает соотношение «плохого» и «хорошего» холестерина</div>
                <div className="lc-row">
                  <div className="lc-field">
                    <label className="lc-label">Общий холестерин</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="5.0" value={athTotal} onChange={e => setAthTotal(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">ЛПВП (HDL)</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="1.3" value={athHdl} onChange={e => setAthHdl(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                </div>
                <button className="lc-btn" onClick={runAth}>Рассчитать индекс</button>
                {errors.ath && <div className="lc-error">{errors.ath}</div>}
                {athResult && (
                  <div className="lc-result" style={{ background: athResult.bg, color: athResult.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">{athResult.index}</div>
                      <button className="lc-reset" style={{ color: athResult.color }} onClick={() => setAthResult(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-cat">{athResult.category}</div>
                      <div className="lc-result-desc">{athResult.desc}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">Об индексе атерогенности</div>
                <p className="lc-info-p">Индекс атерогенности показывает соотношение между всеми атерогенными фракциями холестерина и «защитным» ЛПВП. Чем он ниже — тем меньше риск атеросклероза.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>Норма: &lt;3.0. Целевые значения у пациентов с ИБС и после инфаркта: &lt;2.0. Повышение индекса при нормальном общем холестерине возможно при сниженном ЛПВП — это самостоятельный фактор риска.</p>
              </div>
            </>
          )}

          {/* ── HOMA-IR ── */}
          {active === 'homa' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">⚗️ HOMA-IR — индекс инсулинорезистентности</div>
                <div className="lc-card-sub">HOMA-IR = Глюкоза (ммоль/л) × Инсулин (мкЕд/мл) / 22.5 — оба показателя строго натощак</div>
                <div className="lc-row">
                  <div className="lc-field">
                    <label className="lc-label">Глюкоза натощак</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="5.0" value={homaGluc} onChange={e => setHomaGluc(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Инсулин натощак</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="10" value={homaIns} onChange={e => setHomaIns(e.target.value)} />
                    <span className="lc-sublabel">мкЕд/мл</span>
                  </div>
                </div>
                <button className="lc-btn" onClick={runHOMA}>Рассчитать HOMA-IR</button>
                {errors.homa && <div className="lc-error">{errors.homa}</div>}
                {homaResult && (
                  <div className="lc-result" style={{ background: homaResult.bg, color: homaResult.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">{homaResult.homa}</div>
                      <button className="lc-reset" style={{ color: homaResult.color }} onClick={() => setHomaResult(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-cat">{homaResult.category}</div>
                      <div className="lc-result-desc">{homaResult.desc}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">О HOMA-IR</div>
                <p className="lc-info-p">HOMA-IR (Homeostasis Model Assessment of Insulin Resistance) — расчётный индекс инсулинорезистентности. Оба анализа (глюкоза и инсулин) нужно сдавать одновременно строго натощак.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>Норма: &lt;2.7 для большинства лабораторий. При HOMA-IR &gt;2.7 — инсулинорезистентность: клетки хуже реагируют на инсулин, поджелудочная железа вырабатывает его больше, что со временем приводит к СД 2 типа.</p>
              </div>
            </>
          )}

                    {/* ── SCORE2 ────────────────────────────────────────────────────────── */}
          {active === 'score2' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">❤️‍🔥 SCORE2 — риск сердечно-сосудистых событий</div>
                <div className="lc-card-sub">10-летний риск инфаркта и инсульта. Шкала ESC 2021, регион высокого риска (Россия). Возраст 40–79 лет.</div>
                <div className="lc-sex">
                  <button className={`lc-sex-btn${s2sex==='male'?' active':''}`} onClick={()=>setS2sex('male')}>👨 Мужской</button>
                  <button className={`lc-sex-btn${s2sex==='female'?' active':''}`} onClick={()=>setS2sex('female')}>👩 Женский</button>
                </div>
                <div className="lc-sex" style={{ marginTop: 10 }}>
                  <button className={`lc-sex-btn${!s2smoke?' active':''}`} onClick={()=>setS2smoke(false)}>🚭 Не курит</button>
                  <button className={`lc-sex-btn${s2smoke?' active':''}`} onClick={()=>setS2smoke(true)}>🚬 Курит</button>
                </div>
                <div className="lc-row" style={{ marginTop: 16 }}>
                  <div className="lc-field">
                    <label className="lc-label">Возраст</label>
                    <input className="lc-input" type="number" placeholder="55" value={s2age} onChange={e=>setS2age(e.target.value)} />
                    <span className="lc-sublabel">лет (40–79)</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Систолическое АД</label>
                    <input className="lc-input" type="number" placeholder="130" value={s2sbp} onChange={e=>setS2sbp(e.target.value)} />
                    <span className="lc-sublabel">мм рт.ст.</span>
                  </div>
                </div>
                <div className="lc-row">
                  <div className="lc-field">
                    <label className="lc-label">Общий холестерин</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="5.2" value={s2chol} onChange={e=>setS2chol(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">ЛПВП (хороший холестерин)</label>
                    <input className="lc-input" type="number" step="0.1" placeholder="1.3" value={s2hdl} onChange={e=>setS2hdl(e.target.value)} />
                    <span className="lc-sublabel">ммоль/л</span>
                  </div>
                </div>
                <button className="lc-btn" onClick={()=>{
                  clearError('score2')
                  if (!s2age||!s2sbp||!s2chol||!s2hdl){setError('score2','Заполните все поля');return}
                  const age=parseInt(s2age),sbp=parseInt(s2sbp),chol=parseFloat(s2chol),hdl=parseFloat(s2hdl)
                  if(age<40||age>79){setError('score2','Возраст должен быть 40–79 лет');return}
                  if(sbp<80||sbp>250){setError('score2','Проверьте значение АД');return}
                  setS2result(calcSCORE2(age,s2sex,sbp,chol,hdl,s2smoke))
                }}>Рассчитать SCORE2</button>
                {errors.score2 && <div className="lc-error">{errors.score2}</div>}
                {s2result && (
                  <div className="lc-result" style={{ background: s2result.bg, color: s2result.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">{s2result.risk}%<span className="lc-result-unit"> риск/10 лет</span></div>
                      <button className="lc-reset" style={{ color: s2result.color }} onClick={()=>setS2result(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-cat">{s2result.category}</div>
                      <div className="lc-result-desc">{s2result.desc}</div>
                      <div className="lc-result-desc" style={{ marginTop: 4, fontWeight: 600 }}>{s2result.action}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">О шкале SCORE2</div>
                <p className="lc-info-p">SCORE2 (Systematic Coronary Risk Estimation 2) — европейская шкала оценки 10-летнего риска фатальных и нефатальных сердечно-сосудистых событий у лиц 40–79 лет без установленных ССЗ и СД. Разработана ESC в 2021 году. Россия — регион высокого риска.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>Высокий риск (≥5% до 50 лет, ≥10% после 50 лет) — показание для назначения статинов и антигипертензивной терапии. Результат ориентировочный — решение принимает врач с учётом полной клинической картины.</p>
              </div>
            </>
          )}

          {/* ── CHA₂DS₂-VASc ────────────────────────────────────────────────────── */}
          {active === 'cha2ds2' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">🩺 CHA₂DS₂-VASc — риск инсульта при фибрилляции предсердий</div>
                <div className="lc-card-sub">Оценка показаний к антикоагулянтной терапии. Применяется только при установленной фибрилляции предсердий.</div>
                <div className="lc-sex">
                  <button className={`lc-sex-btn${chaSex==='male'?' active':''}`} onClick={()=>setChaSex('male')}>👨 Мужской</button>
                  <button className={`lc-sex-btn${chaSex==='female'?' active':''}`} onClick={()=>setChaSex('female')}>👩 Женский</button>
                </div>
                <div className="lc-row" style={{ marginTop: 16 }}>
                  <div className="lc-field">
                    <label className="lc-label">Возраст пациента</label>
                    <input className="lc-input" type="number" placeholder="68" value={chaAge} onChange={e=>setChaAge(e.target.value)} />
                    <span className="lc-sublabel">65–74 = +1 балл, ≥75 = +2 балла</span>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="lc-label" style={{ marginBottom: 8 }}>Факторы риска (отметьте все присутствующие):</div>
                  {([
                    [chaChf, setChaChf, 'Сердечная недостаточность / дисфункция ЛЖ (+1)'],
                    [chaHyp, setChaHyp, 'Артериальная гипертония (+1)'],
                    [chaStroke, setChaStroke, 'Инсульт / ТИА / тромбоэмболия в анамнезе (+2)'],
                    [chaVasc, setChaVasc, 'Сосудистые заболевания: ИМ, бляшки аорты (+1)'],
                    [chaDm, setChaDm, 'Сахарный диабет (+1)'],
                  ] as [boolean, (v: boolean) => void, string][]).map(([val, setter, label], i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}
                        style={{ marginTop: 2, width: 16, height: 16, accentColor: '#6B1F2A', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{label}</span>
                    </label>
                  ))}
                </div>
                <button className="lc-btn" onClick={()=>{
                  clearError('cha2ds2')
                  if(!chaAge){setError('cha2ds2','Введите возраст пациента');return}
                  const age=parseInt(chaAge)
                  if(age<18||age>120){setError('cha2ds2','Проверьте значение возраста');return}
                  setChaResult(calcCHA2DS2(age,chaSex,chaChf,chaHyp,chaStroke,chaVasc,chaDm))
                }}>Рассчитать CHA₂DS₂-VASc</button>
                {errors.cha2ds2 && <div className="lc-error">{errors.cha2ds2}</div>}
                {chaResult && (
                  <div className="lc-result" style={{ background: chaResult.bg, color: chaResult.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">{chaResult.score}<span className="lc-result-unit"> баллов</span></div>
                      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Риск: {chaResult.riskPct}%/год</div>
                      <button className="lc-reset" style={{ color: chaResult.color }} onClick={()=>setChaResult(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-cat">{chaResult.category}</div>
                      <div className="lc-result-desc">{chaResult.desc}</div>
                      <div className="lc-result-desc" style={{ marginTop: 4, fontWeight: 600 }}>{chaResult.action}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">О шкале CHA₂DS₂-VASc</div>
                <p className="lc-info-p">Шкала применяется у пациентов с фибрилляцией предсердий для оценки годового риска инсульта. C — сердечная недостаточность, H — гипертония, A₂ — возраст ≥75 лет (2 балла), D — диабет, S₂ — инсульт/ТИА (2 балла), V — сосудистые болезни, A — возраст 65–74, Sc — женский пол.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>Балл ≥2 у мужчин и ≥3 у женщин — показание к НОАК (апиксабан, ривароксабан, дабигатран). Решение принимает врач с учётом риска кровотечений (шкала HAS-BLED).</p>
              </div>
            </>
          )}

          {/* ── Child-Pugh ───────────────────────────────────────────────────────── */}
          {active === 'childpugh' && (
            <>
              <div className="lc-card">
                <div className="lc-card-ttl">🫁 Child-Pugh — тяжесть цирроза печени</div>
                <div className="lc-card-sub">Классификация тяжести цирроза по 5 критериям. Класс A (5–6 б.), B (7–9 б.), C (10–15 б.).</div>
                <div className="lc-row3">
                  <div className="lc-field">
                    <label className="lc-label">Билирубин общий</label>
                    <input className="lc-input" type="number" placeholder="20" value={cpBili} onChange={e=>setCpBili(e.target.value)} />
                    <span className="lc-sublabel">мкмоль/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Альбумин</label>
                    <input className="lc-input" type="number" placeholder="38" value={cpAlb} onChange={e=>setCpAlb(e.target.value)} />
                    <span className="lc-sublabel">г/л</span>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Удлинение ПВ</label>
                    <input className="lc-input" type="number" placeholder="2" value={cpPt} onChange={e=>setCpPt(e.target.value)} />
                    <span className="lc-sublabel">секунд</span>
                  </div>
                </div>
                <div className="lc-row">
                  <div className="lc-field">
                    <label className="lc-label">Асцит</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {([['Нет', 0], ['Лёгкий (поддаётся лечению)', 1], ['Напряжённый (рефрактерный)', 2]] as [string, number][]).map(([l, v]) => (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                          <input type="radio" name="cpAscites" checked={cpAscites===v} onChange={()=>setCpAscites(v)}
                            style={{ width: 15, height: 15, accentColor: '#6B1F2A' }} />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="lc-field">
                    <label className="lc-label">Печёночная энцефалопатия</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {([['Нет', 0], ['I–II степень (лёгкая)', 1], ['III–IV степень (тяжёлая)', 2]] as [string, number][]).map(([l, v]) => (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                          <input type="radio" name="cpEnc" checked={cpEnc===v} onChange={()=>setCpEnc(v)}
                            style={{ width: 15, height: 15, accentColor: '#6B1F2A' }} />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="lc-btn" onClick={()=>{
                  clearError('childpugh')
                  if(!cpBili||!cpAlb||!cpPt){setError('childpugh','Заполните все числовые поля');return}
                  const bili=parseFloat(cpBili),alb=parseFloat(cpAlb),pt=parseFloat(cpPt)
                  if(bili<=0||alb<=0||pt<0){setError('childpugh','Проверьте введённые значения');return}
                  setCpResult(calcChildPugh(bili,alb,pt,cpAscites,cpEnc))
                }}>Рассчитать Child-Pugh</button>
                {errors.childpugh && <div className="lc-error">{errors.childpugh}</div>}
                {cpResult && (
                  <div className="lc-result" style={{ background: cpResult.bg, color: cpResult.color }}>
                    <div className="lc-result-left">
                      <div className="lc-result-val">Класс {cpResult.cls}<span className="lc-result-unit"> ({cpResult.score} б.)</span></div>
                      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>1 год: {cpResult.survival1yr} · 2 года: {cpResult.survival2yr}</div>
                      <button className="lc-reset" style={{ color: cpResult.color }} onClick={()=>setCpResult(null)}>← заново</button>
                    </div>
                    <div className="lc-result-right">
                      <div className="lc-result-desc">{cpResult.desc}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lc-info">
                <div className="lc-info-ttl">О шкале Child-Pugh</div>
                <p className="lc-info-p">Шкала Child-Turcotte-Pugh оценивает тяжесть цирроза по 5 параметрам. Каждый оценивается 1–3 баллами. Класс A (5–6 баллов) — компенсированный цирроз, хорошая переносимость операций. Класс B (7–9) — субкомпенсация, повышенный операционный риск. Класс C (10–15) — декомпенсация.</p>
                <p className="lc-info-p" style={{ marginBottom: 0 }}>Удлинение протромбинового времени вводится как разница со стандартом (нормой), в секундах. Класс C — абсолютное показание для рассмотрения трансплантации печени.</p>
              </div>
            </>
          )}


          <div className="lc-ad-box">
            <div className="lc-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_lab_1" className="lc-ad-slot">Реклама РСЯ — блок 1</div>
          </div>

          <div className="lc-ad-box">
            <div className="lc-ad-label">Реклама</div>
            <div id="yandex_rtb_calc_lab_2" className="lc-ad-slot">Реклама РСЯ — блок 2</div>
          </div>

        </div>
      </div>

      <div className="lc-ad-under">
        <div className="lc-ad-under-in">
          <div className="lc-ad-label">Реклама</div>
          <div id="yandex_rtb_calc_lab_under" className="lc-ad-under-slot">Реклама под калькулятором (горизонтальный баннер РСЯ 728×90)</div>
        </div>
      </div>

      
    </>
  )
}
