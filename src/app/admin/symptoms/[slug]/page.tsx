'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ExternalLink, LogOut, Activity, ArrowLeft, Save, X } from 'lucide-react'

const SYSTEMS = [
  { value: 'head',    label: 'Голова и шея' },
  { value: 'chest',   label: 'Грудная клетка' },
  { value: 'abdomen', label: 'Живот и пищеварение' },
  { value: 'skin',    label: 'Кожа и волосы' },
  { value: 'joints',  label: 'Суставы и спина' },
  { value: 'general', label: 'Общие симптомы' },
  { value: 'neuro',   label: 'Неврология' },
  { value: 'urology', label: 'Урология' },
  { value: 'women',   label: 'Женское здоровье' },
]

const SEVERITIES = [
  { value: 'low',    label: 'Несрочно', desc: 'Можно обратиться планово' },
  { value: 'medium', label: 'Умеренно', desc: 'Обратитесь в ближайшее время' },
  { value: 'high',   label: 'Срочно',   desc: 'Требуется скорейшая помощь' },
]

function slugify(str: string) {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
    'щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  }
  return str.toLowerCase().split('').map(c => map[c] ?? c).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80)
}

export default function AdminSymptomEditPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.slug === 'new'

  const [form, setForm] = useState({
    title: '', slug: '', description: '', bodySystem: 'general', severity: 'medium',
  })
  const [articleSearch, setArticleSearch] = useState('')
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [linkedArticles, setLinkedArticles] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    fetchArticles()
    if (!isNew) fetchSymptom()
  }, [])

  async function fetchSymptom() {
    const res = await fetch(`/api/admin/symptoms/${params.slug}`)
    const json = await res.json()
    if (json.data) {
      const s = json.data
      setForm({ title: s.title, slug: s.slug, description: s.description ?? '', bodySystem: s.bodySystem, severity: s.severity })
      setAutoSlug(false)
      setLinkedArticles(s.articles.map((sa: any) => sa.article).filter(Boolean))
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
      prev.find(a => a.id === article.id)
        ? prev.filter(a => a.id !== article.id)
        : [...prev, article]
    )
  }

  async function save() {
    setSaving(true)
    setError('')
    const articleSlugs = linkedArticles.map((a: any) => a.slug)
    const body = { ...form, articleSlugs }

    const url = isNew ? '/api/admin/symptoms' : `/api/admin/symptoms/${params.slug}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Ошибка сохранения')
      setSaving(false)
      return
    }
    router.push('/admin/symptoms')
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const filteredArticles = allArticles.filter(a =>
    a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
    a.category?.title?.toLowerCase().includes(articleSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">ЗдравИнфо</p>
              <p className="text-xs text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <FileText className="h-4 w-4" />Статьи
            </Link>
            <Link href="/admin/symptoms" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent text-accent-foreground">
              <Activity className="h-4 w-4" />Симптомы
            </Link>
          </nav>
          <div className="px-3 py-4 border-t border-border space-y-1">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <ExternalLink className="h-4 w-4" />Открыть сайт
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <LogOut className="h-4 w-4" />Выйти
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/symptoms"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <h1 className="text-lg font-semibold">{isNew ? 'Новый симптом' : 'Редактировать симптом'}</h1>
            </div>
            <Button size="sm" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </header>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">

            {/* Left: main fields */}
            <div className="lg:col-span-2 space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-4 py-3 text-sm">{error}</div>
              )}

              <Card>
                <CardHeader><CardTitle className="text-base">Основное</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Название симптома *</label>
                    <Input
                      placeholder="Например: Головная боль"
                      value={form.title}
                      onChange={e => handleTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">URL (slug)</label>
                    <Input
                      placeholder="golovnaya-bol"
                      value={form.slug}
                      onChange={e => { setAutoSlug(false); setForm(f => ({ ...f, slug: e.target.value })) }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Адрес: /symptoms/{form.slug || '...'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Описание</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Краткое описание симптома — появится в карточке на странице /symptoms"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Linked articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Связанные статьи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {linkedArticles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-border">
                      {linkedArticles.map((a: any) => (
                        <div key={a.id} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded px-2.5 py-1 text-xs font-medium">
                          {a.title.substring(0, 35)}{a.title.length > 35 ? '…' : ''}
                          <button onClick={() => toggleArticle(a)} className="hover:text-destructive ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Поиск статей..."
                      className="pl-8 text-sm h-8"
                      value={articleSearch}
                      onChange={e => setArticleSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {filteredArticles.slice(0, 40).map((a: any) => {
                      const linked = linkedArticles.find((l: any) => l.id === a.id)
                      return (
                        <button
                          key={a.id}
                          onClick={() => toggleArticle(a)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between gap-2 ${
                            linked ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                          }`}
                        >
                          <span className="truncate">{a.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{a.category?.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: system & severity */}
            <div className="space-y-5">
              <Card>
                <CardHeader><CardTitle className="text-base">Система органов</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {SYSTEMS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setForm(f => ({ ...f, bodySystem: s.value }))}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        form.bodySystem === s.value
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Срочность</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {SEVERITIES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setForm(f => ({ ...f, severity: s.value }))}
                      className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${
                        form.severity === s.value ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{s.label}</div>
                      <div className={`text-xs mt-0.5 ${form.severity === s.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{s.desc}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
