import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// bodySystem: head | chest | abdomen | skin | joints | general | neuro | urology | women
const symptoms = [
  // ГОЛОВА И ШЕЯ
  { title: 'Головная боль', slug: 'golovnaya-bol', bodySystem: 'head', severity: 'medium',
    description: 'Боль в области головы — один из самых распространённых симптомов. Может быть признаком мигрени, напряжения, гипертонии или более серьёзных заболеваний.',
    articleSlugs: ['migren-kak-izbavitsya-ot-iznuryayushchey-golovnoy-boli', 'gipertoniya-prichiny-simptomy-i-lechenie'] },

  { title: 'Головокружение', slug: 'golovokruzhenie', bodySystem: 'head', severity: 'medium',
    description: 'Ощущение вращения или неустойчивости. Может быть связано с сосудистыми нарушениями, вестибулярными расстройствами или заболеваниями внутреннего уха.',
    articleSlugs: ['gipertoniya-prichiny-simptomy-i-lechenie'] },

  { title: 'Потеря обоняния', slug: 'poterya-obonyaniya', bodySystem: 'head', severity: 'low',
    description: 'Снижение или полное отсутствие способности различать запахи. Может быть ранним признаком неврологических заболеваний или следствием вирусной инфекции.',
    articleSlugs: ['bolezn-parkinsona-rannie-simptomy-i-lechenie'] },

  { title: 'Боль в горле', slug: 'bol-v-gorle', bodySystem: 'head', severity: 'low',
    description: 'Боль, першение или дискомфорт в горле. Чаще всего признак вирусной или бактериальной инфекции.',
    articleSlugs: ['khronicheskiy-tonzillit-lechit-ili-udalyat-mindaliny'] },

  { title: 'Нарушение зрения', slug: 'narushenie-zreniya', bodySystem: 'head', severity: 'high',
    description: 'Снижение остроты зрения, двоение, выпадение полей зрения. Может быть симптомом инсульта, катаракты или других серьёзных заболеваний.',
    articleSlugs: ['katarakta-kogda-nuzhna-operatsiya-i-chego-ozhidat', 'insult-priznaki-pervaya-pomoshch-i-reabilitatsiya'] },

  // ГРУДНАЯ КЛЕТКА
  { title: 'Боль в груди', slug: 'bol-v-grudi', bodySystem: 'chest', severity: 'high',
    description: 'Боль или дискомфорт в грудной клетке. Требует немедленного обращения к врачу — может быть признаком инфаркта, стенокардии или других опасных состояний.',
    articleSlugs: ['infarkt-miokarda-pervye-priznaki-i-chto-delat', 'aritimiya-serdtsa-vidy-i-metody-lecheniya'] },

  { title: 'Одышка', slug: 'odyshka', bodySystem: 'chest', severity: 'high',
    description: 'Затруднённое дыхание, чувство нехватки воздуха. Может быть симптомом сердечной недостаточности, астмы, ХОБЛ или тромбоэмболии.',
    articleSlugs: ['bronkhialnaya-astma-kak-kontrolirovat-bolezn', 'infarkt-miokarda-pervye-priznaki-i-chto-delat'] },

  { title: 'Учащённое сердцебиение', slug: 'uchashchyonnoe-serdtsebienie', bodySystem: 'chest', severity: 'medium',
    description: 'Ощущение перебоев, «провалов» или учащения ритма сердца. Может быть признаком аритмии, тиреотоксикоза или тревожного расстройства.',
    articleSlugs: ['gipertoniya-prichiny-simptomy-i-lechenie'] },

  { title: 'Кашель', slug: 'kashel', bodySystem: 'chest', severity: 'medium',
    description: 'Хронический кашель (более 3 недель) требует обследования. Может быть симптомом астмы, ХОБЛ, ГЭРБ или онкологических заболеваний.',
    articleSlugs: ['bronkhialnaya-astma-kak-kontrolirovat-bolezn'] },

  // ЖИВОТ
  { title: 'Боль в животе', slug: 'bol-v-zhivote', bodySystem: 'abdomen', severity: 'medium',
    description: 'Боль в животе может быть признаком самых разных состояний — от функциональных расстройств до хирургической патологии.',
    articleSlugs: ['appenditsit-simptomy-kotorye-nelzya-ignorirovat', 'yazva-zheludka-simptomy-prichiny-i-sovremennoe-lechenie', 'sindrom-razdrazhyonnogo-kishechnika-kak-zhit-s-srk'] },

  { title: 'Тошнота и рвота', slug: 'toshnota-i-rvota', bodySystem: 'abdomen', severity: 'medium',
    description: 'Частые симптомы при заболеваниях желудочно-кишечного тракта, инфекциях, отравлениях и других состояниях.',
    articleSlugs: ['yazva-zheludka-simptomy-prichiny-i-sovremennoe-lechenie', 'pankreatit-ostry-i-khronicheskiy'] },

  { title: 'Изжога', slug: 'izzhoga', bodySystem: 'abdomen', severity: 'low',
    description: 'Жжение за грудиной, поднимающееся вверх — классический симптом гастроэзофагеальной рефлюксной болезни.',
    articleSlugs: ['yazva-zheludka-simptomy-prichiny-i-sovremennoe-lechenie'] },

  { title: 'Вздутие живота', slug: 'vzdutie-zhivota', bodySystem: 'abdomen', severity: 'low',
    description: 'Ощущение распирания и переполненности в животе, избыточное газообразование.',
    articleSlugs: ['sindrom-razdrazhyonnogo-kishechnika-kak-zhit-s-srk'] },

  { title: 'Нарушения стула', slug: 'narusheniya-stula', bodySystem: 'abdomen', severity: 'medium',
    description: 'Диарея или запор — могут быть признаком функциональных расстройств, воспалительных заболеваний или онкологии.',
    articleSlugs: ['sindrom-razdrazhyonnogo-kishechnika-kak-zhit-s-srk', 'rannyaya-diagnostika-raka-kakie-obsledovaniya-prokhodit'] },

  // КОЖА
  { title: 'Кожная сыпь', slug: 'kozhnaya-syp', bodySystem: 'skin', severity: 'medium',
    description: 'Высыпания на коже различного характера могут быть признаком аллергии, инфекции, аутоиммунного заболевания.',
    articleSlugs: ['psoriaz-sovremennye-metody-lecheniya-i-kontrolya'] },

  { title: 'Кожный зуд', slug: 'kozhniy-zud', bodySystem: 'skin', severity: 'medium',
    description: 'Зуд без видимых высыпаний может быть признаком болезни почек, печени, щитовидной железы или онкологии.',
    articleSlugs: ['psoriaz-sovremennye-metody-lecheniya-i-kontrolya', 'khronicheskaya-bolezn-pochek-stadii-i-lechenie'] },

  { title: 'Акне и прыщи', slug: 'akne-i-pryshchi', bodySystem: 'skin', severity: 'low',
    description: 'Воспалительные высыпания на коже лица и тела — симптом угревой болезни.',
    articleSlugs: ['akne-u-vzroslykh-prichiny-i-effektivnoe-lechenie'] },

  { title: 'Выпадение волос', slug: 'vypadenie-volos', bodySystem: 'skin', severity: 'low',
    description: 'Усиленное выпадение волос может быть связано с гормональными нарушениями, дефицитами, стрессом.',
    articleSlugs: ['gipotireoz-kogda-shchitovidnaya-rabotaet-vpolsily', 'sindrom-polikistoznykh-yaichnikov-simptomy-i-lechenie'] },

  // СУСТАВЫ И МЫШЦЫ
  { title: 'Боль в суставах', slug: 'bol-v-sustavakh', bodySystem: 'joints', severity: 'medium',
    description: 'Боль, отёк и скованность в суставах — могут быть признаком артрита, артроза или системного заболевания.',
    articleSlugs: ['revmatoidny-artrit-rannie-priznaki-i-lechenie'] },

  { title: 'Утренняя скованность', slug: 'utrennyaya-skovannost', bodySystem: 'joints', severity: 'medium',
    description: 'Затруднённость движений после пробуждения — характерный признак воспалительных заболеваний суставов.',
    articleSlugs: ['revmatoidny-artrit-rannie-priznaki-i-lechenie'] },

  { title: 'Боль в спине', slug: 'bol-v-spine', bodySystem: 'joints', severity: 'medium',
    description: 'Одна из самых частых причин обращения к врачу. В 95% случаев неспецифическая, но требует исключения серьёзной патологии.',
    articleSlugs: ['osteokhondroz-mify-i-realnost'] },

  // ОБЩИЕ СИМПТОМЫ
  { title: 'Повышенная температура', slug: 'povyshennaya-temperatura', bodySystem: 'general', severity: 'medium',
    description: 'Лихорадка — защитная реакция организма на инфекцию. Важно знать, когда требуется экстренная помощь.',
    articleSlugs: ['temperatura-u-rebyonka-kogda-vyzvat-vracha'] },

  { title: 'Сильная усталость', slug: 'silnaya-ustalost', bodySystem: 'general', severity: 'medium',
    description: 'Хроническая усталость, не проходящая после отдыха — может быть симптомом анемии, гипотиреоза, диабета, депрессии.',
    articleSlugs: ['gipotireoz-kogda-shchitovidnaya-rabotaet-vpolsily', 'depressiya-simptomy-kotorye-chasto-ignoriruyut', 'sakharny-diabet-2-tipa-profilaktika-i-lechenie'] },

  { title: 'Потеря веса без причины', slug: 'poterya-vesa-bez-prichiny', bodySystem: 'general', severity: 'high',
    description: 'Снижение веса без изменения диеты и физической активности — тревожный симптом, требующий обследования.',
    articleSlugs: ['rannyaya-diagnostika-raka-kakie-obsledovaniya-prokhodit'] },

  { title: 'Отёки', slug: 'oteki', bodySystem: 'general', severity: 'medium',
    description: 'Отёки ног, лица или рук могут быть признаком сердечной, почечной или печёночной недостаточности.',
    articleSlugs: ['khronicheskaya-bolezn-pochek-stadii-i-lechenie', 'gipertoniya-prichiny-simptomy-i-lechenie'] },

  { title: 'Повышенная жажда', slug: 'povyshennaya-zhazhda', bodySystem: 'general', severity: 'medium',
    description: 'Постоянное желание пить — один из ключевых симптомов сахарного диабета.',
    articleSlugs: ['sakharny-diabet-2-tipa-profilaktika-i-lechenie'] },

  // НЕВРОЛОГИЧЕСКИЕ
  { title: 'Онемение конечностей', slug: 'onemenie-konechnostey', bodySystem: 'neuro', severity: 'medium',
    description: 'Онемение, покалывание в руках и ногах могут быть признаком диабетической нейропатии, грыжи диска или инсульта.',
    articleSlugs: ['insult-priznaki-pervaya-pomoshch-i-reabilitatsiya', 'sakharny-diabet-2-tipa-profilaktika-i-lechenie'] },

  { title: 'Дрожание рук', slug: 'drozhanie-ruk', bodySystem: 'neuro', severity: 'medium',
    description: 'Тремор рук в покое — один из классических признаков болезни Паркинсона.',
    articleSlugs: ['bolezn-parkinsona-rannie-simptomy-i-lechenie'] },

  { title: 'Нарушения сна', slug: 'narusheniya-sna', bodySystem: 'neuro', severity: 'medium',
    description: 'Бессонница или избыточная сонливость могут быть симптомом депрессии, апноэ или неврологических заболеваний.',
    articleSlugs: ['depressiya-simptomy-kotorye-chasto-ignoriruyut'] },

  // УРОЛОГИЯ
  { title: 'Боль при мочеиспускании', slug: 'bol-pri-mocheispuskanii', bodySystem: 'urology', severity: 'medium',
    description: 'Жжение или боль при мочеиспускании — признак цистита, уретрита или мочекаменной болезни.',
    articleSlugs: ['mochekamennaya-bolezn-prichiny-i-lechenie'] },

  { title: 'Кровь в моче', slug: 'krov-v-moche', bodySystem: 'urology', severity: 'high',
    description: 'Гематурия требует обязательного обследования для исключения мочекаменной болезни, инфекции или онкологии.',
    articleSlugs: ['mochekamennaya-bolezn-prichiny-i-lechenie', 'rannyaya-diagnostika-raka-kakie-obsledovaniya-prokhodit'] },

  // ЖЕНСКИЕ
  { title: 'Нарушения менструального цикла', slug: 'narusheniya-menstrualnogo-tsikla', bodySystem: 'women', severity: 'medium',
    description: 'Нерегулярные, болезненные или обильные менструации могут быть признаком СПКЯ, эндометриоза или гормональных нарушений.',
    articleSlugs: ['endometrioz-skrytaya-prichina-zhenskoy-boli', 'sindrom-polikistoznykh-yaichnikov-simptomy-i-lechenie'] },

  { title: 'Тазовая боль у женщин', slug: 'tazovaya-bol-u-zhenshchin', bodySystem: 'women', severity: 'medium',
    description: 'Хроническая боль внизу живота у женщин нередко связана с эндометриозом или гинекологической патологией.',
    articleSlugs: ['endometrioz-skrytaya-prichina-zhenskoy-boli'] },
]

