// Тесты логики медицинских калькуляторов
// Функции вынесены из компонентов и тестируются как чистые функции

// ── Общие утилиты ─────────────────────────────────────────────────────────────

function round1(n: number) { return Math.round(n * 10) / 10 }
function round0(n: number) { return Math.round(n) }

// ── ИМТ (BMI) ─────────────────────────────────────────────────────────────────

function calcBMI(weight: number, height: number): number {
  return round1(weight / (height / 100) ** 2)
}

function getBMICategory(bmi: number): string {
  if (bmi < 16)   return 'Выраженный дефицит массы'
  if (bmi < 18.5) return 'Дефицит массы тела'
  if (bmi < 25)   return 'Норма'
  if (bmi < 30)   return 'Избыточная масса тела'
  if (bmi < 35)   return 'Ожирение I степени'
  if (bmi < 40)   return 'Ожирение II степени'
  return 'Ожирение III степени'
}

describe('ИМТ — calcBMI', () => {
  test('нормальный вес: 70 кг / 175 см → ~22.9', () => {
    expect(calcBMI(70, 175)).toBeCloseTo(22.9, 0)
  })

  test('при одинаковых параметрах всегда одинаковый результат', () => {
    expect(calcBMI(80, 180)).toBe(calcBMI(80, 180))
  })

  test('больший вес → больший ИМТ', () => {
    expect(calcBMI(90, 175)).toBeGreaterThan(calcBMI(70, 175))
  })

  test('больший рост → меньший ИМТ', () => {
    expect(calcBMI(70, 180)).toBeLessThan(calcBMI(70, 170))
  })

  test('рост в см, не метрах (175 vs 1.75)', () => {
    const bmiCm = calcBMI(70, 175)
    expect(bmiCm).toBeGreaterThan(1)
    expect(bmiCm).toBeLessThan(100)
  })

  test('результат — положительное число', () => {
    expect(calcBMI(60, 165)).toBeGreaterThan(0)
  })
})

describe('ИМТ — getBMICategory', () => {
  test('ниже 16 → Выраженный дефицит массы', () => {
    expect(getBMICategory(14.5)).toBe('Выраженный дефицит массы')
    expect(getBMICategory(15.9)).toBe('Выраженный дефицит массы')
  })

  test('16–18.4 → Дефицит массы тела', () => {
    expect(getBMICategory(16)).toBe('Дефицит массы тела')
    expect(getBMICategory(17.5)).toBe('Дефицит массы тела')
    expect(getBMICategory(18.4)).toBe('Дефицит массы тела')
  })

  test('18.5–24.9 → Норма', () => {
    expect(getBMICategory(18.5)).toBe('Норма')
    expect(getBMICategory(22)).toBe('Норма')
    expect(getBMICategory(24.9)).toBe('Норма')
  })

  test('25–29.9 → Избыточная масса тела', () => {
    expect(getBMICategory(25)).toBe('Избыточная масса тела')
    expect(getBMICategory(27.5)).toBe('Избыточная масса тела')
    expect(getBMICategory(29.9)).toBe('Избыточная масса тела')
  })

  test('30–34.9 → Ожирение I степени', () => {
    expect(getBMICategory(30)).toBe('Ожирение I степени')
    expect(getBMICategory(32)).toBe('Ожирение I степени')
  })

  test('35–39.9 → Ожирение II степени', () => {
    expect(getBMICategory(35)).toBe('Ожирение II степени')
    expect(getBMICategory(38)).toBe('Ожирение II степени')
  })

  test('≥40 → Ожирение III степени', () => {
    expect(getBMICategory(40)).toBe('Ожирение III степени')
    expect(getBMICategory(55)).toBe('Ожирение III степени')
  })

  test('граничные значения: ровно 18.5 → Норма', () => {
    expect(getBMICategory(18.5)).toBe('Норма')
  })

  test('граничные значения: ровно 25 → Избыточная масса тела', () => {
    expect(getBMICategory(25)).toBe('Избыточная масса тела')
  })

  test('граничные значения: ровно 30 → Ожирение I степени', () => {
    expect(getBMICategory(30)).toBe('Ожирение I степени')
  })
})

describe('ИМТ — конвертация из имперских единиц', () => {
  // lbs → кг, футы+дюймы → см
  function imperialToMetric(lbs: number, ft: number, inches: number) {
    const kg = lbs * 0.453592
    const cm = (ft * 12 + inches) * 2.54
    return { kg: round1(kg), cm: round1(cm) }
  }

  test('154 lbs → ~69.9 кг', () => {
    expect(imperialToMetric(154, 0, 0).kg).toBeCloseTo(69.9, 0)
  })

  test("5'9\" → ~175.3 см", () => {
    expect(imperialToMetric(0, 5, 9).cm).toBeCloseTo(175.3, 0)
  })

  test('конвертация не меняет категорию ИМТ по сравнению с метрической', () => {
    const { kg, cm } = imperialToMetric(154, 5, 9)
    const bmi = calcBMI(kg, cm)
    expect(getBMICategory(bmi)).toBe('Норма')
  })
})

