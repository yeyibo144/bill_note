import { NavLink } from 'react-router-dom'
import { ChartPie, CirclePlus, CircleUser, House, List, Moon, Sun, Wallet } from 'lucide-react'
import { useLedgerStore } from '@/store/ledger'
import { nextTheme, THEME_LABELS, useResolvedTheme } from '@/lib/theme'
import type { ThemeMode } from '@/lib/types'

const NAV = [
  { to: '/', label: '首页', icon: House, end: true },
  { to: '/transactions', label: '明细', icon: List, end: false },
  { to: '/statistics', label: '统计', icon: ChartPie, end: false },
  { to: '/profile', label: '我的', icon: CircleUser, end: false },
]

/** Desktop sidebar navigation — replaces the mobile tab bar at md+ widths. */
export default function Sidebar() {
  const theme = useLedgerStore((s) => s.theme)
  const setTheme = useLedgerStore((s) => s.setTheme)
  const resolved = useResolvedTheme()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? 'bg-card text-primary shadow-sm'
        : 'text-muted-foreground hover:bg-card/70 hover:text-foreground'
    }`

  const toggleTheme = () => setTheme(nextTheme(theme as ThemeMode))

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-6 md:flex">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Wallet size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-foreground">Pinguo 记账</p>
          <p className="truncate text-xs text-muted-foreground">个人财务管理</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1" aria-label="主导航">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            <item.icon size={19} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Primary CTA */}
      <NavLink
        to="/add"
        className="mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <CirclePlus size={19} />
        记一笔
      </NavLink>

      {/* Bottom */}
      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
          aria-label={`切换主题（当前：${THEME_LABELS[theme]}）`}
        >
          {resolved === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
          <span className="flex-1 text-left">{THEME_LABELS[theme]}</span>
          <span className="text-xs text-muted-foreground/70">点击切换</span>
        </button>
        <p className="px-1 text-[11px] text-muted-foreground/70">
          v1.0 · 数据保存在本地浏览器
        </p>
      </div>
    </aside>
  )
}
