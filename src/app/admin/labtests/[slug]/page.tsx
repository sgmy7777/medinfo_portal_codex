'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FlaskConical, ExternalLink, LogOut, Activity, ArrowLeft, Save, FileText, Search } from 'lucide-react'

const CATEGORIES = [
  { value: 'blood_general', label: 'Общий анализ крови' },
  { value: 'blood_biochem',  label: 'Биохимия крови' },
  { value: 'hormones',       label: 'Гормоны' },
  { value: 'urine',          label: 'Анализ мочи' },
  { value: 'coagulation',    label: 'Коагулограмма' },
  { value: 'immune',         label: 'Иммунология' },
  { value: 'tumor_markers',  label: 'Онкомаркёры' },
]

function slugify(str: string) {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
    'щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  }
  return str.toLowerCase().split('').map(c => map[c] ?? c).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80)
}

export default function AdminLabTestEditPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.slug === 'new'

  const [form, setForm] = useState({
    title: '', slug: '', description: '',
    category: 'blood_general', unit: '',
    normMale: '', normFemale: '', normGeneral: '',
    preparation: '',
  })
  const [articleSearch, setArticleSearch] = useState('')
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [linkedArticles, setLinkedArticles] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    fetchArticles()
    if (!isNew) fetchTest()
  }, [])

  async function fetchTest() {
    const res = await fetch(`/api/admin/labtests/${params.slug}`)
    const json = await res.json()
    if (json.data) {
      const t = json.data
      setForm({
        title: t.title ?? '',
        slug: t.slug ?? '',
        description: t.description ?? '',
        category: t.category ?? 'blood_general',
        unit: t.unit ?? '',
        normMale: t.normMale ?? '',
        normFemale: t.normFemale ?? '',
        normGeneral: t.normGeneral ?? '',
        preparation: t.preparation ?? '',
      })
      setAutoSlug(false)
      setLinkedArticles(t.articles?.map((ta: any) => ta.article).filter(Boolean) ?? [])
    }
  }

  async function fetchArticles() {
    const res = await fetch('/api/articles?admin=true&pageSize=200')
    const json = await res.json()
    setAllArticles(json.data ?? [])
  }

  function handleTitle(val: string) {
    setForm(f => ({ ...f, title: val, slug: autoSlug ? slugify(val) : f.slug }))
  }

  function toggleArticle(article: any) {
    setLinkedArticles(prev =>
      prev.find((a: any) => a.id === article.id)
        ? prev.filter((a: any) => a.id !== article.id)
        : [...prev, article]
    )
  }

  async function save() {
    setSaving(true)
    setError('')
    const articleSlugs = linkedArticles.map((a: any) => a.slug)
    const body = { ...form, articleSlugs }

    const url = isNew ? '/api/admin/labtests' : `/api/admin/labtests/${params.slug}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    let json: any = {}
    try { json = await res.json() } catch { /* пустой ответ */ }
    if (!res.ok) {
      setError(json.error ?? 'Ошибка сохранения')
      setSaving(false)
      return
    }
    router.push('/admin/labtests')
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const filteredArticles = allArticles.filter(a =>
    a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
    a.category?.title?.toLowerCase().includes(articleSearch.toLowerCase())
  )

  const selectedCat = CATEGORIES.find(c => c.value === form.category)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">ЗдравИнфо</p>
              <p className="text-xs text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <FileText className="h-4 w-4" /> Статьи
            </Link>
            <Link href="/admin/symptoms" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <Activity className="h-4 w-4" /> Симптомы
            </Link>
            <Link href="/admin/labtests" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent text-accent-foreground">
              <FlaskConical className="h-4 w-4" /> Анализы
            </Link>
          </nav>
          <div className="px-3 py-4 border-t border-border space-y-1">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <ExternalLink className="h-4 w-4" /> Открыть сайт
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <LogOut className="h-4 w-4" /> Выйти
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/labtests"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <h1 className="text-lg font-semibold">{isNew ? 'Новый анализ' : 'Редактировать анализ'}</h1>
            </div>
            <Button onClick={save} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </header>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Левая колонка */}
            <div className="lg:col-span-2 space-y-4">

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md px-4 py-3 text-sm">{error}</div>
              )}

              <Card>
                <CardHeader><CardTitle className="text-base">Основное</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Название анализа *</label>
                    <Input placeholder="Например: Гемоглобин (Hb)" value={form.title} onChange={e => handleTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">URL (slug)</label>
                    <Input
                      value={form.slug}
                      onChange={e => { setAutoSlug(false); setForm(f => ({ ...f, slug: e.target.value })) }}
                      placeholder="gemoglobin"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Адрес: /tests/{form.slug || '...'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Единица измерения</label>
                    <Input placeholder="г/л, ммоль/л, Ед/л..." value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Референсные значения</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Норма для мужчин</label>
                    <Input placeholder="130–170 г/л" value={form.normMale} onChange={e => setForm(f => ({ ...f, normMale: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Норма для женщин</label>
                    <Input placeholder="120–155 г/л" value={form.normFemale} onChange={e => setForm(f => ({ ...f, normFemale: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Общая норма (если нет разделения по полу)</label>
                    <Input placeholder="0,8–1,2" value={form.normGeneral} onChange={e => setForm(f => ({ ...f, normGeneral: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Описание</CardTitle></CardHeader>
                <CardContent>
                  <textarea
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    placeholder="Описание анализа, причины отклонений, клиническое значение..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Подготовка к сдаче</CardTitle></CardHeader>
                <CardContent>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    placeholder="Натощак, исключить физические нагрузки..."
                    value={form.preparation}
                    onChange={e => setForm(f => ({ ...f, preparation: e.target.value }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Связанные статьи</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {linkedArticles.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {linkedArticles.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between rounded-md bg-accent px-3 py-2 text-sm">
                          <span className="font-medium">{a.title}</span>
                          <button onClick={() => toggleArticle(a)} className="text-muted-foreground hover:text-destructive ml-2">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Поиск статей..."
                      value={articleSearch}
                      onChange={e => setArticleSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto border border-border rounded-md divide-y divide-border">
                    {filteredArticles.slice(0, 40).map((a: any) => {
                      const linked = !!linkedArticles.find((l: any) => l.id === a.id)
                      return (
                        <button
                          key={a.id}
                          onClick={() => toggleArticle(a)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent ${linked ? 'bg-accent' : ''}`}
                        >
                          <span className={linked ? 'font-medium' : ''}>{a.title}</span>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">{a.category?.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Правая колонка */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Категория</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                      className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors ${form.category === cat.value ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base text-muted-foreground">Выбрано</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{selectedCat?.label}</p>
                  {form.unit && <p className="text-xs text-muted-foreground mt-1">Единица: {form.unit}</p>}
                  {form.normGeneral && <p className="text-xs text-muted-foreground">Норма: {form.normGeneral}</p>}
                  {(form.normMale || form.normFemale) && (
                    <>
                      {form.normMale && <p className="text-xs text-muted-foreground">♂ {form.normMale}</p>}
                      {form.normFemale && <p className="text-xs text-muted-foreground">♀ {form.normFemale}</p>}
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Статей: {linkedArticles.length}
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