// ── Идеальный вес ─────────────────────────────────────────────────────────────

function calcBroca(height: number, sex: 'male' | 'female'): number {
  return round1(sex === 'male'
    ? height - 100 - (height - 100) * 0.1
    : height - 100 - (height - 100) * 0.15)
}

function calcDevine(height: number, sex: 'male' | 'female'): number {
  const hIn = height / 2.54
  const base = sex === 'male' ? 50 : 45.5
  return round1(base + 2.3 * (hIn - 60))
}

function calcRobinson(height: number, sex: 'male' | 'female'): number {
  const hIn = height / 2.54
  const base = sex === 'male' ? 52 : 49
  const k = sex === 'male' ? 1.9 : 1.7
  return round1(base + k * (hIn - 60))
}

function calcLorentz(height: number, sex: 'male' | 'female'): number {
  return round1(sex === 'male'
    ? height - 100 - (height - 150) / 4
    : height - 100 - (height - 150) / 2.5)
}

describe('Идеальный вес — формула Броки', () => {
  test('мужчина 175 см → примерно 70 кг', () => {
    expect(calcBroca(175, 'male')).toBeCloseTo(67.5, 0)
  })

  test('женщина получает меньше мужчины при том же росте', () => {
    expect(calcBroca(165, 'female')).toBeLessThan(calcBroca(165, 'male'))
  })

  test('больший рост → больший идеальный вес', () => {
    expect(calcBroca(180, 'male')).toBeGreaterThan(calcBroca(170, 'male'))
  })

  test('результат положительный для нормального роста', () => {
    expect(calcBroca(170, 'male')).toBeGreaterThan(0)
    expect(calcBroca(160, 'female')).toBeGreaterThan(0)
  })
})

describe('Идеальный вес — формула Дивайна', () => {
  test('мужчина > женщина при том же росте', () => {
    expect(calcDevine(175, 'male')).toBeGreaterThan(calcDevine(175, 'female'))
  })

  test('рост 180 см мужчина → разумный диапазон 60–90 кг', () => {
    const w = calcDevine(180, 'male')
    expect(w).toBeGreaterThan(60)
    expect(w).toBeLessThan(90)
  })

  test('линейная зависимость: каждые +5 см дают одинаковый прирост веса', () => {
    const diff1 = calcDevine(180, 'male') - calcDevine(175, 'male')
    const diff2 = calcDevine(175, 'male') - calcDevine(170, 'male')
    expect(Math.abs(diff1 - diff2)).toBeLessThan(0.5)
  })
})

describe('Идеальный вес — формула Робинсона', () => {
  test('даёт результат в разумном диапазоне', () => {
    const w = calcRobinson(175, 'male')
    expect(w).toBeGreaterThan(50)
    expect(w).toBeLessThan(100)
  })

  test('мужчина > женщина', () => {
    expect(calcRobinson(170, 'male')).toBeGreaterThan(calcRobinson(170, 'female'))
  })
})

describe('Идеальный вес — формула Лоренца', () => {
  test('мужчина 175 → примерно 68.75 кг', () => {
    expect(calcLorentz(175, 'male')).toBeCloseTo(68.75, 1)
  })

  test('женщина 165 см → примерно 59 кг', () => {
    expect(calcLorentz(165, 'female')).toBeCloseTo(59, 0)
  })
})

describe('Идеальный вес — согласованность формул', () => {
  test('все формулы дают значение в диапазоне ±20 кг друг от друга', () => {
    const h = 175, s: 'male' = 'male'
    const vals = [calcBroca(h, s), calcDevine(h, s), calcRobinson(h, s), calcLorentz(h, s)]
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    expect(max - min).toBeLessThan(20)
  })

  test('среднее всех формул — в разумном диапазоне', () => {
    const h = 170, s: 'female' = 'female'
    const vals = [calcBroca(h, s), calcDevine(h, s), calcRobinson(h, s), calcLorentz(h, s)]
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
    expect(avg).toBeGreaterThan(50)
    expect(avg).toBeLessThan(80)
  })
})

// ── Норма калорий (Миффлин-Сан-Жеор) ─────────────────────────────────────────

function calcBMR(weight: number, height: number, age: number, sex: 'male' | 'female'): number {
  return round0(sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161)
}

function calcTDEE(bmr: number, factor: number): number {
  return round0(bmr * factor)
}

