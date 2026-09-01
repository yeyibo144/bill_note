import { useEffect, useState } from 'react'
import { useLedgerStore } from '@/store/ledger'
import type { ThemeMode } from '@/lib/types'

export const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'system']

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
}

export function nextTheme(mode: ThemeMode): ThemeMode {
  return THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length]
}

export function useSystemTheme(): 'light' | 'dark' {
  const [system, setSystem] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return system
}

/** Applies the .dark class on <html> based on the persisted theme preference. */
export function useThemeEffect() {
  const theme = useLedgerStore((s) => s.theme)
  const system = useSystemTheme()

  useEffect(() => {
    const dark = theme === 'dark' || (theme === 'system' && system === 'dark')
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#000000' : '#ffffff')
  }, [theme, system])
}

/** Resolved theme ('light' | 'dark') — useful for chart re-renders. */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useLedgerStore((s) => s.theme)
  const system = useSystemTheme()
  return theme === 'system' ? system : theme
}
