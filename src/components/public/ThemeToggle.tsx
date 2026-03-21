'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 6px',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
        transition: 'color 0.15s',
        fontSize: 15,
        lineHeight: 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
