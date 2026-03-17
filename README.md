# ЗдравИнфо — Медицинский информационный портал

> Современный медицинский портал на Next.js с редакционным дизайном, админ-панелью и монетизацией через Яндекс РСЯ.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase)

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 15 (App Router) |
| Язык | TypeScript |
| Стили | Tailwind CSS + CSS-in-JS |
| База данных | PostgreSQL (Supabase) |
| ORM | Prisma 6.6 |
| Авторизация | JWT (jose) + bcryptjs |
| UI-компоненты | shadcn/ui (Radix UI) |
| Почта | Nodemailer (mail.ru SMTP) |
| Хостинг | Vercel (бесплатно) |
| Шрифты | Playfair Display + Golos Text |

---

## Возможности

- **Публичный сайт** — главная с hero-блоком, страницы статей, разделы по категориям
- **18 медицинских разделов** — кардиология, неврология, педиатрия и др.
- **Редакционный дизайн** — editorial бордо-стиль, типографика, адаптив
- **Админ-панель** — создание, редактирование и публикация статей
- **Монетизация** — 5 рекламных мест для Яндекс РСЯ
- **Счётчик просмотров** — автоматически инкрементируется при открытии статьи
- **«Читать также»** — похожие статьи из той же категории
- **Пагинация** — SEO-friendly постраничная навигация (`?page=N`)
- **Форма обратной связи** — с rate limiting и отправкой на email
- **Политика конфиденциальности** — готовая страница для РСЯ
- **Безопасность** — security headers, валидация, rate limiting

---

## Быстрый старт

### 1. Клонировать и установить зависимости
```bash
git clone <repo-url>
cd medportal
npm install
```

### 2. Настроить переменные окружения
```bash
cp .env.example .env
```

Заполните `.env`:

```env
# Supabase → Settings → Database → Connection string (Transaction pooler, порт 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Прямое подключение (для миграций, только с VPN если Россия)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# Сгенерировать: openssl rand -base64 32
JWT_SECRET="ваш-случайный-секрет"

# URL сайта
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# mail.ru → Настройки → Безопасность → Пароли для внешних приложений
MAIL_USER="ваш@mail.ru"
MAIL_PASS="пароль-приложения"
```

### 3. Применить схему БД и заполнить данными
```bash
# Требует VPN (прямое подключение к Supabase, порт 5432)
npm run db:push   # Создаёт таблицы
npm run db:seed   # Создаёт 18 категорий, автора и тестовую статью
```

### 4. Запустить в режиме разработки
```bash
npm run dev
```

| Адрес | Описание |
|-------|----------|
| http://localhost:3000 | Публичный сайт |
| http://localhost:3000/admin/login | Вход в админку |

**Данные для входа после seed:**
- Email: `admin@yourdomain.ru`
- Пароль: задаётся через `scripts/change-password.ts`

---

## Структура проекта

```
medportal/
├── src/
│   ├── app/
│   │   ├── (public)/                   # Публичный сайт
│   │   │   ├── page.tsx                # Главная (hero + категории + пагинация)
│   │   │   ├── article/[slug]/         # Страница статьи
│   │   │   ├── category/[slug]/        # Раздел медицины
│   │   │   ├── privacy/                # Политика конфиденциальности
│   │   │   └── contacts/               # Контакты с формой
│   │   ├── admin/
│   │   │   ├── page.tsx                # Список статей
│   │   │   ├── login/                  # Авторизация
│   │   │   └── articles/[slug]/        # Редактор статьи
│   │   └── api/
│   │       ├── articles/               # GET, POST, PUT, DELETE статей
│   │       │   ├── view/               # POST — инкремент просмотров
│   │       ├── categories/             # GET, POST категорий
│   │       ├── authors/                # GET авторов
│   │       ├── auth/                   # POST login/logout
│   │       └── contact/                # POST форма обратной связи
│   ├── components/
│   │   ├── ui/                         # shadcn/ui компоненты
│   │   ├── admin/                      # Компоненты админки
│   │   └── public/
│   │       └── ViewCounter.tsx         # Клиентский счётчик просмотров
│   ├── lib/
│   │   ├── prisma.ts                   # Singleton клиент Prisma
│   │   └── auth.ts                     # JWT: sign / verify / requireAuth
│   └── types/
│       └── index.ts                    # TypeScript интерфейсы
├── prisma/
│   ├── schema.prisma                   # Схема БД
│   └── seed.ts                         # Начальные данные
├── scripts/
│   └── change-password.ts              # Смена пароля админа
├── .env.example                        # Шаблон переменных окружения
├── next.config.js                      # Security headers, image domains
└── tailwind.config.js
```

