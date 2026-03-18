'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Данные анализов с клинической интерпретацией ─────────────────────────────
const TESTS = [
  // ОАК
  {
    slug: 'gemoglobin', title: 'Гемоглобин', unit: 'г/л', category: 'ОАК',
    mMin: 130, mMax: 170, fMin: 120, fMax: 155,
    lowCauses:  'Железодефицитная анемия (дефицит железа), В12/фолиеводефицитная анемия, хроническая кровопотеря, заболевания почек.',
    highCauses: 'Полицитемия, хроническая гипоксия (ХОБЛ, курение, высокогорье), обезвоживание.',
    lowDoctor:  'терапевт или гематолог',
    highDoctor: 'терапевт или гематолог',
    lowTips:    'Сдайте дополнительно: ферритин, сывороточное железо, витамин В12, фолиевую кислоту.',
    highTips:   'Сдайте дополнительно: общий анализ крови с формулой, гематокрит, эритропоэтин.',
  },
  {
    slug: 'eritrotsity', title: 'Эритроциты', unit: '×10¹²/л', category: 'ОАК',
    mMin: 4.0, mMax: 5.5, fMin: 3.7, fMax: 4.7,
    lowCauses:  'Анемия различного происхождения, острая или хроническая кровопотеря, гемолиз.',
    highCauses: 'Истинная полицитемия, хроническая гипоксия, обезвоживание.',
    lowDoctor: 'терапевт или гематолог', highDoctor: 'терапевт или гематолог',
    lowTips: 'Сдайте: гемоглобин, ферритин, ретикулоциты.', highTips: 'Сдайте: гематокрит, эритропоэтин, насыщение кислородом.',
  },
  {
    slug: 'leykotsity', title: 'Лейкоциты', unit: '×10⁹/л', category: 'ОАК',
    mMin: 4.0, mMax: 9.0, fMin: 4.0, fMax: 9.0,
    lowCauses:  'Вирусные инфекции (грипп, COVID-19), апластическая анемия, химиотерапия, аутоиммунные заболевания (СКВ).',
    highCauses: 'Бактериальная инфекция, воспаление, стресс, лейкоз. Физиологически: после еды, физических нагрузок.',
    lowDoctor: 'терапевт, при значительном снижении — гематолог', highDoctor: 'терапевт',
    lowTips: 'Сдайте лейкоцитарную формулу. При < 2×10⁹/л — срочная консультация.', highTips: 'Сдайте лейкоцитарную формулу и СРБ. При > 30 — срочно к гематологу.',
  },
  {
    slug: 'trombotsity', title: 'Тромбоциты', unit: '×10⁹/л', category: 'ОАК',
    mMin: 150, mMax: 400, fMin: 150, fMax: 400,
    lowCauses:  'ИТП (иммунная тромбоцитопения), ДВС-синдром, цирроз печени, вирусные инфекции, химиотерапия.',
    highCauses: 'Реактивный тромбоцитоз при воспалении, анемии, после операций. Реже — эссенциальная тромбоцитемия.',
    lowDoctor: 'гематолог', highDoctor: 'терапевт или гематолог',
    lowTips: 'При < 50 — риск спонтанных кровотечений. Сдайте коагулограмму.', highTips: 'При > 600 — риск тромбозов. Сдайте развёрнутый анализ крови.',
  },
  {
    slug: 'soe', title: 'СОЭ', unit: 'мм/ч', category: 'ОАК',
    mMin: 1, mMax: 15, fMin: 2, fMax: 20,
    lowCauses:  'Полицитемия, сердечная недостаточность — клинического значения обычно не имеет.',
    highCauses: 'Любое воспаление или инфекция, аутоиммунные заболевания, онкология. При СОЭ > 100 — миелома, тяжёлые инфекции.',
    lowDoctor: 'терапевт (если есть симптомы)', highDoctor: 'терапевт',
    lowTips: 'Изолированно низкое СОЭ обычно не требует обследования.', highTips: 'Сдайте: СРБ, общий анализ крови, белок крови и протеинограмму.',
  },
  // Биохимия
  {
    slug: 'glyukoza', title: 'Глюкоза (натощак)', unit: 'ммоль/л', category: 'Биохимия',
    mMin: 3.9, mMax: 6.1, fMin: 3.9, fMax: 6.1,
    lowCauses:  'Передозировка инсулина или сахароснижающих препаратов, инсулинома, голодание, алкоголь.',
    highCauses: 'Сахарный диабет 1 или 2 типа, предиабет (6,1–6,9 ммоль/л), стресс, кортикостероиды.',
    lowDoctor: 'эндокринолог', highDoctor: 'эндокринолог или терапевт',
    lowTips: 'При < 3,0 — срочно принять 15–20 г быстрых углеводов (сок, глюкоза). Консультация эндокринолога обязательна.', highTips: 'Сдайте: гликированный гемоглобин (HbA1c), глюкозотолерантный тест.',
  },
  {
    slug: 'glikiroavanny-gemoglobin', title: 'HbA1c (гликированный гемоглобин)', unit: '%', category: 'Биохимия',
    mMin: 4.0, mMax: 5.7, fMin: 4.0, fMax: 5.7,
    lowCauses:  'Гипогликемия, гемолитическая анемия (ложное снижение из-за укороченной жизни эритроцитов).',
    highCauses: 'Сахарный диабет (≥6,5%), предиабет (5,7–6,4%), длительная гипергликемия. Отражает средний уровень глюкозы за 3 месяца.',
    lowDoctor: 'терапевт или эндокринолог', highDoctor: 'эндокринолог',
    lowTips: 'Исключите гемолиз как причину ложного снижения.', highTips: 'При ≥6,5% диагноз СД подтверждается. Консультация эндокринолога обязательна.',
  },
  {
    slug: 'obshhij-kholesterin', title: 'Холестерин общий', unit: 'ммоль/л', category: 'Биохимия',
    mMin: 3.1, mMax: 5.2, fMin: 3.1, fMax: 5.2,
    lowCauses:  'Гипертиреоз, тяжёлые заболевания печени, недоедание, мальабсорбция.',
    highCauses: 'Атерогенная диета, гипотиреоз, сахарный диабет, хроническая болезнь почек, семейная гиперхолестеринемия.',
    lowDoctor: 'терапевт или эндокринолог', highDoctor: 'терапевт или кардиолог',
    lowTips: 'Проверьте функцию щитовидной железы (ТТГ).', highTips: 'Сдайте полный липидный профиль: ЛПНП, ЛПВП, триглицериды.',
  },
  {
    slug: 'lpnp', title: 'ЛПНП («плохой» холестерин)', unit: 'ммоль/л', category: 'Биохимия',
    mMin: 0, mMax: 3.0, fMin: 0, fMax: 3.0,
    lowCauses:  'Генетические особенности, гипертиреоз, тяжёлые болезни печени — клинически не опасно.',
    highCauses: 'Атерогенная диета, гипотиреоз, сахарный диабет, хроническая болезнь почек, семейная гиперхолестеринемия.',
    lowDoctor: 'терапевт', highDoctor: 'кардиолог или терапевт',
    lowTips: 'Низкий ЛПНП, как правило, благоприятен.', highTips: 'Цель при высоком сердечно-сосудистом риске — менее 1,8 ммоль/л. Статины снижают ЛПНП на 40–60%.',
  },
  {
    slug: 'lpvp', title: 'ЛПВП («хороший» холестерин)', unit: 'ммоль/л', category: 'Биохимия',
    mMin: 1.0, mMax: 99, fMin: 1.2, fMax: 99,
    lowCauses:  'Ожирение, метаболический синдром, сахарный диабет 2 типа, курение, малоподвижный образ жизни.',
    highCauses: 'Обычно благоприятно. Редко при генетических нарушениях обмена холестерина.',
    lowDoctor: 'кардиолог или терапевт', highDoctor: 'терапевт',
    lowTips: 'Повышают ЛПВП: аэробные нагрузки, отказ от курения, средиземноморская диета.', highTips: 'Высокий ЛПВП — защитный фактор, специального лечения не требует.',
  },
  {
    slug: 'triglitseridy', title: 'Триглицериды', unit: 'ммоль/л', category: 'Биохимия',
    mMin: 0, mMax: 1.7, fMin: 0, fMax: 1.7,
    lowCauses:  'Гипертиреоз, мальабсорбция, недоедание — обычно не требует лечения.',
    highCauses: 'Углеводная диета, алкоголь, ожирение, сахарный диабет, гипотиреоз, хроническая болезнь почек. При > 5,6 — риск панкреатита.',
    lowDoctor: 'терапевт (если есть симптомы)', highDoctor: 'кардиолог или терапевт',
    lowTips: 'Низкие триглицериды обычно не опасны.', highTips: 'Исключите алкоголь, снизьте сахар и рафинированные углеводы. При > 5,6 — срочная консультация.',
  },
  {
    slug: 'alt', title: 'АЛТ (аланинаминотрансфераза)', unit: 'Ед/л', category: 'Биохимия',
    mMin: 0, mMax: 40, fMin: 0, fMax: 32,
    lowCauses:  'Клинического значения не имеет.',
    highCauses: 'Вирусный гепатит (A, B, C), алкогольный гепатит, жировая болезнь печени, лекарственный гепатит (парацетамол, статины, антибиотики), цирроз.',
    lowDoctor: '-', highDoctor: 'гастроэнтеролог или терапевт',
    lowTips: '', highTips: 'Сдайте: АСТ, билирубин, ГГТ, щелочную фосфатазу, маркёры гепатитов B и C. При > 10× норм — срочно.',
  },
  {
    slug: 'ast', title: 'АСТ (аспартатаминотрансфераза)', unit: 'Ед/л', category: 'Биохимия',
    mMin: 0, mMax: 40, fMin: 0, fMax: 32,
    lowCauses:  'Клинического значения не имеет.',
    highCauses: 'Инфаркт миокарда (АСТ >> АЛТ), вирусный гепатит, алкогольный гепатит (АСТ/АЛТ > 2), рабдомиолиз, тяжёлые физические нагрузки.',
    lowDoctor: '-', highDoctor: 'терапевт или кардиолог',
    lowTips: '', highTips: 'Если АСТ >> АЛТ — исключите инфаркт миокарда (тропонин, ЭКГ). Сдайте также АЛТ и КФК.',
  },
  {
    slug: 'bilirubin-obshhij', title: 'Билирубин общий', unit: 'мкмоль/л', category: 'Биохимия',
    mMin: 3.4, mMax: 20.5, fMin: 3.4, fMax: 20.5,
    lowCauses:  'Клинического значения не имеет.',
    highCauses: 'Гемолитическая анемия, синдром Жильбера (доброкачественный, при голодании/стрессе), гепатиты, цирроз, желчнокаменная болезнь. При > 34 — видимая желтуха.',
    lowDoctor: '-', highDoctor: 'гастроэнтеролог или терапевт',
    lowTips: '', highTips: 'Сдайте прямой и непрямой билирубин, АЛТ, АСТ, щелочную фосфатазу. Сделайте УЗИ органов брюшной полости.',
  },
  {
    slug: 'kreatinin', title: 'Креатинин', unit: 'мкмоль/л', category: 'Биохимия',
    mMin: 62, mMax: 115, fMin: 44, fMax: 97,
    lowCauses:  'Низкая мышечная масса, беременность, вегетарианство — обычно не требует лечения.',
    highCauses: 'Острое или хроническое повреждение почек, обезвоживание, рабдомиолиз. Физиологически выше у мужчин и спортсменов.',
    lowDoctor: 'терапевт', highDoctor: 'нефролог или терапевт',
    lowTips: 'Низкий креатинин при нормальной функции почек не опасен.', highTips: 'Рассчитайте СКФ по CKD-EPI. Сдайте общий анализ мочи и мочевину. При повышении обоих — обследование почек.',
  },
  {
    slug: 'mochevina', title: 'Мочевина', unit: 'ммоль/л', category: 'Биохимия',
    mMin: 2.5, mMax: 8.3, fMin: 2.5, fMax: 8.3,
    lowCauses:  'Печёночная недостаточность, низкобелковая диета, беременность.',
    highCauses: 'Хроническая болезнь почек, обезвоживание, ЖКТ-кровотечение, высокобелковая диета, катаболизм.',
    lowDoctor: 'терапевт', highDoctor: 'нефролог или терапевт',
    lowTips: 'Проверьте функцию печени (АЛТ, АСТ, альбумин).', highTips: 'Сдайте: креатинин, общий анализ мочи. Оцените соотношение мочевина/креатинин.',
  },
  {
    slug: 'mochevaya-kislota', title: 'Мочевая кислота', unit: 'мкмоль/л', category: 'Биохимия',
    mMin: 210, mMax: 420, fMin: 150, fMax: 350,
    lowCauses:  'Болезнь Вильсона, дефект ксантиноксидазы, низкопуриновая диета.',
    highCauses: 'Подагра, хроническая болезнь почек, пуринсодержащая диета (мясо, алкоголь, пиво), диуретики.',
    lowDoctor: 'терапевт', highDoctor: 'ревматолог или терапевт',
    lowTips: 'Изолированно низкая мочевая кислота редка; проверьте функцию печени.', highTips: 'При > 540 мкмоль/л и приступах боли в суставах — подагра. Исключите алкоголь и субпродукты.',
  },
  {
    slug: 'c-reaktivnyj-belok', title: 'С-реактивный белок', unit: 'мг/л', category: 'Биохимия',
    mMin: 0, mMax: 5, fMin: 0, fMax: 5,
    lowCauses:  'Норма — не имеет клинического значения.',
    highCauses: 'Бактериальная инфекция (часто > 100 мг/л), вирусная инфекция, аутоиммунные заболевания, инфаркт, онкология.',
    lowDoctor: '-', highDoctor: 'терапевт',
    lowTips: 'СРБ ниже нормы не бывает — результат ниже порога чувствительности означает норму.', highTips: 'Сдайте: лейкоциты с формулой, температуру, посев мочи/крови при подозрении на инфекцию. СРБ > 100 — чаще бактериальная инфекция.',
  },
  {
    slug: 'ferritin', title: 'Ферритин', unit: 'нг/мл', category: 'Биохимия',
    mMin: 30, mMax: 400, fMin: 13, fMax: 150,
    lowCauses:  'Железодефицитная анемия или латентный дефицит железа (запасы исчерпаны, анемии ещё нет).',
    highCauses: 'Воспаление, инфекция, гемохроматоз, заболевания печени, онкология. При высоком ферритине и низком железе — анемия хронических болезней.',
    lowDoctor: 'терапевт', highDoctor: 'терапевт или гематолог',
    lowTips: 'Ферритин < 30 = дефицит железа, даже если гемоглобин нормальный. Сдайте сывороточное железо и ОЖСС.', highTips: 'При ферритине > 1000 — исключите гемохроматоз и заболевания печени.',
  },
  {
    slug: 'zhelezo-syvorotochnoe', title: 'Железо сывороточное', unit: 'мкмоль/л', category: 'Биохимия',
    mMin: 11, mMax: 28, fMin: 9, fMax: 27,
    lowCauses:  'Железодефицитная анемия, хронические кровопотери, беременность, нарушение всасывания (целиакия).',
    highCauses: 'Гемохроматоз, гемолиз, острый гепатит, отравление препаратами железа.',
    lowDoctor: 'терапевт', highDoctor: 'терапевт или гематолог',
    lowTips: 'Оцените в комплексе: ферритин + ОЖСС + насыщение трансферрина. Одно сывороточное железо малоинформативно.', highTips: 'Сдайте ферритин, трансферрин, исключите гемохроматоз (ген HFE).',
  },
  {
    slug: 'vitamin-d', title: 'Витамин D (25-OH)', unit: 'нг/мл', category: 'Биохимия',
    mMin: 30, mMax: 100, fMin: 30, fMax: 100,
    lowCauses:  'Недостаточное пребывание на солнце, недостаток в рационе, нарушение всасывания, ожирение.',
    highCauses: 'Передозировка препаратами витамина D (токсичность при > 150 нг/мл).',
    lowDoctor: 'терапевт', highDoctor: 'терапевт или эндокринолог',
    lowTips: '< 20 нг/мл — дефицит. 20–30 — недостаточность. Восполняется препаратами D3 под контролем врача.', highTips: 'При > 100 нг/мл — отмените добавки витамина D. При > 150 — риск токсичности (гиперкальциемия).',
  },
  // Гормоны
  {
    slug: 'ttg', title: 'ТТГ', unit: 'мМЕ/л', category: 'Гормоны',
    mMin: 0.4, mMax: 4.0, fMin: 0.4, fMax: 4.0,
    lowCauses:  'Гипертиреоз (болезнь Грейвса, токсический зоб), тиреоидит, передозировка левотироксина.',
    highCauses: 'Гипотиреоз (чаще — аутоиммунный тиреоидит Хашимото), дефицит йода, после удаления щитовидной железы.',
    lowDoctor: 'эндокринолог', highDoctor: 'эндокринолог',
    lowTips: 'Сдайте свободный Т4 (fT4) и антитела к рецепторам ТТГ. Сделайте УЗИ щитовидной железы.', highTips: 'Сдайте свободный Т4 (fT4) и антитела к ТПО. УЗИ щитовидной железы обязательно.',
  },
  {
    slug: 'kortizol', title: 'Кортизол (утренний)', unit: 'нмоль/л', category: 'Гормоны',
    mMin: 171, mMax: 536, fMin: 171, fMax: 536,
    lowCauses:  'Надпочечниковая недостаточность (болезнь Аддисона), длительный приём кортикостероидов с последующей отменой.',
    highCauses: 'Синдром Кушинга, стресс, боль, физические нагрузки, депрессия, ожирение. Физиологически выше утром.',
    lowDoctor: 'эндокринолог', highDoctor: 'эндокринолог',
    lowTips: 'При < 100 нмоль/л и клинике (слабость, гипотония, пигментация) — срочная консультация. Проведите стимуляционный тест с АКТГ.', highTips: 'Проведите ночной тест с 1 мг дексаметазона для диагностики синдрома Кушинга.',
  },
  {
    slug: 'insulin', title: 'Инсулин (натощак)', unit: 'мкЕд/мл', category: 'Гормоны',
    mMin: 2.6, mMax: 24.9, fMin: 2.6, fMax: 24.9,
    lowCauses:  'Сахарный диабет 1 типа (аутоиммунное разрушение β-клеток), поздние стадии диабета 2 типа.',
    highCauses: 'Инсулинорезистентность, ожирение, метаболический синдром, инсулинома, начальные стадии СД 2 типа.',
    lowDoctor: 'эндокринолог', highDoctor: 'эндокринолог',
    lowTips: 'Сдайте С-пептид и антитела к островковым клеткам (GAD) для диагностики СД 1 типа.', highTips: 'Рассчитайте HOMA-IR = (глюкоза × инсулин) / 22.5. При > 2.7 — инсулинорезистентность.',
  },
  {
    slug: 'testosteron', title: 'Тестостерон общий', unit: 'нмоль/л', category: 'Гормоны',
    mMin: 12.0, mMax: 33.0, fMin: 0.3, fMax: 2.8,
    lowCauses:  'У мужчин: гипогонадизм, ожирение, хронические заболевания, стресс, приём опиоидов. У женщин — редко клинически значимо.',
    highCauses: 'У женщин: СПКЯ, врождённая гиперплазия надпочечников, опухоли. У мужчин: анаболические стероиды, опухоли.',
    lowDoctor: 'уролог/андролог (мужчины), гинеколог (женщины)', highDoctor: 'гинеколог или эндокринолог (женщины)',
    lowTips: 'У мужчин сдайте: ЛГ, ФСГ, пролактин, глобулин, связывающий половые гормоны (ГСПГ).', highTips: 'У женщин при повышенном тестостероне: УЗИ органов малого таза, ДГЭА-С, 17-ОН прогестерон.',
  },
  // Коагулограмма
  {
    slug: 'mno', title: 'МНО', unit: '', category: 'Коагулограмма',
    mMin: 0.8, mMax: 1.2, fMin: 0.8, fMax: 1.2,
    lowCauses:  'Гиперкоагуляция, тромбоз, приём витамина К. Риск тромбов при лечении варфарином (МНО < 2).',
    highCauses: 'Терапия варфарином (целевое 2–3), печёночная недостаточность, дефицит витамина К, ДВС-синдром.',
    lowDoctor: 'терапевт или гематолог', highDoctor: 'терапевт или гематолог',
    lowTips: 'При лечении варфарином: МНО < 2 — недостаточный эффект, скорректируйте дозу.', highTips: 'При лечении варфарином: МНО > 3.5 — повышен риск кровотечений, снизьте дозу. При МНО > 5 — отмена.',
  },
  {
    slug: 'd-dimer', title: 'Д-димер', unit: 'нг/мл', category: 'Коагулограмма',
    mMin: 0, mMax: 500, fMin: 0, fMax: 500,
    lowCauses:  'Норма — нет активного тромбообразования.',
    highCauses: 'Тромбоз глубоких вен, тромбоэмболия лёгочной артерии (ТЭЛА), ДВС-синдром, онкология, воспаление, беременность, после операций.',
    lowDoctor: '-', highDoctor: 'терапевт или гематолог',
    lowTips: '', highTips: 'Д-димер высокочувствителен, но неспецифичен. При повышении необходим КТ-ангиография лёгких или УЗИ вен ног.',
  },
  // Иммунология
  {
    slug: 'revmatoidny-faktor', title: 'Ревматоидный фактор', unit: 'МЕ/мл', category: 'Иммунология',
    mMin: 0, mMax: 14, fMin: 0, fMax: 14,
    lowCauses:  'Норма — не имеет клинического значения.',
    highCauses: 'Ревматоидный артрит (у 70–80% пациентов), синдром Шегрена, СКВ, хронические инфекции (гепатит С). Ложноположительный у пожилых.',
    lowDoctor: '-', highDoctor: 'ревматолог',
    lowTips: '', highTips: 'Сдайте анти-ЦЦП (более специфичен для РА), СОЭ, СРБ. Сделайте рентген суставов.',
  },
]

