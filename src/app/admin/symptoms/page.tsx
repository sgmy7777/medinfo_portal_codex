'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText, ExternalLink, LogOut, Activity,
  Plus, Pencil, Trash2, Search, FlaskConical} from 'lucide-react'

const SYSTEMS: Record<string, string> = {
  head: 'Голова и шея', chest: 'Грудная клетка', abdomen: 'Живот',
  skin: 'Кожа и волосы', joints: 'Суставы и спина', general: 'Общие',
  neuro: 'Неврология', urology: 'Урология', women: 'Женское здоровье',
}

const SEV_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
}
const SEV_LABELS: Record<string, string> = {
  low: 'Несрочно', medium: 'Умеренно', high: 'Срочно',
}

export default function AdminSymptomsPage() {
  const [symptoms, setSymptoms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchSymptoms() }, [])

  async function fetchSymptoms() {
    setLoading(true)
    const res = await fetch('/api/admin/symptoms')
    const json = await res.json()
    setSymptoms(json.data ?? [])
    setLoading(false)
  }

  async function deleteSymptom(slug: string, title: string) {
    if (!confirm(`Удалить симптом «${title}»?`)) return
    await fetch(`/api/admin/symptoms/${slug}`, { method: 'DELETE' })
    fetchSymptoms()
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const filtered = symptoms.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (SYSTEMS[s.bodySystem] ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Группируем по системам
  const grouped: Record<string, any[]> = {}
  for (const s of filtered) {
    if (!grouped[s.bodySystem]) grouped[s.bodySystem] = []
    grouped[s.bodySystem].push(s)
  }

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
              <FileText className="h-4 w-4" />
              Статьи
            </Link>
            <Link href="/admin/symptoms" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent text-accent-foreground">
              <Activity className="h-4 w-4" />
              Симптомы
            </Link>
            <Link
              href="/admin/labtests"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <FlaskConical className="h-4 w-4" />
              Анализы
            </Link>
          </nav>

          <div className="px-3 py-4 border-t border-border space-y-1">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <ExternalLink className="h-4 w-4" />
              Открыть сайт
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <h1 className="text-lg font-semibold">Симптомы <span className="text-muted-foreground font-normal text-sm">({symptoms.length})</span></h1>
            <Button asChild size="sm">
              <Link href="/admin/symptoms/new">
                <Plus className="h-4 w-4" />
                Новый симптом
              </Link>
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск симптомов..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Загрузка...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">Симптомы не найдены</div>
            ) : (
              Object.entries(SYSTEMS).map(([key, label]) => {
                const list = grouped[key]
                if (!list?.length) return null
                return (
                  <div key={key}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</h2>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">{list.length}</span>
                    </div>
                    <div className="space-y-2">
                      {list.map((s: any) => (
                        <Card key={s.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{s.title}</span>
                                  <Badge variant="outline" className={`text-xs ${SEV_COLORS[s.severity]}`}>
                                    {SEV_LABELS[s.severity]}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {s.articles?.length ?? 0} статей
                                  </span>
                                </div>
                                {s.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/symptoms/${s.slug}`} target="_blank">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/symptoms/${s.slug}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteSymptom(s.slug, s.title)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