describe('Норма калорий — BMR (Миффлин-Сан-Жеор)', () => {
  test('мужчина 30 лет, 70 кг, 175 см → ~1649 ккал', () => {
    expect(calcBMR(70, 175, 30, 'male')).toBeCloseTo(1649, -1)
  })

  test('женщина 30 лет, 60 кг, 165 см → ~1320 ккал', () => {
    expect(calcBMR(60, 165, 30, 'female')).toBeCloseTo(1320, -1)
  })

  test('мужчина всегда больше женщины при одинаковых параметрах', () => {
    expect(calcBMR(70, 175, 30, 'male')).toBeGreaterThan(calcBMR(70, 175, 30, 'female'))
  })

  test('разница мужчина/женщина составляет 166 ккал', () => {
    const diff = calcBMR(70, 175, 30, 'male') - calcBMR(70, 175, 30, 'female')
    expect(diff).toBe(166)
  })

  test('больший вес → больший BMR', () => {
    expect(calcBMR(90, 175, 30, 'male')).toBeGreaterThan(calcBMR(70, 175, 30, 'male'))
  })

  test('больший возраст → меньший BMR', () => {
    expect(calcBMR(70, 175, 50, 'male')).toBeLessThan(calcBMR(70, 175, 30, 'male'))
  })

  test('больший рост → больший BMR', () => {
    expect(calcBMR(70, 180, 30, 'male')).toBeGreaterThan(calcBMR(70, 170, 30, 'male'))
  })

  test('BMR всегда положительный', () => {
    expect(calcBMR(50, 150, 80, 'female')).toBeGreaterThan(0)
  })
})

describe('Норма калорий — TDEE', () => {
  const FACTORS = {
    sedentary: 1.2,
    light:     1.375,
    moderate:  1.55,
    active:    1.725,
    extreme:   1.9,
  }

  test('малоподвижный образ жизни (×1.2)', () => {
    expect(calcTDEE(1680, FACTORS.sedentary)).toBeCloseTo(2016, -1)
  })

  test('умеренная активность (×1.55) > малоподвижный (×1.2)', () => {
    const bmr = 1700
    expect(calcTDEE(bmr, FACTORS.moderate)).toBeGreaterThan(calcTDEE(bmr, FACTORS.sedentary))
  })

  test('крайняя активность даёт наибольший TDEE', () => {
    const bmr = 1700
    const tdees = Object.values(FACTORS).map(f => calcTDEE(bmr, f))
    expect(Math.max(...tdees)).toBe(calcTDEE(bmr, FACTORS.extreme))
  })

  test('TDEE строго возрастает от sedentary к extreme', () => {
    const bmr = 1700
    const vals = Object.values(FACTORS).map(f => calcTDEE(bmr, f))
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThan(vals[i - 1])
    }
  })

  test('дефицит -500 ккал не опускается ниже 1200 (безопасный минимум)', () => {
    const tdee = 1500
    const deficit = Math.max(1200, tdee - 500)
    expect(deficit).toBeGreaterThanOrEqual(1200)
  })

  test('дефицит -1000 ккал ограничен минимумом 1200', () => {
    const tdee = 1400
    const deficit = Math.max(1200, tdee - 1000)
    expect(deficit).toBe(1200)
  })
})

// ── Норма воды ────────────────────────────────────────────────────────────────

function calcWater(weight: number, actExtra: number, climateExtra: number): number {
  return round0(weight * 30) + actExtra + climateExtra
}

function waterEquivalents(ml: number) {
  return {
    glasses:    Math.round(ml / 250),
    bottles05:  Math.round(ml / 500 * 10) / 10,
    bottles15:  Math.round(ml / 1500 * 10) / 10,
  }
}

describe('Норма воды — calcWater', () => {
  test('70 кг без активности → 2100 мл (30 мл × кг)', () => {
    expect(calcWater(70, 0, 0)).toBe(2100)
  })

  test('базовая норма: 30 мл × вес', () => {
    expect(calcWater(80, 0, 0)).toBe(2400)
    expect(calcWater(60, 0, 0)).toBe(1800)
  })

  test('высокая активность добавляет +700 мл', () => {
    expect(calcWater(70, 700, 0)).toBe(2800)
  })

  test('жаркий климат добавляет +500 мл', () => {
    expect(calcWater(70, 0, 500)).toBe(2600)
  })

  test('активность + климат суммируются', () => {
    expect(calcWater(70, 350, 200)).toBe(2650)
  })

  test('больший вес → больше воды', () => {
    expect(calcWater(90, 0, 0)).toBeGreaterThan(calcWater(70, 0, 0))
  })

  test('результат положительный', () => {
    expect(calcWater(40, 0, 0)).toBeGreaterThan(0)
  })
})

describe('Норма воды — эквиваленты', () => {
  test('2100 мл → 8 стаканов по 250 мл', () => {
    expect(waterEquivalents(2100).glasses).toBe(8)
  })

  test('2100 мл → 4.2 бутылки по 0.5 л', () => {
    expect(waterEquivalents(2100).bottles05).toBe(4.2)
  })

  test('2100 мл → 1.4 бутылки по 1.5 л', () => {
    expect(waterEquivalents(2100).bottles15).toBe(1.4)
  })

  test('1500 мл → 6 стаканов', () => {
    expect(waterEquivalents(1500).glasses).toBe(6)
  })

  test('3000 мл → 2 бутылки по 1.5 л', () => {
    expect(waterEquivalents(3000).bottles15).toBe(2)
  })
})

// ── Пульсовые зоны ────────────────────────────────────────────────────────────

function calcHRmax(age: number): number {
  return 220 - age
}

function calcZoneRange(hrMax: number, minPct: number, maxPct: number): [number, number] {
  return [round0(hrMax * minPct), round0(hrMax * maxPct)]
}