const CATEGORIES = ['ОАК', 'Биохимия', 'Гормоны', 'Коагулограмма', 'Иммунология']

type Status = 'low' | 'normal' | 'high' | 'critical_low' | 'critical_high'

interface Result {
  status: Status
  label: string
  color: string
  bg: string
  deviation: number    // процент отклонения от ближайшей границы нормы
  pct: number          // позиция иголки 0–100
  normMin: number
  normMax: number
  lowCauses: string
  highCauses: string
  doctor: string
  tips: string
  testTitle: string
  testSlug: string
  unit: string
  value: number
}

function interpret(value: number, t: typeof TESTS[0], sex: 'male' | 'female'): Result {
  const min = sex === 'male' ? t.mMin : t.fMin
  const max = sex === 'male' ? t.mMax : t.fMax
  const range = max - min

  // Масштаб шкалы: от (min - range) до (max + range), зажатый 0
  const scaleMin = Math.max(0, min - range)
  const scaleMax = max + range
  const pct = Math.min(Math.max(((value - scaleMin) / (scaleMax - scaleMin)) * 100, 2), 98)

  let status: Status
  let label: string
  let color: string
  let bg: string
  let deviation = 0

  // Критично: за 2× от нормы
  const critLow = min > 0 ? min * 0.5 : -Infinity
  const critHigh = max * 2

  if (value < critLow) {
    status = 'critical_low'; label = 'Критически снижен'; color = '#7C1D1D'; bg = '#FFF1F2'
    deviation = Math.round(((min - value) / min) * 100)
  } else if (value < min) {
    status = 'low'; label = 'Ниже нормы'; color = '#2563EB'; bg = '#EFF6FF'
    deviation = min > 0 ? Math.round(((min - value) / min) * 100) : 0
  } else if (value > critHigh && max < 500) {
    status = 'critical_high'; label = 'Критически повышен'; color = '#7C1D1D'; bg = '#FFF1F2'
    deviation = Math.round(((value - max) / max) * 100)
  } else if (value > max) {
    status = 'high'; label = 'Выше нормы'; color = '#D97706'; bg = '#FFFBEB'
    deviation = Math.round(((value - max) / max) * 100)
  } else {
    status = 'normal'; label = 'В норме'; color = '#16A34A'; bg = '#F0FDF4'
    // Насколько близко к краю нормы
    const distMin = value - min
    const distMax = max - value
    deviation = Math.round((1 - Math.min(distMin, distMax) / (range / 2)) * 30)
  }

  const isLow = status === 'low' || status === 'critical_low'
  const isHigh = status === 'high' || status === 'critical_high'

  return {
    status, label, color, bg, deviation, pct, normMin: min, normMax: max,
    lowCauses: t.lowCauses, highCauses: t.highCauses,
    doctor: isLow ? t.lowDoctor : isHigh ? t.highDoctor : '',
    tips: isLow ? t.lowTips : isHigh ? t.highTips : '',
    testTitle: t.title, testSlug: t.slug, unit: t.unit, value,
  }
}

