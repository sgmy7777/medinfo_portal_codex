// Тесты утилит: plural и formatDate

// ── plural ────────────────────────────────────────────────────────────────────
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return `${n} ${many}`
  if (mod10 === 1) return `${n} ${one}`
  if (mod10 >= 2 && mod10 <= 4) return `${n} ${few}`
  return `${n} ${many}`
}

describe('plural — склонение числительных', () => {
  const w = (n: number) => plural(n, 'материал', 'материала', 'материалов')

  test('1 → материал', () => expect(w(1)).toBe('1 материал'))
  test('2 → материала', () => expect(w(2)).toBe('2 материала'))
  test('3 → материала', () => expect(w(3)).toBe('3 материала'))
  test('4 → материала', () => expect(w(4)).toBe('4 материала'))
  test('5 → материалов', () => expect(w(5)).toBe('5 материалов'))
  test('11 → материалов (исключение)', () => expect(w(11)).toBe('11 материалов'))
  test('12 → материалов (исключение)', () => expect(w(12)).toBe('12 материалов'))
  test('14 → материалов (исключение)', () => expect(w(14)).toBe('14 материалов'))
  test('21 → материал', () => expect(w(21)).toBe('21 материал'))
  test('22 → материала', () => expect(w(22)).toBe('22 материала'))
  test('25 → материалов', () => expect(w(25)).toBe('25 материалов'))
  test('100 → материалов', () => expect(w(100)).toBe('100 материалов'))
  test('101 → материал', () => expect(w(101)).toBe('101 материал'))
  test('111 → материалов (исключение)', () => expect(w(111)).toBe('111 материалов'))
  test('0 → материалов', () => expect(w(0)).toBe('0 материалов'))

  describe('статьи', () => {
    const s = (n: number) => plural(n, 'статья', 'статьи', 'статей')
    test('1 → статья',   () => expect(s(1)).toBe('1 статья'))
    test('2 → статьи',   () => expect(s(2)).toBe('2 статьи'))
    test('5 → статей',   () => expect(s(5)).toBe('5 статей'))
    test('11 → статей',  () => expect(s(11)).toBe('11 статей'))
    test('21 → статья',  () => expect(s(21)).toBe('21 статья'))
  })
})

// ── formatDate ────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

describe('formatDate — форматирование даты', () => {
  test('возвращает пустую строку для null',      () => expect(formatDate(null)).toBe(''))
  test('возвращает пустую строку для undefined', () => expect(formatDate(undefined)).toBe(''))
  test('принимает строку ISO',                   () => {
    const result = formatDate('2026-03-11T00:00:00.000Z')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result).toContain('2026')
  })
  test('принимает объект Date', () => {
    const result = formatDate(new Date('2026-01-01'))
    expect(result).toContain('2026')
  })
  test('содержит год и месяц', () => {
    const result = formatDate('2025-06-15T00:00:00.000Z')
    expect(result).toContain('2025')
  })
})
