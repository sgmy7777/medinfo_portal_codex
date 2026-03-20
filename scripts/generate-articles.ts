require('dotenv').config({ path: '.env.local' })

const ARTICLES_PLAN = [
  { title: 'Гипертония: причины, симптомы и лечение', category: 'kardiologiya', tags: ['гипертония', 'давление', 'сердце'
  // --- Дополнительные темы (слабые категории) ---
  { title: 'Зубные импланты: кому показаны и как ухаживать', category: 'stomatologiya', tags: ['импланты', 'зубы', 'стоматология'] },
  { title: 'Рак молочной железы: факторы риска и ранняя диагностика', category: 'onkologiya', tags: ['рак', 'молочная железа', 'онкология'] },
  { title: 'Простатит: симптомы, виды и эффективное лечение', category: 'urologiya', tags: ['простатит', 'урология', 'мужское здоровье'] },
  { title: 'Глаукома: как сохранить зрение при повышенном давлении в глазу', category: 'oftalmologiya', tags: ['глаукома', 'зрение', 'офтальмология'] },
  { title: 'Синдром сухого глаза: причины и современное лечение', category: 'oftalmologiya', tags: ['сухой глаз', 'зрение', 'офтальмология'] },
  { title: 'Хронический тонзиллит: лечить или удалять миндалины', category: 'lor', tags: ['тонзиллит', 'миндалины', 'лор'] },
  { title: 'Тревожное расстройство: когда тревога становится болезнью', category: 'psikhiatriya', tags: ['тревога', 'психиатрия', 'здоровье'] },
  { title: 'ХОБЛ: как замедлить прогрессирование болезни лёгких', category: 'pulmonologiya', tags: ['ХОБЛ', 'лёгкие', 'пульмонология'] },
  { title: 'Остеопороз: как сохранить кости крепкими после 50', category: 'revmatologiya', tags: ['остеопороз', 'кости', 'ревматология'] },
  { title: 'Пиелонефрит: симптомы воспаления почек и лечение', category: 'nefrologiya', tags: ['пиелонефрит', 'почки', 'нефрология'] },
] },
  { title: 'Инфаркт миокарда: первые признаки и что делать', category: 'kardiologiya', tags: ['инфаркт', 'сердце', 'скорая помощь'] },
  { title: 'Аритмия сердца: виды, симптомы и лечение', category: 'kardiologiya', tags: ['аритмия', 'сердечный ритм'] },
  { title: 'Мигрень: как отличить от обычной головной боли', category: 'nevrologiya', tags: ['мигрень', 'головная боль'] },
  { title: 'Остеохондроз шейного отдела: симптомы и лечение', category: 'nevrologiya', tags: ['остеохондроз', 'шея', 'позвоночник'] },
  { title: 'Инсульт: признаки, первая помощь и реабилитация', category: 'nevrologiya', tags: ['инсульт', 'мозг', 'реабилитация'] },
  { title: 'Гастрит: причины, симптомы и диета при лечении', category: 'gastroenterologiya', tags: ['гастрит', 'желудок', 'диета'] },
  { title: 'Синдром раздражённого кишечника: симптомы и лечение', category: 'gastroenterologiya', tags: ['кишечник', 'СРК'] },
  { title: 'Язва желудка: признаки, лечение и профилактика', category: 'gastroenterologiya', tags: ['язва', 'желудок'] },
  { title: 'Кариес: стадии развития и методы лечения', category: 'stomatologiya', tags: ['кариес', 'зубы'] },
  { title: 'Пародонтит: причины воспаления дёсен и лечение', category: 'stomatologiya', tags: ['пародонтит', 'дёсны'] },
  { title: 'Акне: причины появления прыщей и эффективное лечение', category: 'dermatologiya', tags: ['акне', 'прыщи', 'кожа'] },
  { title: 'Псориаз: симптомы, причины и современные методы лечения', category: 'dermatologiya', tags: ['псориаз', 'кожа'] },
  { title: 'Атопический дерматит у детей и взрослых', category: 'dermatologiya', tags: ['дерматит', 'аллергия', 'кожа'] },
  { title: 'ОРВИ у детей: симптомы, лечение и профилактика', category: 'pediatriya', tags: ['ОРВИ', 'дети', 'простуда'] },
  { title: 'Колики у новорождённых: причины и как помочь ребёнку', category: 'pediatriya', tags: ['колики', 'новорождённые'] },
  { title: 'Сахарный диабет 2 типа: симптомы, диета и лечение', category: 'endokrinologiya', tags: ['диабет', 'сахар', 'инсулин'] },
  { title: 'Гипотиреоз: почему снижается функция щитовидной железы', category: 'endokrinologiya', tags: ['щитовидная железа', 'гормоны'] },
  { title: 'Рак кожи: ранние признаки и когда идти к врачу', category: 'onkologiya', tags: ['меланома', 'рак', 'кожа'] },
  { title: 'Перелом: первая помощь и сроки заживления', category: 'travmatologiya', tags: ['перелом', 'кости', 'первая помощь'] },
  { title: 'Растяжение связок: симптомы и лечение в домашних условиях', category: 'travmatologiya', tags: ['растяжение', 'связки', 'травма'] },
  { title: 'Аппендицит: признаки и когда срочно вызывать скорую', category: 'khirurgiya', tags: ['аппендицит', 'живот', 'хирургия'] },
  { title: 'Мочекаменная болезнь: симптомы, лечение и профилактика', category: 'urologiya', tags: ['камни', 'почки', 'урология'] },
  { title: 'Цистит: симптомы, лечение и профилактика у женщин', category: 'urologiya', tags: ['цистит', 'мочевой пузырь'] },
  { title: 'Эндометриоз: симптомы, диагностика и методы лечения', category: 'ginekologiya', tags: ['эндометриоз', 'женское здоровье'] },
  { title: 'Синдром поликистозных яичников: симптомы и лечение', category: 'ginekologiya', tags: ['СПКЯ', 'яичники', 'гормоны'] },
  { title: 'Катаракта: симптомы, стадии и лечение помутнения хрусталика', category: 'oftalmologiya', tags: ['катаракта', 'зрение', 'глаза'] },
  { title: 'Синусит: симптомы, виды и эффективное лечение', category: 'lor', tags: ['синусит', 'нос', 'воспаление'] },
  { title: 'Отит: признаки воспаления уха и лечение', category: 'lor', tags: ['отит', 'ухо', 'воспаление'] },
  { title: 'Депрессия: симптомы, причины и методы лечения', category: 'psikhiatriya', tags: ['депрессия', 'психическое здоровье'] },
  { title: 'Панические атаки: что это такое и как с ними справляться', category: 'psikhiatriya', tags: ['панические атаки', 'тревога'] },
  { title: 'Бронхиальная астма: симптомы, триггеры и лечение', category: 'pulmonologiya', tags: ['астма', 'дыхание', 'лёгкие'] },
  { title: 'Пневмония: признаки воспаления лёгких и лечение', category: 'pulmonologiya', tags: ['пневмония', 'лёгкие', 'инфекция'] },
  { title: 'Подагра: причины, симптомы и лечение болезни суставов', category: 'revmatologiya', tags: ['подагра', 'суставы', 'мочевая кислота'] },
  { title: 'Ревматоидный артрит: симптомы, диагностика и лечение', category: 'revmatologiya', tags: ['артрит', 'суставы', 'иммунитет'] },
  { title: 'Хроническая болезнь почек: стадии, симптомы и лечение', category: 'nefrologiya', tags: ['почки', 'ХБП', 'фильтрация'] },
  { title: 'Пиелонефрит: симптомы воспаления почек и лечение', category: 'nefrologiya', tags: ['пиелонефрит', 'почки', 'инфекция'] },
]