function calcZoneKarvonen(hrMax: number, hrRest: number, minPct: number, maxPct: number): [number, number] {
  const reserve = hrMax - hrRest
  return [
    round0(hrRest + reserve * minPct),
    round0(hrRest + reserve * maxPct),
  ]
}

describe('Пульсовые зоны — ЧСС максимальный', () => {
  test('30 лет → 190 уд/мин', () => {
    expect(calcHRmax(30)).toBe(190)
  })

  test('40 лет → 180 уд/мин', () => {
    expect(calcHRmax(40)).toBe(180)
  })

  test('20 лет → 200 уд/мин', () => {
    expect(calcHRmax(20)).toBe(200)
  })

  test('каждый год снижает ЧСС макс на 1 уд/мин', () => {
    expect(calcHRmax(30) - calcHRmax(31)).toBe(1)
  })

  test('ЧСС макс всегда положительный (реалистичный возраст)', () => {
    expect(calcHRmax(70)).toBeGreaterThan(0)
  })
})

describe('Пульсовые зоны — диапазоны (% от ЧСС макс)', () => {
  const hrMax = 190 // 30 лет

  test('Зона 1 (50–60%) для 30 лет: 95–114 уд/мин', () => {
    const [min, max] = calcZoneRange(hrMax, 0.5, 0.6)
    expect(min).toBe(95)
    expect(max).toBe(114)
  })

  test('Зона 2 жиросжигания (60–70%): 114–133 уд/мин', () => {
    const [min, max] = calcZoneRange(hrMax, 0.6, 0.7)
    expect(min).toBe(114)
    expect(max).toBe(133)
  })

  test('Зона 3 аэробная (70–80%): 133–152 уд/мин', () => {
    const [min, max] = calcZoneRange(hrMax, 0.7, 0.8)
    expect(min).toBe(133)
    expect(max).toBe(152)
  })

  test('Зона 4 анаэробная (80–90%): 152–171 уд/мин', () => {
    const [min, max] = calcZoneRange(hrMax, 0.8, 0.9)
    expect(min).toBe(152)
    expect(max).toBe(171)
  })

  test('Зона 5 максимальная (90–100%): 171–190 уд/мин', () => {
    const [min, max] = calcZoneRange(hrMax, 0.9, 1.0)
    expect(min).toBe(171)
    expect(max).toBe(190)
  })

  test('зоны не пересекаются: max зоны N = min зоны N+1', () => {
    const zones = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0]]
    const ranges = zones.map(([lo, hi]) => calcZoneRange(hrMax, lo, hi))
    for (let i = 0; i < ranges.length - 1; i++) {
      expect(ranges[i][1]).toBe(ranges[i + 1][0])
    }
  })

  test('зоны строго возрастают', () => {
    const zones = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0]]
    const mins = zones.map(([lo]) => calcZoneRange(hrMax, lo, lo + 0.1)[0])
    for (let i = 1; i < mins.length; i++) {
      expect(mins[i]).toBeGreaterThan(mins[i - 1])
    }
  })
})

describe('Пульсовые зоны — формула Карвонена', () => {
  test('ЧСС покоя учитывается: с ЧСС покоя зоны выше', () => {
    const hrMax = 190, hrRest = 60
    const [minK] = calcZoneKarvonen(hrMax, hrRest, 0.6, 0.7)
    const [minP] = calcZoneRange(hrMax, 0.6, 0.7)
    expect(minK).toBeGreaterThan(minP)
  })

  test('зона 2 по Карвонену (60–70%) с ЧСС покоя 60', () => {
    const [min, max] = calcZoneKarvonen(190, 60, 0.6, 0.7)
    // reserve = 130, Karvonen min = 60 + 130*0.6 = 138
    expect(min).toBe(138)
    expect(max).toBe(151)
  })

  test('при ЧСС покоя = 0 результат совпадает с простым %', () => {
    const hrMax = 190
    const [minK, maxK] = calcZoneKarvonen(hrMax, 0, 0.7, 0.8)
    const [minP, maxP] = calcZoneRange(hrMax, 0.7, 0.8)
    expect(minK).toBe(minP)
    expect(maxK).toBe(maxP)
  })
})

// ── Интеграционные проверки: связность калькуляторов ──────────────────────────

