import { NavLink, useLocation } from 'react-router-dom'
import { ChartPie, CirclePlus, CircleUser, House, List } from 'lucide-react'

const TABS = [
  { to: '/', label: '首页', icon: House, aria: '首页' },
  { to: '/transactions', label: '明细', icon: List, aria: '明细' },
]

const RIGHT_TABS = [
  { to: '/statistics', label: '统计', icon: ChartPie, aria: '统计' },
  { to: '/profile', label: '我的', icon: CircleUser, aria: '我的' },
]

/** iOS-style bottom tab bar with a raised center FAB (mockup treatment). */
export default function TabBar() {
  const location = useLocation()
  const onAdd = location.pathname === '/add'

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-16 flex-col items-center gap-1 pt-1 transition-colors ${
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl md:hidden"
      aria-label="主导航"
    >
      <div className="mx-auto flex h-[88px] max-w-[420px] items-start justify-around px-2 pt-2 pb-safe">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={tabClass} aria-label={t.aria}>
            <t.icon size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium">{t.label}</span>
          </NavLink>
        ))}

        <NavLink
          to="/add"
          aria-label="记一笔"
          aria-current={onAdd ? 'page' : undefined}
          className={`-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:opacity-90 ${
            onAdd ? 'scale-95 ring-2 ring-ring ring-offset-2 ring-offset-background' : 'active:scale-[0.98]'
          }`}
        >
          <CirclePlus size={28} strokeWidth={2} />
        </NavLink>

        {RIGHT_TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={tabClass} aria-label={t.aria}>
            <t.icon size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