---

## Схема базы данных

```
AdminUser     — учётные записи администраторов
Author        — профили авторов (врачи)
Category      — разделы медицины (18 штук)
Article       — статьи (title, slug, content HTML, OG-image, теги)
Tag           — теги
ArticleTag    — связь статей и тегов (many-to-many)
```

---

## Рекламные блоки (Яндекс РСЯ)

На странице статьи размещено 5 блоков:

| ID элемента | Расположение |
|-------------|-------------|
| `yandex_rtb_sidebar_1` | Сайдбар, блок 1 |
| `yandex_rtb_sidebar_2` | Сайдбар, блок 2 |
| `yandex_rtb_sidebar_3` | Сайдбар, блок 3 |
| `yandex_rtb_incontent` | Внутри статьи |
| `yandex_rtb_under_article` | Под статьёй (728×90) |

На странице категории: `yandex_rtb_cat_sidebar`.

---

## Деплой на Vercel

```bash
# 1. Загрузить код на GitHub (убедитесь что .env в .gitignore)
git add .
git commit -m "initial"
git push

# 2. Зайти на vercel.com → Import Project → выбрать репозиторий

# 3. В Vercel Dashboard → Settings → Environment Variables добавить:
#    DATABASE_URL, DIRECT_URL, JWT_SECRET,
#    NEXT_PUBLIC_APP_URL, MAIL_USER, MAIL_PASS
```

После деплоя обновите `NEXT_PUBLIC_APP_URL` на реальный домен.

---

## Смена пароля администратора

```bash
# Требует VPN
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/change-password.ts
```

Отредактируйте `scripts/change-password.ts` — укажите нужный email и новый пароль перед запуском.

---

## Добавление Яндекс.Метрики

Вставьте счётчик в `src/app/layout.tsx` внутрь тега `<head>`:

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* Код счётчика Яндекс.Метрики */}
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшна |
| `npm run start` | Запуск продакшн-сервера |
| `npm run db:push` | Применить схему Prisma к БД |
| `npm run db:seed` | Заполнить БД начальными данными |
| `npm run db:seed:labtests` | Заполнить справочник анализов (33 показателя) |
| `npm run db:studio` | Открыть Prisma Studio (GUI для БД) |

---

## Чеклист перед деплоем

- [x] Сменить пароль администратора
- [x] Сгенерировать `JWT_SECRET` (`openssl rand -base64 32`)
- [x] Получить пароль приложения mail.ru для `MAIL_PASS`
- [ ] Добавить все переменные в Vercel
- [ ] Обновить `NEXT_PUBLIC_APP_URL` на реальный домен
- [ ] Запустить `db:seed` для создания категорий
- [ ] Заполнить профиль автора (фото, bio) в Supabase
- [ ] Подключить Яндекс.Метрику
- [ ] Подать сайт в Яндекс.Вебмастер
- [ ] Зарегистрироваться в Яндекс РСЯ (partner.yandex.ru)

---

## Особенности работы с Supabase

> ⚠️ Из России Supabase порт 5432 работает только через VPN.

| Порт | Использование | VPN |
|------|--------------|-----|
| 6543 | `DATABASE_URL` (pooler, для приложения) | Не нужен |
| 5432 | `DIRECT_URL` (для `db:push`, `db:seed`) | Нужен |