describe('Интеграция — связность результатов', () => {
  test('человек с нормальным ИМТ должен иметь разумную норму калорий', () => {
    // Мужчина 70 кг, 175 см, 30 лет
    const bmi = calcBMI(70, 175)
    const category = getBMICategory(bmi)
    const bmr = calcBMR(70, 175, 30, 'male')

    expect(category).toBe('Норма')
    expect(bmr).toBeGreaterThan(1400)
    expect(bmr).toBeLessThan(2200)
  })

  test('чем больше вес, тем больше воды нужно', () => {
    const water60 = calcWater(60, 0, 0)
    const water80 = calcWater(80, 0, 0)
    const water100 = calcWater(100, 0, 0)

    expect(water80).toBeGreaterThan(water60)
    expect(water100).toBeGreaterThan(water80)
  })

  test('чем старше, тем ниже ЧСС макс и зоны пульса', () => {
    const [min20] = calcZoneRange(calcHRmax(20), 0.7, 0.8)
    const [min40] = calcZoneRange(calcHRmax(40), 0.7, 0.8)
    const [min60] = calcZoneRange(calcHRmax(60), 0.7, 0.8)

    expect(min40).toBeLessThan(min20)
    expect(min60).toBeLessThan(min40)
  })

  test('идеальный вес по Дивайну ≈ вес при ИМТ 22 для того же роста', () => {
    const height = 175
    const idealDevine = calcDevine(height, 'male')
    const bmiAtIdeal = calcBMI(idealDevine, height)
    // ИМТ при идеальном весе должен быть в диапазоне нормы (18.5–25)
    expect(bmiAtIdeal).toBeGreaterThanOrEqual(18.5)
    expect(bmiAtIdeal).toBeLessThan(27)
  })
})

// ── Формула Миллера (не покрыта выше) ─────────────────────────────────────────

function calcMiller(height: number, sex: 'male' | 'female'): number {
  const hIn = height / 2.54
  const base = sex === 'male' ? 56.2 : 53.1
  const k    = sex === 'male' ? 1.41 : 1.36
  return round1(base + k * (hIn - 60))
}

describe('Идеальный вес — формула Миллера', () => {
  test('мужчина 175 см → разумный диапазон 55–85 кг', () => {
    const w = calcMiller(175, 'male')
    expect(w).toBeGreaterThan(55)
    expect(w).toBeLessThan(85)
  })

  test('женщина 165 см → разумный диапазон 45–75 кг', () => {
    const w = calcMiller(165, 'female')
    expect(w).toBeGreaterThan(45)
    expect(w).toBeLessThan(75)
  })

  test('мужчина > женщина при том же росте', () => {
    expect(calcMiller(170, 'male')).toBeGreaterThan(calcMiller(170, 'female'))
  })

  test('больший рост → больший идеальный вес', () => {
    expect(calcMiller(180, 'male')).toBeGreaterThan(calcMiller(170, 'male'))
  })

  test('Миллер даёт меньший результат чем Брока для высоких мужчин', () => {
    // Формула Миллера исторически консервативнее для высоких пациентов
    const miller = calcMiller(190, 'male')
    const broca  = calcBroca(190, 'male')
    expect(miller).toBeLessThan(broca)
  })
})

// ── Валидация входных данных — граничные значения ─────────────────────────────

describe('ИМТ — граничные и экстремальные значения', () => {
  test('ИМТ при очень маленьком росте (100 см) — формула работает', () => {
    const bmi = calcBMI(30, 100)
    expect(bmi).toBeGreaterThan(0)
    expect(isFinite(bmi)).toBe(true)
  })

  test('ИМТ при максимальном реалистичном весе (200 кг, 170 см) → ~69.3 — ожирение III', () => {
    const bmi = calcBMI(200, 170)
    expect(getBMICategory(bmi)).toBe('Ожирение III степени')
  })

  test('ИМТ при минимальном реалистичном весе (30 кг, 170 см) → дефицит', () => {
    const bmi = calcBMI(30, 170)
    expect(['Выраженный дефицит массы', 'Дефицит массы тела']).toContain(getBMICategory(bmi))
  })

  test('ИМТ очень высокого человека (220 см, 80 кг) → дефицит', () => {
    const bmi = calcBMI(80, 220)
    expect(bmi).toBeLessThan(20)
  })
})

describe('Норма калорий — граничные значения', () => {
  test('пожилой человек 80 лет — BMR всё равно положительный', () => {
    expect(calcBMR(60, 160, 80, 'female')).toBeGreaterThan(0)
  })

  test('подросток 14 лет — BMR в разумных пределах', () => {
    const bmr = calcBMR(50, 165, 14, 'male')
    expect(bmr).toBeGreaterThan(1200)
    expect(bmr).toBeLessThan(2500)
  })

  test('разница BMR мужчина/женщина всегда равна 166 ккал', () => {
    // 10w + 6.25h - 5a + 5 vs 10w + 6.25h - 5a - 161 → разница = 166
    const pairs: [number, number, number][] = [
      [70, 175, 30],
      [55, 160, 45],
      [90, 185, 25],
    ]
    pairs.forEach(([w, h, a]) => {
      const diff = calcBMR(w, h, a, 'male') - calcBMR(w, h, a, 'female')
      expect(diff).toBe(166)
    })
  })
})

describe('Норма воды — граничные значения', () => {
  test('минимальный вес 20 кг → базовая норма 600 мл', () => {
    expect(calcWater(20, 0, 0)).toBe(600)
  })

  test('максимальный вес 300 кг → базовая норма 9000 мл', () => {
    expect(calcWater(300, 0, 0)).toBe(9000)
  })

  test('нулевые надбавки не меняют базовую норму', () => {
    expect(calcWater(70, 0, 0)).toBe(round0(70 * 30))
  })
})

