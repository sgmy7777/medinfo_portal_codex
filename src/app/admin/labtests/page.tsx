'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ExternalLink, LogOut, Plus, Pencil, Trash2, Search } from 'lucide-react'

const CATEGORIES: Record<string, string> = {
  blood_general:  'Общий анализ крови',
  blood_biochem:  'Биохимия крови',
  blood_hormones: 'Гормоны',
  urine:          'Анализ мочи',
  coagulation:    'Коагулограмма',
  immunology:     'Иммунология',
  other:          'Прочие',
}

const CAT_COLORS: Record<string, string> = {
  blood_general:  'bg-red-100 text-red-700',
  blood_biochem:  'bg-orange-100 text-orange-700',
  blood_hormones: 'bg-purple-100 text-purple-700',
  urine:          'bg-blue-100 text-blue-700',
  coagulation:    'bg-pink-100 text-pink-700',
  immunology:     'bg-green-100 text-green-700',
  other:          'bg-gray-100 text-gray-700',
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#4A0F17] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-xl font-black">
            Здрав<span className="text-amber-400">Инфо</span>
          </Link>
          <nav className="flex gap-1">
            <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <FileText size={13} /> Статьи
            </Link>
            <Link href="/admin/symptoms" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <ExternalLink size={13} /> Симптомы
            </Link>
            <Link href="/admin/labtests" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded bg-white/15 text-white transition-colors">
              <Search size={13} /> Анализы
            </Link>
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-white/60 hover:text-white text-xs">
          <LogOut size={13} className="mr-1" /> Выйти
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Справочник анализов</h1>
            <p className="text-sm text-gray-500 mt-1">{tests.length} показателей в базе</p>
          </div>
          <Link href="/admin/labtests/new">
            <Button className="bg-[#6B1F2A] hover:bg-[#8B2D3A] text-white">
              <Plus size={15} className="mr-1.5" /> Добавить анализ
            </Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Поиск по названию или категории..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Ничего не найдено</div>
        ) : (
          Object.entries(CATEGORIES).map(([catKey, catLabel]) => {
            const list = grouped[catKey]
            if (!list?.length) return null
            return (
              <div key={catKey} className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">{catLabel}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{list.length}</span>
                </div>
                <Card>
                  <CardContent className="p-0">
                    {list.map((test: any, i: number) => (
                      <div key={test.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < list.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{test.title}</span>
                            {test.unit && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{test.unit}</span>}
                            {test.normGeneral && <span className="text-xs text-gray-500">{test.normGeneral}</span>}{test.normMale && <span className="text-xs text-gray-500"> ♂ {test.normMale}</span>}{test.normFemale && <span className="text-xs text-gray-500"> ♀ {test.normFemale}</span>}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">/tests/{test.slug}</div>
                        </div>
                        <Badge className={`text-xs shrink-0 ${CAT_COLORS[test.category] ?? 'bg-gray-100 text-gray-600'}`}>
                          {CATEGORIES[test.category] ?? test.category}
                        </Badge>
                        <div className="flex items-center gap-1 shrink-0">
                          <Link href={`/tests/${test.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"><ExternalLink size={13} /></Button>
                          </Link>
                          <Link href={`/admin/labtests/${test.slug}`}>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#6B1F2A] h-8 w-8 p-0"><Pencil size={13} /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => deleteTest(test.slug, test.title)}
                            className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"><Trash2 size={13} /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
