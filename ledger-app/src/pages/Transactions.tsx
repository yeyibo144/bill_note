import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CirclePlus, ListFilter, Search, SearchX, X } from 'lucide-react'
import MonthPicker from '@/components/MonthPicker'
import TransactionRow from '@/components/TransactionRow'
import EmptyState from '@/components/EmptyState'
import { useLedgerStore } from '@/store/ledger'
import { useUiStore } from '@/store/ui'
import { groupByDay, monthLabel, sumByType, transactionsOfMonth } from '@/lib/utils'
import type { TransactionType } from '@/lib/types'

type Filter = 'all' | TransactionType

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'expense', label: '支出' },
  { value: 'income', label: '收入' },
] as const

export default function Transactions() {
  const location = useLocation()
  const transactions = useLedgerStore((s) => s.transactions)
  const selectedMonth = useUiStore((s) => s.selectedMonth)
  const setSelectedMonth = useUiStore((s) => s.setSelectedMonth)

  const [showSearch, setShowSearch] = useState(location.hash === '#search')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>((location.hash.slice(1) as Filter) || 'all')

  const monthTx = useMemo(
    () => transactionsOfMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return monthTx.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false
      if (!q) return true
      return (
        t.category.toLowerCase().includes(q) ||
        t.note.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      )
    })
  }, [monthTx, filter, query])

  const groups = useMemo(() => groupByDay(visible), [visible])
  const income = sumByType(monthTx, 'income')
  const expense = sumByType(monthTx, 'expense')

  return (
    <div className="relative min-h-dvh">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 pb-3 pt-4 backdrop-blur-sm md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-[1.25rem] font-semibold tracking-tight text-foreground">明细</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="筛选"
              aria-pressed={filter !== 'all'}
              onClick={() => {
                const i = FILTERS.findIndex((f) => f.value === filter)
                setFilter(FILTERS[(i + 1) % FILTERS.length].value)
              }}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                filter !== 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <ListFilter size={20} />
            </button>
            <button
              type="button"
              aria-label="搜索"
              aria-pressed={showSearch}
              onClick={() => {
                setShowSearch((v) => !v)
                if (showSearch) setQuery('')
              }}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                showSearch ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {showSearch ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="pop-in mx-auto mt-3 max-w-3xl">
            <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 transition-shadow focus-within:ring-2 focus-within:ring-primary">
              <Search size={16} className="shrink-0 text-muted-foreground" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索分类、备注、账户或金额..."
                aria-label="搜索交易"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              {query && (
                <button type="button" aria-label="清空搜索" onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto w-full max-w-[420px] pb-36 md:max-w-3xl md:px-8 md:pb-12">
        {/* Month + filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-0">
          <MonthPicker month={selectedMonth} onChange={setSelectedMonth} variant="ghost" />
          <div className="inline-flex rounded-full bg-muted p-1" role="tablist" aria-label="类型筛选">
            {FILTERS.map((f) => {
              const selected = filter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all active:scale-[0.97] ${
                    selected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Month summary */}
        <section className="flex items-center justify-between border-b border-border px-5 pb-4 md:px-0">
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">{monthLabel(selectedMonth)}总收入</p>
            <p className="font-mono text-[1.125rem] font-semibold text-success">
              ¥{income.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-0.5 text-xs text-muted-foreground">总支出</p>
            <p className="font-mono text-[1.125rem] font-semibold text-destructive">
              ¥{expense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </section>

        {/* Transaction groups */}
        {groups.length === 0 ? (
          <div className="mt-6 mx-5 rounded-2xl border border-dashed border-border bg-card/50 md:mx-0">
            <EmptyState
              icon={SearchX}
              title={query ? '没有匹配的记录' : '本月暂无记录'}
              description={query ? '换个关键词试试' : '点击右下角按钮开始记账'}
              actionTo="/add"
              actionLabel="记一笔"
            />
          </div>
        ) : (
          <section className="space-y-1 pt-1">
            {groups.map((g) => (
              <div key={g.date} className="animate-in">
                <div className="flex items-center justify-between px-5 py-3 text-sm md:px-0">
                  <span className="font-medium text-foreground">{g.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {g.total >= 0 ? '+' : '-'}¥{Math.abs(g.total).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mx-4 overflow-hidden rounded-[var(--radius)] bg-card shadow-sm md:mx-0">
                  {g.items.map((t) => (
                    <TransactionRow key={t.id} transaction={t} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* FAB (mobile only) */}
      <Link
        to="/add"
        aria-label="记一笔"
        className="fixed bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
      >
        <CirclePlus size={28} />
      </Link>
    </div>
  )
}