const systemLabels: Record<string, string> = {
  head: 'Голова и шея',
  chest: 'Грудная клетка',
  abdomen: 'Живот и пищеварение',
  skin: 'Кожа и волосы',
  joints: 'Суставы и спина',
  general: 'Общие симптомы',
  neuro: 'Неврология',
  urology: 'Урология',
  women: 'Женское здоровье',
}

async function main() {
  console.log(`Создаём ${symptoms.length} симптомов...`)

  for (const s of symptoms) {
    // Создаём или обновляем симптом
    const symptom = await prisma.symptom.upsert({
      where: { slug: s.slug },
      update: { title: s.title, description: s.description, bodySystem: s.bodySystem, severity: s.severity },
      create: { title: s.title, slug: s.slug, description: s.description, bodySystem: s.bodySystem, severity: s.severity },
    })

    // Привязываем статьи
    await prisma.symptomArticle.deleteMany({ where: { symptomId: symptom.id } })

    for (const articleSlug of s.articleSlugs) {
      const article = await prisma.article.findUnique({ where: { slug: articleSlug } })
      if (article) {
        await prisma.symptomArticle.create({
          data: { symptomId: symptom.id, articleId: article.id }
        })
      }
    }

    process.stdout.write('.')
  }

  console.log(`\nГотово! Создано симптомов: ${symptoms.length}`)
  console.log('Системы органов:', Object.values(systemLabels).join(', '))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
