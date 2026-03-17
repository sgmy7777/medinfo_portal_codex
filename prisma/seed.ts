import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Заполняем базу данных...')

  // Создаём администратора
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@yourdomain.ru' },
    update: {},
    create: { email: 'admin@yourdomain.ru', password: hashedPassword },
  })
  console.log('✅ Администратор:', admin.email)
  console.log('   Пароль: admin123 (смените после первого входа!)')

  // Создаём автора
  const author = await prisma.author.upsert({
    where: { slug: 'doktor-ivanov' },
    update: {},
    create: {
      name: 'Иванов Иван Иванович',
      specialty: 'Врач-терапевт, стаж 12 лет',
      bio: 'Окончил медицинский факультет. Специализируюсь на профилактике и лечении различных заболеваний. Веду этот портал, чтобы помочь людям разобраться в вопросах здоровья.',
      slug: 'doktor-ivanov',
    },
  })
  console.log('✅ Автор:', author.name)

  // Удаляем старые стоматологические категории
  const oldSlugs = ['bolezni-dyosen', 'profilaktika', 'detskaya', 'zapah-izo-rta']
  const oldCats = await prisma.category.findMany({ where: { slug: { in: oldSlugs } }, select: { id: true } })
  const oldIds = oldCats.map((c: any) => c.id)
  if (oldIds.length > 0) {
    await prisma.article.deleteMany({ where: { categoryId: { in: oldIds } } })
    await prisma.category.deleteMany({ where: { id: { in: oldIds } } })
  }
  console.log('🗑️  Старые категории удалены')

  // Создаём категории
  const categoryData = [
    { title: 'Кардиология', slug: 'kardiologiya', color: '#6B1F2A', description: 'Заболевания сердца и сосудов' },
    { title: 'Неврология', slug: 'nevrologiya', color: '#6B1F2A', description: 'Заболевания нервной системы' },
    { title: 'Гастроэнтерология', slug: 'gastroenterologiya', color: '#6B1F2A', description: 'Заболевания ЖКТ' },
    { title: 'Стоматология', slug: 'stomatologiya', color: '#6B1F2A', description: 'Болезни зубов и полости рта' },
    { title: 'Дерматология', slug: 'dermatologiya', color: '#6B1F2A', description: 'Заболевания кожи' },
    { title: 'Педиатрия', slug: 'pediatriya', color: '#6B1F2A', description: 'Здоровье детей' },
    { title: 'Эндокринология', slug: 'endokrinologiya', color: '#6B1F2A', description: 'Заболевания эндокринной системы' },
    { title: 'Онкология', slug: 'onkologiya', color: '#6B1F2A', description: 'Онкологические заболевания' },
    { title: 'Травматология', slug: 'travmatologiya', color: '#6B1F2A', description: 'Травмы и заболевания опорно-двигательного аппарата' },
    { title: 'Хирургия', slug: 'khirurgiya', color: '#6B1F2A', description: 'Хирургические заболевания и операции' },
    { title: 'Урология', slug: 'urologiya', color: '#6B1F2A', description: 'Заболевания мочеполовой системы' },
    { title: 'Гинекология', slug: 'ginekologiya', color: '#6B1F2A', description: 'Женское здоровье' },
    { title: 'Офтальмология', slug: 'oftalmologiya', color: '#6B1F2A', description: 'Заболевания глаз и зрения' },
    { title: 'ЛОР', slug: 'lor', color: '#6B1F2A', description: 'Болезни уха, горла и носа' },
    { title: 'Психиатрия', slug: 'psikhiatriya', color: '#6B1F2A', description: 'Психические расстройства и здоровье' },
    { title: 'Пульмонология', slug: 'pulmonologiya', color: '#6B1F2A', description: 'Заболевания лёгких и дыхательных путей' },
    { title: 'Ревматология', slug: 'revmatologiya', color: '#6B1F2A', description: 'Заболевания суставов и соединительной ткани' },
    { title: 'Нефрология', slug: 'nefrologiya', color: '#6B1F2A', description: 'Заболевания почек' },
  ]

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Категории созданы')

  // Создаём теги
  const tags = ['зубная боль', 'кариес', 'дёсны', 'профилактика', 'детские зубы', 'галитоз', 'брекеты']
  for (const title of tags) {
    const slug = title.replace(/\s+/g, '-').replace(/[^a-zA-Zа-яёА-ЯЁ0-9-]/g, '')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { title, slug },
    })
  }
  console.log('✅ Теги созданы')

  const category = await prisma.category.findUnique({ where: { slug: 'stomatologiya' } })

  // Создаём тестовую статью
  await prisma.article.upsert({
    where: { slug: 'pochemu-bolyat-desny' },
    update: {},
    create: {
      title: 'Почему болят дёсны: 7 главных причин и что делать',
      slug: 'pochemu-bolyat-desny',
      excerpt: 'Боль в дёснах — один из самых частых поводов обращения к стоматологу. Разбираем причины и рассказываем, когда нужна срочная помощь.',
      content: `
        <h2>Почему болят дёсны?</h2>
        <p>Боль в дёснах может быть признаком серьёзного заболевания или временной реакцией на внешнее воздействие. Важно понять причину вовремя.</p>
        <h2>Основные причины</h2>
        <h3>1. Гингивит</h3>
        <p>Воспаление дёсен, вызванное бактериальным налётом. Дёсны краснеют, отекают и кровоточат при чистке зубов.</p>
        <h3>2. Пародонтит</h3>
        <p>Более серьёзное заболевание, при котором воспаление распространяется на костную ткань. Без лечения приводит к потере зубов.</p>
        <h3>3. Травма</h3>
        <p>Жёсткая зубная щётка, острая пища или стоматологические манипуляции могут травмировать дёсны.</p>
        <h2>Когда обратиться к врачу</h2>
        <p>Обязательно запишитесь к стоматологу, если боль не проходит более 3 дней или сопровождается температурой.</p>
      `,
      metaTitle: 'Почему болят дёсны: причины и лечение | ДентаМед',
      metaDescription: 'Боль в дёснах может указывать на гингивит, пародонтит или травму. Узнайте причины и когда нужна помощь стоматолога.',
      authorId: author.id,
      categoryId: category!.id,
      isPublished: true,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Тестовая статья создана')

  console.log('\n🚀 База данных готова!')
  console.log('   Войдите в админку: /admin/login')
  console.log('   Email: admin@yourdomain.ru')
  console.log('   Пароль: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
