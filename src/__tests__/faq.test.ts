// Тесты логики buildFAQ для страниц симптомов

// Дублируем логику buildFAQ из symptoms/[slug]/page.tsx
function buildFAQ(title: string, description: string | null): Array<{q: string; a: string}> {
  const faq: Array<{q: string; a: string}> = []
  if (!description) return faq

  faq.push({ q: `Что такое симптом «${title}»?`, a: description.split('\n')[0].slice(0, 300) })

  const SECTION_LABELS: Record<string, string> = {
    'ОСНОВНЫЕ ПРИЧИНЫ':   `Каковы основные причины симптома «${title}»?`,
    'ПРИЧИНЫ':            `Каковы причины симптома «${title}»?`,
    'ТРЕВОЖНЫЕ ПРИЗНАКИ': 'Какие тревожные признаки требуют срочного обращения к врачу?',
    'КОГДА К ВРАЧУ':      'Когда нужно срочно обратиться к врачу?',
    'ДИАГНОСТИКА':        'Как диагностируется это состояние?',
    'ЛЕЧЕНИЕ':            'Как лечится это состояние?',
    'ОБСЛЕДОВАНИЕ':       'Какие анализы нужно сдать?',
    'ПРОФИЛАКТИКА':       'Как предотвратить этот симптом?',
  }

  const sections = description.split(/\n(?=[А-ЯA-Z][А-ЯA-Z\s«»()/–-]{3,}:)/u)
  for (const section of sections.slice(1)) {
    const lines = section.trim().split('\n').filter(Boolean)
    if (!lines.length) continue
    const header = lines[0].replace(/:$/, '').trim().toUpperCase()
    const body = lines.slice(1).join(' ').replace(/•\s*/g, '').slice(0, 400)
    if (!body) continue
    const question = Object.entries(SECTION_LABELS).find(([key]) => header.includes(key))?.[1]
    if (question && body.length > 30) {
      faq.push({ q: question, a: body })
    }
  }

  return faq.slice(0, 6)
}

const SAMPLE_DESC = `Головная боль — один из самых распространённых симптомов.

ОСНОВНЫЕ ПРИЧИНЫ:
• Головная боль напряжения — самый частый тип
• Мигрень — пульсирующая, сильная
• Артериальная гипертония — боль в затылке

ТРЕВОЖНЫЕ ПРИЗНАКИ:
• Внезапная громоподобная боль — субарахноидальное кровоизлияние
• Боль с температурой, ригидность шеи — менингит

ОБСЛЕДОВАНИЕ:
• Измерить АД — исключить гипертонический криз
• МРТ/КТ головного мозга при атипичной боли`

describe('buildFAQ — генерация FAQ из описания симптома', () => {
  test('возвращает пустой массив при null описании', () => {
    expect(buildFAQ('Головная боль', null)).toEqual([])
  })

  test('первый вопрос — всегда «Что такое симптом»', () => {
    const faq = buildFAQ('Головная боль', SAMPLE_DESC)
    expect(faq[0].q).toContain('Что такое симптом')
    expect(faq[0].q).toContain('Головная боль')
  })

  test('первый ответ — из первого абзаца описания', () => {
    const faq = buildFAQ('Головная боль', SAMPLE_DESC)
    expect(faq[0].a).toContain('Головная боль')
  })

  test('раздел ОСНОВНЫЕ ПРИЧИНЫ → соответствующий вопрос', () => {
    const faq = buildFAQ('Головная боль', SAMPLE_DESC)
    const causesFaq = faq.find(f => f.q.includes('причины'))
    expect(causesFaq).toBeDefined()
    expect(causesFaq!.a).toContain('напряжения')
  })

  test('раздел ТРЕВОЖНЫЕ ПРИЗНАКИ → вопрос о тревожных признаках', () => {
    const faq = buildFAQ('Головная боль', SAMPLE_DESC)
    const warnFaq = faq.find(f => f.q.includes('тревожные'))
    expect(warnFaq).toBeDefined()
    expect(warnFaq!.a).toContain('менингит')
  })

  test('раздел ОБСЛЕДОВАНИЕ → вопрос о анализах', () => {
    const faq = buildFAQ('Головная боль', SAMPLE_DESC)
    const examFaq = faq.find(f => f.q.includes('анализы'))
    expect(examFaq).toBeDefined()
  })

  test('максимум 6 вопросов', () => {
    const longDesc = SAMPLE_DESC + `

ДИАГНОСТИКА:
• МРТ головного мозга
• Анализ крови

ЛЕЧЕНИЕ:
• НПВС при напряжении
• Триптаны при мигрени

ПРОФИЛАКТИКА:
• Регулярный сон
• Ограничение кофеина`

    const faq = buildFAQ('Головная боль', longDesc)
    expect(faq.length).toBeLessThanOrEqual(6)
  })

  test('короткое описание без разделов → только 1 вопрос', () => {
    const faq = buildFAQ('Боль', 'Боль — неприятное ощущение.')
    expect(faq).toHaveLength(1)
  })

  test('секция с телом короче 30 символов → не включается в FAQ', () => {
    const desc = `Симптом.\n\nОСНОВНЫЕ ПРИЧИНЫ:\n• Кратко.`
    const faq = buildFAQ('Симптом', desc)
    // Тело "Кратко." слишком короткое → не попадёт
    expect(faq.every(f => !f.q.includes('причины'))).toBe(true)
  })

  test('название симптома используется в вопросе', () => {
    const faq = buildFAQ('Панические атаки', SAMPLE_DESC)
    expect(faq[0].q).toContain('Панические атаки')
  })
})