// ─── Компонент результата ──────────────────────────────────────────────────────
function ResultCard({ r, onReset }: { r: Result; onReset: () => void }) {
  const isNormal = r.status === 'normal'
  const isLow = r.status === 'low' || r.status === 'critical_low'

  // Позиция зоны нормы на шкале
  const scaleMin = Math.max(0, r.normMin - (r.normMax - r.normMin))
  const scaleMax = r.normMax + (r.normMax - r.normMin)
  const scaleRange = scaleMax - scaleMin
  const normStart = ((r.normMin - scaleMin) / scaleRange) * 100
  const normWidth = ((r.normMax - r.normMin) / scaleRange) * 100

  return (
    <div className="dc-result">
      {/* Верхняя строка */}
      <div className="dc-result-top">
        <div>
          <div className="dc-result-val" style={{ color: r.color }}>
            {r.value}<span className="dc-result-unit"> {r.unit}</span>
          </div>
          <div className="dc-result-norm-hint">Норма: {r.normMin}{r.normMax < 99 ? ` – ${r.normMax}` : '+'} {r.unit}</div>
        </div>
        <div className="dc-result-right">
          <div className="dc-result-test">{r.testTitle}</div>
          <div className="dc-result-badge" style={{ background: r.bg, color: r.color }}>{r.label}</div>
          {r.deviation > 0 && !isNormal && (
            <div className="dc-result-dev">Отклонение: {r.deviation}% от {isLow ? 'нижней' : 'верхней'} границы</div>
          )}
        </div>
      </div>

      {/* Шкала */}
      <div className="dc-scale">
        <div className="dc-scale-track">
          <div className="dc-scale-norm" style={{ left: `${normStart}%`, width: `${normWidth}%` }} />
          <div className="dc-scale-needle" style={{ left: `${r.pct}%` }} />
        </div>
        <div className="dc-scale-labels">
          <span>Низкий</span>
          <span>Норма: {r.normMin}{r.normMax < 99 ? ` – ${r.normMax}` : '+'}</span>
          <span>Высокий</span>
        </div>
      </div>

      {/* Клиническая интерпретация */}
      {!isNormal && (
        <div className="dc-interp">
          <div className="dc-interp-ttl">
            {isLow ? '🔽 Возможные причины снижения' : '🔼 Возможные причины повышения'}
          </div>
          <div className="dc-interp-txt">{isLow ? r.lowCauses : r.highCauses}</div>

          {r.tips && (
            <>
              <div className="dc-interp-ttl" style={{ marginTop: 14 }}>💡 Что сделать</div>
              <div className="dc-interp-txt">{r.tips}</div>
            </>
          )}

          {r.doctor && r.doctor !== '-' && (
            <div className="dc-interp-doctor">
              👨‍⚕️ Рекомендуемый специалист: <strong>{r.doctor}</strong>
            </div>
          )}
        </div>
      )}

      {isNormal && (
        <div className="dc-interp dc-interp-ok">
          ✅ Показатель находится в пределах референсных значений. Это хороший результат.
        </div>
      )}

      <div className="dc-result-actions">
        <Link href={`/tests/${r.testSlug}`} className="dc-link-btn">
          📖 Подробнее о показателе →
        </Link>
        <button className="dc-reset" onClick={onReset}>Проверить ещё</button>
      </div>
    </div>
  )
}

