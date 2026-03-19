'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchHotkey() {
  const router = useRouter()
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Если уже на странице поиска — фокус на инпут
        if (window.location.pathname === '/search') {
          document.querySelector<HTMLInputElement>('.sr-input')?.focus()
        } else {
          router.push('/search')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])
  return null
}
