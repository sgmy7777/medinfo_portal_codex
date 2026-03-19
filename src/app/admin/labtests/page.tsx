'use client'

import { FileText, ExternalLink, LogOut, Plus, Pencil, Trash2, Search, Activity, FlaskConical, Stethoscope } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const CATEGORIES: Record<string, string> = {
  blood_general:  'Общий анализ крови',
  blood_biochem:  'Биохимия крови',
  hormones:       'Гормоны',
  urine:          'Анализ мочи',
  coagulation:    'Коагулограмма',
  immune:         'Иммунология',
  tumor_markers:  'Онкомаркёры',
}

export default function AdminLabTestsPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTests() }, [])

  async function fetchTests() {
    setLoading(true)
    const res = await fetch('/api/admin/labtests')
    const json = await res.json()
    setTests(json.data ?? [])
    setLoading(false)
  }

  async function deleteTest(slug: string, title: string) {
    if (!confirm(`Удалить анализ «${title}»?`)) return
    await fetch(`/api/admin/labtests/${slug}`, { method: 'DELETE' })
    fetchTests()
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const filtered = tests.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (CATEGORIES[t.category] ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const grouped: Record<string, typeof tests> = {}
  for (const t of filtered) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
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
            <h1 className="text-lg font-semibold">Справочник анализов</h1>
            <Button asChild size="sm">
              <Link href="/admin/labtests/new">
                <Plus className="h-4 w-4" /> Добавить анализ
              </Link>
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего показателей</p>
                    <p className="text-2xl font-bold mt-0.5">{tests.length}</p>
                  </div>
                  <div className="rounded-lg p-2.5 bg-muted text-blue-600">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или категории..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* List grouped by category */}
            {loading ? (
              <Card>
                <CardContent className="py-20 text-center text-muted-foreground">
                  <div className="animate-pulse">Загрузка...</div>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-3">
                    {search ? 'Ничего не найдено' : 'Анализов пока нет'}
                  </p>
                  {!search && (
                    <Button asChild size="sm">
                      <Link href="/admin/labtests/new">Добавить первый</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              Object.entries(CATEGORIES).map(([catKey, catLabel]) => {
                const list = grouped[catKey]
                if (!list?.length) return null
                return (
                  <Card key={catKey}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{catLabel}</span>
                        <span className="text-sm font-normal text-muted-foreground">{list.length}</span>
                      </CardTitle>
                    </CardHeader>
                    <Separator className="mt-4" />
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody className="divide-y divide-border">
                          {list.map((test: any) => (
                            <tr key={test.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-3.5">
                                <p className="font-medium text-sm">{test.title}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">/tests/{test.slug}</p>
                              </td>
                              <td className="px-4 py-3.5 hidden md:table-cell">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                  {test.unit && <Badge variant="secondary">{test.unit}</Badge>}
                                  {test.normGeneral && <span>{test.normGeneral}</span>}
                                  {test.normMale && <span>♂ {test.normMale}</span>}
                                  {test.normFemale && <span>♀ {test.normFemale}</span>}
                                </div>
                              </td>
                              <td className="px-6 py-3.5">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/tests/${test.slug}`} target="_blank">
                                      <ExternalLink className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/labtests/${test.slug}`}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteTest(test.slug, test.title)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
