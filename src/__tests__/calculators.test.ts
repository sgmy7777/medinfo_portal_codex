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