async function generateArticle(title: string, category: string): Promise<{ content: string; excerpt: string } | null> {
  const prompt = `Напиши медицинскую статью для портала ЗдравИнфо на тему: "${title}".

Требования:
- Язык: русский, грамотный медицинский стиль, понятный обычному читателю
- Длина: 600-900 слов основного текста
- Структура: 4-6 разделов с заголовками h2, внутри могут быть h3
- Используй маркированные списки ul/li где уместно
- Тон: информативный, без паники, призыв консультироваться с врачом
- В конце обязательно абзац "Когда обратиться к врачу"

Верни ТОЛЬКО JSON без markdown-обёртки:
{
  "excerpt": "краткое описание статьи 1-2 предложения до 160 символов",
  "content": "полный HTML контент статьи с тегами h2, h3, p, ul, li, strong"
}`

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY не задан в .env.local')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error('Error generating:', title, e)
    return null
  }
}

function slugify(title: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
    'щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',' ':'-',
  }
  return title.toLowerCase()
    .split('').map(c => map[c] ?? c)
    .join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 60)
}

async function main() {
  const results = []
  const total = ARTICLES_PLAN.length

  for (let i = 0; i < total; i++) {
    const { title, category, tags } = ARTICLES_PLAN[i]
    console.log(`[${i + 1}/${total}] Генерирую: ${title}`)

    const generated = await generateArticle(title, category)
    if (!generated) { console.log('  ⚠️  Пропущена'); continue }

    results.push({
      title,
      slug: slugify(title),
      excerpt: generated.excerpt,
      content: generated.content,
      category,
      tags,
      metaTitle: title + ' — ЗдравИнфо',
      metaDescription: generated.excerpt,
    })
    console.log(`  ✅ Готово`)

    // пауза между запросами чтобы не превысить rate limit
    if (i < total - 1) await new Promise(r => setTimeout(r, 800))
  }

  // Сохраняем в JSON
  const fs = require('fs')
  fs.writeFileSync('./articles-generated.json', JSON.stringify(results, null, 2), 'utf8')
  console.log(`\n✅ Готово! Сгенерировано ${results.length} статей → articles-generated.json`)
}

main()