// ─── Основной компонент ────────────────────────────────────────────────────────
export default function DecodePage() {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [selectedCat, setSelectedCat] = useState('ОАК')
  const [testSlug, setTestSlug] = useState('')
  const [value, setValue] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState('')

  const filteredTests = TESTS.filter(t => t.category === selectedCat)
  const currentTest = TESTS.find(t => t.slug === testSlug) || null

  function handleCatChange(cat: string) {
    setSelectedCat(cat); setTestSlug(''); setValue(''); setError('')
  }

  function decode() {
    setError('')
    if (!testSlug) { setError('Выберите показатель'); return }
    const v = parseFloat(value.replace(',', '.'))
    if (isNaN(v) || v < 0) { setError('Введите корректное числовое значение'); return }
    const test = TESTS.find(t => t.slug === testSlug)!
    const r = interpret(v, test, sex)
    setResults(prev => [r, ...prev.filter(x => x.testSlug !== testSlug)])
    setValue('')
    setTestSlug('')
  }

  function removeResult(slug: string) {
    setResults(prev => prev.filter(r => r.testSlug !== slug))
  }

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

        .dc { background: var(--bord-d); }
        .dc-top { background: var(--bord); padding: 6px 0; text-align: center; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .dc-main { padding: 18px 24px 16px; display: flex; align-items: center; justify-content: center; }
        .dc-logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: white; text-decoration: none; }
        .dc-logo span { color: var(--acc); }

        .dc-bread { background: var(--paper-d); border-bottom: 1px solid var(--rule); }
        .dc-bread-in { max-width: 860px; margin: 0 auto; padding: 10px 24px; font-size: 12px; color: var(--ink-30); display: flex; gap: 6px; align-items: center; }
        .dc-bread a { color: var(--ink-60); text-decoration: none; }
        .dc-bread a:hover { color: var(--bord); }
        .dc-bread-sep { color: var(--rule); }

        .dc-body { background: var(--paper); min-height: 70vh; }
        .dc-wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 72px; }
        .dc-layout { display: grid; grid-template-columns: 360px 1fr; gap: 32px; align-items: start; }

        .dc-hdr { margin-bottom: 28px; }
        .dc-ico { font-size: 40px; margin-bottom: 10px; display: block; }
        .dc-ttl { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: var(--ink); margin-bottom: 6px; }
        .dc-sub { font-size: 14px; color: var(--ink-60); line-height: 1.6; margin-bottom: 8px; }
        .dc-disclaimer { font-size: 11px; color: var(--ink-30); line-height: 1.5; padding: 8px 12px; background: white; border-left: 2px solid var(--rule); }

        .dc-card { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 24px; position: sticky; top: 16px; }
        .dc-card-ttl { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 18px; }

        .dc-sex { display: flex; gap: 0; margin-bottom: 18px; border: 1px solid var(--rule); border-radius: 2px; overflow: hidden; }
        .dc-sex-btn { flex: 1; padding: 10px; font-size: 13px; font-weight: 600; text-align: center; cursor: pointer; background: white; border: none; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .dc-sex-btn.active { background: var(--bord); color: white; }
        .dc-sex-btn:hover:not(.active) { background: var(--bord-l); color: var(--bord); }

        .dc-cat-tabs { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 16px; }
        .dc-cat-tab { padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer; background: white; border: 1px solid var(--rule); border-radius: 20px; color: var(--ink-60); transition: all 0.15s; font-family: 'Golos Text', sans-serif; }
        .dc-cat-tab.active { background: var(--bord-d); border-color: var(--bord-d); color: white; }
        .dc-cat-tab:hover:not(.active) { border-color: var(--bord); color: var(--bord); }

        .dc-field { margin-bottom: 14px; }
        .dc-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-60); margin-bottom: 6px; display: block; }
        .dc-select { width: 100%; padding: 10px 12px; border: 1px solid var(--rule); border-radius: 2px; font-size: 14px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; cursor: pointer; transition: border-color 0.15s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239A8A78' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 30px; }
        .dc-select:focus { border-color: var(--bord); }

        .dc-input-wrap { display: flex; align-items: center; }
        .dc-input { flex: 1; padding: 10px 12px; border: 1px solid var(--rule); border-radius: 2px; font-size: 22px; font-family: 'Golos Text', sans-serif; background: var(--paper); color: var(--ink); outline: none; font-weight: 700; transition: border-color 0.15s; }
        .dc-input:focus { border-color: var(--bord); }
        .dc-unit { font-size: 13px; color: var(--ink-30); white-space: nowrap; min-width: 48px; }
        .dc-norm-hint { font-size: 11px; color: var(--ink-30); margin-top: 4px; }

        .dc-btn { width: 100%; padding: 12px; background: var(--bord); color: white; border: none; border-radius: 2px; font-size: 14px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.15s; font-family: 'Golos Text', sans-serif; margin-top: 4px; }
        .dc-btn:hover { background: var(--bord-m); }
        .dc-error { font-size: 12px; color: #DC2626; margin-top: 8px; padding: 8px 12px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 2px; }

        /* Правая колонка — результаты */
        .dc-results-col { display: flex; flex-direction: column; gap: 20px; }
        .dc-empty { text-align: center; padding: 60px 0; }
        .dc-empty-ico { font-size: 48px; opacity: 0.2; margin-bottom: 12px; }
        .dc-empty-txt { font-size: 14px; color: var(--ink-30); line-height: 1.6; }

        .dc-result { background: white; border: 1px solid var(--rule); border-radius: 2px; padding: 24px; position: relative; }
        .dc-result-close { position: absolute; top: 14px; right: 14px; background: none; border: none; cursor: pointer; color: var(--ink-30); font-size: 16px; line-height: 1; padding: 4px; }
        .dc-result-close:hover { color: var(--bord); }
        .dc-result-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
        .dc-result-val { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 900; line-height: 1; }
        .dc-result-unit { font-size: 16px; font-weight: 400; color: var(--ink-30); }
        .dc-result-norm-hint { font-size: 11px; color: var(--ink-30); margin-top: 4px; }
        .dc-result-right { flex: 1; min-width: 140px; }
        .dc-result-test { font-size: 11px; color: var(--ink-30); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .dc-result-badge { display: inline-block; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 2px; }
        .dc-result-dev { font-size: 11px; color: var(--ink-30); margin-top: 5px; }

        .dc-scale { margin-bottom: 16px; }
        .dc-scale-track { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #1E40AF 0%, #2563EB 18%, #22c55e 32%, #22c55e 68%, #D97706 82%, #DC2626 100%); position: relative; margin-bottom: 6px; }
        .dc-scale-norm { position: absolute; top: 0; height: 100%; background: rgba(255,255,255,0.28); border-radius: 3px; }
        .dc-scale-needle { position: absolute; top: -5px; width: 4px; height: 18px; background: var(--ink); border-radius: 2px; transform: translateX(-50%); box-shadow: 0 1px 4px rgba(0,0,0,0.25); transition: left 0.4s cubic-bezier(.4,0,.2,1); }
        .dc-scale-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--ink-30); }

        .dc-interp { background: var(--paper); border-radius: 2px; padding: 14px 16px; margin-bottom: 14px; font-size: 13px; color: var(--ink-60); line-height: 1.65; }
        .dc-interp-ok { background: #F0FDF4; color: #166534; }
        .dc-interp-ttl { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 6px; }
        .dc-interp-txt { font-size: 13px; color: var(--ink-60); line-height: 1.65; }
        .dc-interp-doctor { margin-top: 10px; font-size: 13px; color: var(--ink); padding: 8px 12px; background: white; border-left: 2px solid var(--bord); }
        .dc-interp-doctor strong { color: var(--bord); }

        .dc-result-actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
        .dc-link-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--bord); text-decoration: none; padding: 8px 14px; border: 1px solid var(--bord-l); border-radius: 2px; transition: all 0.15s; }
        .dc-link-btn:hover { background: var(--bord-l); }
        .dc-reset { font-size: 12px; color: var(--ink-30); background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0; }

        .dc-ad-box { background: white; border: 1px solid var(--rule); padding: 14px; margin-top: 28px; }
        .dc-ad-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 8px; }
        .dc-ad-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }
        .dc-ad-under { background: white; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 20px 0; }
        .dc-ad-under-in { max-width: 860px; margin: 0 auto; padding: 0 24px; }
        .dc-ad-under-slot { min-height: 90px; background: var(--paper-d); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-30); text-align: center; }

        .dc-foot { background: var(--ink); color: rgba(255,255,255,0.65); padding: 24px 0 18px; }
        .dc-foot-in { max-width: 860px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .dc-foot-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: white; text-decoration: none; }
        .dc-foot-logo span { color: var(--acc); }
        .dc-foot-lnks { display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap; }
        .dc-foot-lnks a { color: rgba(255,255,255,0.65); text-decoration: none; }
        .dc-foot-lnks a:hover { color: var(--acc); }
        .dc-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); width: 100%; text-align: center; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 760px) {
          .dc-layout { grid-template-columns: 1fr; }
          .dc-card { position: static; }
          .dc-wrap { padding: 24px 14px 48px; }
          .dc-ttl { font-size: 24px; }
          .dc-result-val { font-size: 40px; }
        }
      `}</style>

      

      <div className="dc-bread">
        <div className="dc-bread-in">
          <Link href="/">Главная</Link>
          <span className="dc-bread-sep">›</span>
          <Link href="/tests">Справочник анализов</Link>
          <span className="dc-bread-sep">›</span>
          <span>Расшифровка</span>
        </div>
      </div>

      <div className="dc-body">
        <div className="dc-wrap">
          <div className="dc-hdr">
            <span className="dc-ico">🔬</span>
            <h1 className="dc-ttl">Расшифровка анализов</h1>
            <p className="dc-sub">Введите значение из своего бланка — получите интерпретацию с возможными причинами и рекомендациями</p>
            <div className="dc-disclaimer">⚠️ Носит ознакомительный характер. Диагноз ставит только врач с учётом всей клинической картины.</div>
          </div>

          <div className="dc-layout">
            {/* Левая колонка — форма */}
            <div>
              <div className="dc-card">
                <div className="dc-card-ttl">Введите показатель</div>

                <div className="dc-sex">
                  <button className={`dc-sex-btn${sex === 'male' ? ' active' : ''}`} onClick={() => setSex('male')}>♂ Мужской</button>
                  <button className={`dc-sex-btn${sex === 'female' ? ' active' : ''}`} onClick={() => setSex('female')}>♀ Женский</button>
                </div>

                <div className="dc-field">
                  <div className="dc-cat-tabs">
                    {CATEGORIES.map(cat => (
                      <button key={cat} className={`dc-cat-tab${selectedCat === cat ? ' active' : ''}`} onClick={() => handleCatChange(cat)}>{cat}</button>
                    ))}
                  </div>
                  <select className="dc-select" value={testSlug} onChange={e => { setTestSlug(e.target.value); setValue(''); setError('') }}>
                    <option value="">— Выберите показатель —</option>
                    {filteredTests.map(t => <option key={t.slug} value={t.slug}>{t.title} ({t.unit || 'б/р'})</option>)}
                  </select>
                </div>

                <div className="dc-field">
                  <label className="dc-label">Ваше значение</label>
                  <div className="dc-input-wrap">
                    <input
                      className="dc-input"
                      type="number" step="any" placeholder="0.0"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && decode()}
                    />
                  </div>
                  {currentTest && (
                    <div className="dc-norm-hint">
                      Норма ({sex === 'male' ? 'муж.' : 'жен.'}):&nbsp;
                      {sex === 'male' ? currentTest.mMin : currentTest.fMin}
                      {(sex === 'male' ? currentTest.mMax : currentTest.fMax) < 99
                        ? ` – ${sex === 'male' ? currentTest.mMax : currentTest.fMax}`
                        : '+'}
                      {currentTest.unit ? ` ${currentTest.unit}` : ''}
                    </div>
                  )}
                </div>

                <button className="dc-btn" onClick={decode}>Расшифровать →</button>
                {error && <div className="dc-error">{error}</div>}

                {results.length > 0 && (
                  <div className="dc-ad-box" style={{ marginTop: 20 }}>
                    <div className="dc-ad-label">Реклама</div>
                    <div id="yandex_rtb_decode_sidebar" className="dc-ad-slot">Реклама РСЯ</div>
                  </div>
                )}
              </div>
            </div>

            {/* Правая колонка — результаты */}
            <div className="dc-results-col">
              {results.length === 0 ? (
                <div className="dc-empty">
                  <div className="dc-empty-ico">🔬</div>
                  <div className="dc-empty-txt">
                    Выберите показатель слева,<br/>введите значение и нажмите «Расшифровать».<br/><br/>
                    Можно проверить несколько анализов сразу — они выстроятся здесь в список.
                  </div>
                </div>
              ) : (
                results.map(r => (
                  <div key={r.testSlug} style={{ position: 'relative' }}>
                    <button className="dc-result-close" onClick={() => removeResult(r.testSlug)} title="Убрать">✕</button>
                    <ResultCard r={r} onReset={() => removeResult(r.testSlug)} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dc-ad-box">
            <div className="dc-ad-label">Реклама</div>
            <div id="yandex_rtb_decode_1" className="dc-ad-slot">Реклама РСЯ — горизонтальный баннер</div>
          </div>
        </div>
      </div>

      <div className="dc-ad-under">
        <div className="dc-ad-under-in">
          <div className="dc-ad-label">Реклама</div>
          <div id="yandex_rtb_decode_under" className="dc-ad-under-slot">Реклама под расшифровщиком (728×90)</div>
        </div>
      </div>

      
    </>
  )
}
