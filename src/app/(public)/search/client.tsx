'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const CAT_LABELS: Record<string, string> = {
  blood_general: 'Общий анализ крови', blood_biochem: 'Биохимия',
  hormones: 'Гормоны', urine: 'Моча', coagulation: 'Коагулограмма',
  immune: 'Иммунология', tumor_markers: 'Онкомаркёры',
}

const SUGGESTIONS = ['гипертония', 'головная боль', 'гемоглобин', 'холестерин', 'диабет', 'ТТГ', 'инсульт', 'анемия']

function highlight(text: string, q: string): string {
  if (!q || !text) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

function Highlighted({ text, q }: { text: string; q: string }) {
  return <span dangerouslySetInnerHTML={{ __html: highlight(text, q) }} />
}

interface SearchData {
  articles: any[]
  symptoms: any[]
  tests: any[]
  total: number
  q: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') ?? ''

  const [inputVal, setInputVal] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)
  const [data, setData] = useState<SearchData | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setData(null); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(q), { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } catch {
      setData({ articles: [], symptoms: [], tests: [], total: 0, q })
    } finally {
      setLoading(false)
    }
  }, [])

  // При изменении инпута — debounce 350ms
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!inputVal.trim()) { setData(null); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      setQuery(inputVal.trim())
      doSearch(inputVal.trim())
      // Обновить URL без перезагрузки
      const url = inputVal.trim() ? '/search?q=' + encodeURIComponent(inputVal.trim()) : '/search'
      window.history.replaceState(null, '', url)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [inputVal, doSearch])

  // Первый запуск при SSR-переходе с URL
  useEffect(() => {
    if (initialQ.length >= 2) doSearch(initialQ)
    if (!initialQ) inputRef.current?.focus()
  }, [])

  const total = data?.total ?? 0
  const articles = data?.articles ?? []
  const symptoms = data?.symptoms ?? []
  const tests = data?.tests ?? []
  const q = data?.q ?? query

  return (
    <>
      <style>{`
        .sr-body{background:var(--paper);min-height:60vh}
        .sr-wrap{max-width:860px;margin:0 auto;padding:48px 24px 72px}
        .sr-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--ink);margin-bottom:6px}
        .sr-meta{font-size:14px;color:var(--ink-30);margin-bottom:24px;min-height:20px}
        .sr-meta strong{color:var(--bord)}
        .sr-form{position:relative;margin-bottom:36px}
        .sr-input{width:100%;padding:14px 50px 14px 18px;border:2px solid var(--rule);border-radius:2px;font-size:17px;font-family:inherit;background: var(--white);color:var(--ink);outline:none;transition:border-color .15s;box-sizing:border-box}
        .sr-input:focus{border-color:var(--bord)}
        .sr-clear{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink-30);font-size:18px;line-height:1;padding:4px}
        .sr-clear:hover{color:var(--bord)}
        .sr-loading{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;border:2px solid var(--rule);border-top-color:var(--bord);border-radius:50%;animation:spin .6s linear infinite}
        @keyframes spin{to{transform:translateY(-50%) rotate(360deg)}}
        .sr-section{margin-bottom:32px}
        .sr-ttl{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-30);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--rule);display:flex;justify-content:space-between}
        .sr-card{background: var(--white);border:1px solid var(--rule);border-radius:2px;padding:14px 18px;margin-bottom:6px;text-decoration:none;display:block;transition:border-color .15s,box-shadow .15s}
        .sr-card:hover{border-color:var(--bord);box-shadow:0 2px 8px rgba(107,31,42,.08)}
        .sr-cat{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--bord);margin-bottom:3px}
        .sr-name{font-size:15px;font-weight:600;color:var(--ink);line-height:1.4;margin-bottom:3px}
        .sr-desc{font-size:13px;color:var(--ink-60);line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
        .sr-badge{display:inline-block;font-size:11px;background:var(--paper-d);color:var(--ink-30);padding:2px 8px;border-radius:2px;margin-top:4px}
        .sr-more{display:inline-block;font-size:12px;font-weight:600;color:var(--bord);text-decoration:none;margin-top:4px;padding:5px 12px;border:1px solid var(--bord-l);border-radius:2px}
        .sr-more:hover{background:var(--bord-l)}
        .sr-empty{text-align:center;padding:48px 0}
        .sr-empty-ico{font-size:44px;opacity:.2;margin-bottom:10px}
        .sr-empty-txt{font-size:15px;color:var(--ink-30);line-height:1.7}
        .sr-suggest{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;justify-content:center}
        .sr-suggest button{font-size:13px;color:var(--bord);background:none;border:1px solid var(--bord-l);border-radius:20px;padding:6px 14px;cursor:pointer;font-family:inherit}
        .sr-suggest button:hover{background:var(--bord-l)}
        mark{background:#FFF3C4;color:inherit;border-radius:2px;padding:0 1px}
        .sr-kbd{display:inline-block;font-size:10px;color:var(--ink-30);background:var(--paper-d);border:1px solid var(--rule);border-radius:3px;padding:1px 5px;margin-left:6px;font-family:monospace}
      `}</style>

      <div className="sr-body">
        <div className="sr-wrap">
          <h1 className="sr-title">
            Поиск по сайту
            <span className="sr-kbd">Ctrl+K</span>
          </h1>

          <p className="sr-meta">
            {loading && inputVal.length >= 2 && <span style={{color:'var(--ink-30)'}}>Поиск...</span>}
            {!loading && q && total > 0 && <><strong>{total}</strong> результатов по запросу «<strong>{q}</strong>»</>}
            {!loading && q && total === 0 && q.length >= 2 && <>По запросу «<strong>{q}</strong>» ничего не найдено</>}
          </p>

          <div className="sr-form">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Симптом, анализ или заболевание..."
              className="sr-input"
              autoComplete="off"
              spellCheck={false}
            />
            {loading && inputVal.length >= 2
              ? <div className="sr-loading" />
              : inputVal && <button className="sr-clear" onClick={() => { setInputVal(''); setData(null); window.history.replaceState(null, '', '/search'); inputRef.current?.focus() }}>×</button>
            }
          </div>

          {/* Пустое состояние */}
          {!inputVal && (
            <div className="sr-empty">
              <div className="sr-empty-ico">🔍</div>
              <div className="sr-empty-txt">Начните вводить — результаты появятся сразу</div>
              <div className="sr-suggest">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => setInputVal(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Нет результатов */}
          {!loading && inputVal.length >= 2 && data && total === 0 && (
            <div className="sr-empty">
              <div className="sr-empty-ico">🤷</div>
              <div className="sr-empty-txt">
                Ничего не найдено. Попробуйте другой запрос или перейдите в разделы:<br />
                <Link href="/symptoms" style={{color:'var(--bord)'}}>Симптомы</Link>{' · '}
                <Link href="/tests" style={{color:'var(--bord)'}}>Анализы</Link>{' · '}
                <Link href="/calculators" style={{color:'var(--bord)'}}>Калькуляторы</Link>
              </div>
            </div>
          )}

          {/* Статьи */}
          {articles.length > 0 && (
            <div className="sr-section">
              <div className="sr-ttl"><span>📰 Статьи</span><span>{articles.length}</span></div>
              {articles.map((a: any) => (
                <Link key={a.slug} href={'/article/' + a.slug} className="sr-card">
                  {a.category && <div className="sr-cat">{a.category.title}</div>}
                  <div className="sr-name"><Highlighted text={a.title} q={q} /></div>
                  {a.excerpt && <div className="sr-desc"><Highlighted text={a.excerpt} q={q} /></div>}
                </Link>
              ))}
            </div>
          )}

          {/* Симптомы */}
          {symptoms.length > 0 && (
            <div className="sr-section">
              <div className="sr-ttl"><span>🌡️ Симптомы</span><span>{symptoms.length}</span></div>
              {symptoms.map((s: any) => (
                <Link key={s.slug} href={'/symptoms/' + s.slug} className="sr-card">
                  <div className="sr-name"><Highlighted text={s.title} q={q} /></div>
                  {s.description && (
                    <div className="sr-desc">
                      <Highlighted text={s.description.split('\n')[0].slice(0, 180)} q={q} />
                    </div>
                  )}
                </Link>
              ))}
              <Link href="/symptoms" className="sr-more">Все симптомы →</Link>
            </div>
          )}

          {/* Анализы */}
          {tests.length > 0 && (
            <div className="sr-section">
              <div className="sr-ttl"><span>🧪 Анализы</span><span>{tests.length}</span></div>
              {tests.map((t: any) => (
                <Link key={t.slug} href={'/tests/' + t.slug} className="sr-card">
                  <div className="sr-name"><Highlighted text={t.title} q={q} /></div>
                  <span className="sr-badge">{CAT_LABELS[t.category] || t.category}{t.unit ? ' · ' + t.unit : ''}</span>
                </Link>
              ))}
              <Link href="/tests" className="sr-more">Все анализы →</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