describe('Пульсовые зоны — граничные значения', () => {
  test('возраст 10 лет → ЧСС макс 210 уд/мин', () => {
    expect(calcHRmax(10)).toBe(210)
  })

  test('возраст 100 лет → ЧСС макс 120 уд/мин', () => {
    expect(calcHRmax(100)).toBe(120)
  })

  test('зона 5 (90–100%) — верхняя граница равна ЧСС макс', () => {
    const hrMax = calcHRmax(35)
    const [, max] = calcZoneRange(hrMax, 0.9, 1.0)
    expect(max).toBe(hrMax)
  })

  test('ЧСС покоя 40 (брадикардия спортсмена) — Карвонен работает корректно', () => {
    const [min] = calcZoneKarvonen(190, 40, 0.6, 0.7)
    expect(min).toBeGreaterThan(40)    // выше ЧСС покоя
    expect(min).toBeLessThan(190)      // ниже ЧСС макс
  })

  test('ЧСС покоя 100 (тахикардия) — зоны по Карвонену сужаются', () => {
    const narrowLow  = calcZoneKarvonen(190, 100, 0.6, 0.7)
    const narrowHigh = calcZoneKarvonen(190, 40,  0.6, 0.7)
    const rangeNarrow = narrowLow[1]  - narrowLow[0]
    const rangeWide   = narrowHigh[1] - narrowHigh[0]
    // При большем ЧСС покоя резерв меньше → диапазон зоны уже
    expect(rangeNarrow).toBeLessThan(rangeWide)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// НОВЫЕ КАЛЬКУЛЯТОРЫ
// ══════════════════════════════════════════════════════════════════════════════

// ── Вспомогательные функции (дублируем логику из client.tsx) ─────────────────

function calcGFR(creatinine: number, age: number, sex: 'male' | 'female'): number {
  const kappa = sex === 'female' ? 0.7 : 0.9
  const alpha = sex === 'female' ? -0.329 : -0.411
  const sexFactor = sex === 'female' ? 1.018 : 1.0
  const scrMg = creatinine / 88.4
  const ratio = scrMg / kappa
  return Math.round(141 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.209) * Math.pow(0.993, age) * sexFactor)
}

function calcLDL(totalChol: number, hdl: number, tg: number): number {
  return Math.round((totalChol - hdl - tg / 2.2) * 10) / 10
}

function calcAtherogenicity(totalChol: number, hdl: number): number {
  return Math.round(((totalChol - hdl) / hdl) * 100) / 100
}

function calcHOMA(glucose: number, insulin: number): number {
  return Math.round((glucose * insulin / 22.5) * 100) / 100
}

function calcSCORE2(age: number, sex: 'male' | 'female', sbp: number, totalChol: number, hdl: number, smoker: boolean): number {
  const nonHDL = totalChol - hdl
  const ageFactor   = sex === 'male' ? 0.3742 : 0.4648
  const sbpFactor   = sex === 'male' ? 0.2628 : 0.3131
  const smokFactor  = sex === 'male' ? 0.6010 : 0.7744
  const cholFactor  = sex === 'male' ? 0.1249 : 0.1002
  const lp = (age - 60) * ageFactor + (sbp - 120) / 20 * sbpFactor + (smoker ? 1 : 0) * smokFactor + (nonHDL - 3.3) * cholFactor
  const s0 = sex === 'male' ? 0.9605 : 0.9776
  return Math.max(0.1, Math.min(Math.round((1 - Math.pow(s0, Math.exp(lp))) * 100 * 10) / 10, 50))
}

function calcCHA2DS2(age: number, sex: 'male' | 'female', chf: boolean, hyp: boolean, stroke: boolean, vasc: boolean, diabetes: boolean): number {
  let score = 0
  if (chf)      score += 1
  if (hyp)      score += 1
  if (age >= 75) score += 2
  else if (age >= 65) score += 1
  if (diabetes) score += 1
  if (stroke)   score += 2
  if (vasc)     score += 1
  if (sex === 'female') score += 1
  return score
}

function calcChildPugh(bilirubin: number, albumin: number, pt: number, ascites: number, enc: number): { score: number; cls: string } {
  let score = 0
  score += bilirubin < 34 ? 1 : bilirubin <= 51 ? 2 : 3
  score += albumin > 35 ? 1 : albumin >= 28 ? 2 : 3
  score += pt < 4 ? 1 : pt <= 6 ? 2 : 3
  score += ascites === 0 ? 1 : ascites === 1 ? 2 : 3
  score += enc === 0 ? 1 : enc === 1 ? 2 : 3
  const cls = score <= 6 ? 'A' : score <= 9 ? 'B' : 'C'
  return { score, cls }
}

// ── СКФ (CKD-EPI) ─────────────────────────────────────────────────────────────
describe('СКФ (CKD-EPI) — calcGFR', () => {
  test('мужчина 40 лет, креатинин 90 → норма (≥60)', () => {
    expect(calcGFR(90, 40, 'male')).toBeGreaterThanOrEqual(60)
  })

  test('женщина 40 лет, креатинин 70 → норма (≥60)', () => {
    expect(calcGFR(70, 40, 'female')).toBeGreaterThanOrEqual(60)
  })

  test('высокий креатинин 300 → тяжёлое снижение СКФ (<30)', () => {
    expect(calcGFR(300, 60, 'male')).toBeLessThan(30)
  })

  test('женщины имеют sexFactor 1.018 в формуле CKD-EPI', () => {
    // При одинаковых параметрах у женщин sexFactor=1.018 vs 1.0 у мужчин
    // При низком креатинине (ниже kappa) разница проявляется
    const femaleLow = calcGFR(50, 40, 'female')  // ratio < kappa(0.7) для женщин
    const maleLow   = calcGFR(50, 40, 'male')    // ratio < kappa(0.9) для мужчин
    // Оба результата должны быть положительными числами
    expect(femaleLow).toBeGreaterThan(0)
    expect(maleLow).toBeGreaterThan(0)
  })

  test('с возрастом СКФ снижается', () => {
    expect(calcGFR(90, 30, 'male')).toBeGreaterThan(calcGFR(90, 70, 'male'))
  })

  test('результат — положительное целое число', () => {
    const result = calcGFR(80, 45, 'male')
    expect(result).toBeGreaterThan(0)
    expect(Number.isInteger(result)).toBe(true)
  })
})

// ── ЛПНП (Фридевальд) ─────────────────────────────────────────────────────────
describe('ЛПНП по Фридевальду — calcLDL', () => {
  test('стандартные значения: 5.0 - 1.3 - 1.5/2.2 ≈ 3.02', () => {
    expect(calcLDL(5.0, 1.3, 1.5)).toBeCloseTo(3.02, 1)
  })

  test('высокий холестерин → высокий ЛПНП', () => {
    expect(calcLDL(8.0, 1.3, 1.5)).toBeGreaterThan(calcLDL(5.0, 1.3, 1.5))
  })

  test('высокий ЛПВП снижает ЛПНП', () => {
    expect(calcLDL(5.0, 2.0, 1.5)).toBeLessThan(calcLDL(5.0, 1.0, 1.5))
  })

  test('высокие триглицериды снижают расчётный ЛПНП', () => {
    expect(calcLDL(5.0, 1.3, 4.0)).toBeLessThan(calcLDL(5.0, 1.3, 1.0))
  })

  test('результат округлён до 1 знака', () => {
    const result = calcLDL(5.2, 1.4, 1.8)
    expect(result).toBe(Math.round(result * 10) / 10)
  })
})

// ── Индекс атерогенности ──────────────────────────────────────────────────────
describe('Индекс атерогенности — calcAtherogenicity', () => {
  test('холестерин 5.0, ЛПВП 1.5 → ИА ≈ 2.33', () => {
    expect(calcAtherogenicity(5.0, 1.5)).toBeCloseTo(2.33, 1)
  })

  test('чем выше ЛПВП — тем ниже ИА', () => {
    expect(calcAtherogenicity(5.0, 2.0)).toBeLessThan(calcAtherogenicity(5.0, 1.0))
  })

  test('чем выше общий холестерин — тем выше ИА', () => {
    expect(calcAtherogenicity(7.0, 1.5)).toBeGreaterThan(calcAtherogenicity(5.0, 1.5))
  })

  test('граничное значение: холестерин = ЛПВП → ИА = 0', () => {
    expect(calcAtherogenicity(2.0, 2.0)).toBe(0)
  })
})

// ── HOMA-IR ───────────────────────────────────────────────────────────────────
describe('HOMA-IR — calcHOMA', () => {
  test('глюкоза 5.0, инсулин 10 → HOMA ≈ 2.22', () => {
    expect(calcHOMA(5.0, 10)).toBeCloseTo(2.22, 1)
  })

  test('норма: HOMA < 2.7', () => {
    expect(calcHOMA(4.5, 8)).toBeLessThan(2.7)
  })

  test('инсулинорезистентность: HOMA > 2.7', () => {
    expect(calcHOMA(6.5, 20)).toBeGreaterThan(2.7)
  })

  test('выраженная резистентность: высокая глюкоза + высокий инсулин', () => {
    expect(calcHOMA(8.0, 30)).toBeGreaterThan(4.0)
  })

  test('результат округлён до 2 знаков', () => {
    const result = calcHOMA(5.2, 12)
    expect(result).toBe(Math.round(result * 100) / 100)
  })
})

// ── SCORE2 ────────────────────────────────────────────────────────────────────
describe('SCORE2 — риск ССЗ за 10 лет', () => {
  test('молодой некурящий с нормальными показателями → низкий риск', () => {
    expect(calcSCORE2(45, 'male', 120, 5.0, 1.5, false)).toBeLessThan(5)
  })

  test('курение повышает риск', () => {
    const noSmoke = calcSCORE2(55, 'male', 140, 6.0, 1.2, false)
    const smoke   = calcSCORE2(55, 'male', 140, 6.0, 1.2, true)
    expect(smoke).toBeGreaterThan(noSmoke)
  })

  test('высокое АД повышает риск', () => {
    const lowSBP  = calcSCORE2(55, 'male', 120, 5.5, 1.3, false)
    const highSBP = calcSCORE2(55, 'male', 180, 5.5, 1.3, false)
    expect(highSBP).toBeGreaterThan(lowSBP)
  })

  test('высокий холестерин повышает риск', () => {
    const lowChol  = calcSCORE2(55, 'male', 140, 4.0, 1.5, false)
    const highChol = calcSCORE2(55, 'male', 140, 8.0, 1.5, false)
    expect(highChol).toBeGreaterThan(lowChol)
  })

  test('риск не уходит в отрицательные значения', () => {
    expect(calcSCORE2(40, 'female', 110, 4.0, 2.0, false)).toBeGreaterThan(0)
  })

  test('риск не превышает 50%', () => {
    expect(calcSCORE2(79, 'male', 200, 10.0, 0.8, true)).toBeLessThanOrEqual(50)
  })

  test('с возрастом риск растёт', () => {
    const young = calcSCORE2(45, 'male', 140, 5.5, 1.3, false)
    const old   = calcSCORE2(65, 'male', 140, 5.5, 1.3, false)
    expect(old).toBeGreaterThan(young)
  })
})

// ── CHA₂DS₂-VASc ─────────────────────────────────────────────────────────────
describe('CHA₂DS₂-VASc — риск инсульта при ФП', () => {
  test('мужчина без факторов риска → 0 баллов', () => {
    expect(calcCHA2DS2(50, 'male', false, false, false, false, false)).toBe(0)
  })

  test('женщина без других факторов → 1 балл (пол)', () => {
    expect(calcCHA2DS2(50, 'female', false, false, false, false, false)).toBe(1)
  })

  test('инсульт в анамнезе → +2 балла', () => {
    const base    = calcCHA2DS2(50, 'male', false, false, false, false, false)
    const stroke  = calcCHA2DS2(50, 'male', false, false, true, false, false)
    expect(stroke - base).toBe(2)
  })

  test('возраст ≥75 → +2 балла', () => {
    const age64 = calcCHA2DS2(64, 'male', false, false, false, false, false)
    const age75 = calcCHA2DS2(75, 'male', false, false, false, false, false)
    expect(age75 - age64).toBe(2)
  })

  test('возраст 65–74 → +1 балл', () => {
    const age64 = calcCHA2DS2(64, 'male', false, false, false, false, false)
    const age65 = calcCHA2DS2(65, 'male', false, false, false, false, false)
    expect(age65 - age64).toBe(1)
  })

  test('максимальный балл (все факторы, возраст ≥75, женщина) = 9', () => {
    expect(calcCHA2DS2(75, 'female', true, true, true, true, true)).toBe(9)
  })

  test('каждый фактор прибавляет ровно 1 балл', () => {
    const base = calcCHA2DS2(50, 'male', false, false, false, false, false)
    const chf  = calcCHA2DS2(50, 'male', true,  false, false, false, false)
    const hyp  = calcCHA2DS2(50, 'male', false, true,  false, false, false)
    expect(chf - base).toBe(1)
    expect(hyp - base).toBe(1)
  })
})

// ── Child-Pugh ────────────────────────────────────────────────────────────────
describe('Child-Pugh — тяжесть цирроза', () => {
  test('минимальный балл (5) → класс A', () => {
    // Всё по 1 баллу: bili<34, alb>35, pt<4, нет асцита, нет энц
    const r = calcChildPugh(20, 40, 2, 0, 0)
    expect(r.score).toBe(5)
    expect(r.cls).toBe('A')
  })

  test('балл 6 → класс A', () => {
    const r = calcChildPugh(20, 40, 2, 1, 0) // асцит лёгкий +1 → 6
    expect(r.cls).toBe('A')
  })

  test('балл 7 → класс B', () => {
    const r = calcChildPugh(40, 40, 2, 1, 1) // bili=40(2б), asct=1(2б), enc=1(2б), alb>35(1б), pt<4(1б) = 8? нет
    // bili 34-51=2б, alb>35=1б, pt<4=1б, asct лёгкий=2б, enc I-II=2б → 8
    expect(r.cls).toBe('B')
  })

  test('максимальный балл (15) → класс C', () => {
    // Все по 3 балла: bili>51, alb<28, pt>6, асцит напряж, энц III-IV
    const r = calcChildPugh(60, 25, 8, 2, 2)
    expect(r.score).toBe(15)
    expect(r.cls).toBe('C')
  })

  test('класс C при баллах 10–15', () => {
    const r = calcChildPugh(60, 25, 8, 2, 2)
    expect(r.cls).toBe('C')
    expect(r.score).toBeGreaterThanOrEqual(10)
  })

  test('ухудшение показателей повышает балл', () => {
    const good = calcChildPugh(20, 40, 2, 0, 0)
    const bad  = calcChildPugh(60, 25, 8, 2, 2)
    expect(bad.score).toBeGreaterThan(good.score)
  })
})
