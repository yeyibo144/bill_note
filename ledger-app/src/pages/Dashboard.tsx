import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CirclePlus, Settings } from 'lucide-react'
import MonthPicker from '@/components/MonthPicker'
import AnimatedNumber from '@/components/AnimatedNumber'
import TransactionRow from '@/components/TransactionRow'
import EmptyState from '@/components/EmptyState'
import { useLedgerStore } from '@/store/ledger'
import { useUiStore } from '@/store/ui'
import {
  greeting,
  sortByDateTimeDesc,
  sumByType,
  todayHeaderLabel,
  transactionsOfMonth,
} from '@/lib/utils'

export default function Dashboard() {
  const transactions = useLedgerStore((s) => s.transactions)
  const profile = useLedgerStore((s) => s.profile)
  const budget = useLedgerStore((s) => s.budget)
  const selectedMonth = useUiStore((s) => s.selectedMonth)
  const setSelectedMonth = useUiStore((s) => s.setSelectedMonth)

  const monthTx = useMemo(
    () => transactionsOfMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )
  const income = sumByType(monthTx, 'income')
  const expense = sumByType(monthTx, 'expense')
  const balance = income - expense
  const recent = useMemo(() => sortByDateTimeDesc(monthTx).slice(0, 5), [monthTx])
  const budgetUsed = budget > 0 ? Math.min(100, Math.round((expense / budget) * 100)) : 0

  return (
    <div className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-36 md:max-w-5xl md:px-8 md:pb-12">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{todayHeaderLabel()}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {profile.name ? `${greeting()}，${profile.name}` : `${greeting()}！开始你的第一笔记账吧`}
          </h1>
        </div>
        <Link
          to="/profile"
          aria-label="设置"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 active:bg-muted/70"
        >
          <Settings size={22} strokeWidth={2} />
        </Link>
      </header>

      <div className="md:grid md:grid-cols-[5fr,7fr] md:items-start md:gap-8">
        {/* Left column on desktop */}
        <div>
          {/* Month selector */}
          <div className="mb-6">
            <MonthPicker month={selectedMonth} onChange={setSelectedMonth} />
          </div>

          {/* Balance card */}
          <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="mb-1 text-sm text-muted-foreground">本月结余</p>
            <AnimatedNumber
              value={balance}
              className="mb-5 block font-mono text-[2.5rem] font-semibold leading-none tracking-tight text-foreground"
            />
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-xs text-muted-foreground">收入</p>
                <AnimatedNumber
                  value={income}
                  className="block truncate font-mono text-base font-medium text-success"
                />
              </div>
              <div className="h-8 w-px bg-border" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-xs text-muted-foreground">支出</p>
                <AnimatedNumber
                  value={expense}
                  className="block truncate font-mono text-base font-medium text-destructive"
                />
              </div>
            </div>

            {budget > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    月度预算 {budgetUsed > 100 ? '已超支' : '已用'} {budgetUsed}%
                  </span>
                  <span className="font-mono text-muted-foreground">
                    ¥{expense.toLocaleString('zh-CN', { maximumFractionDigits: 0 })} / ¥
                    {budget.toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${budgetUsed > 100 ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${budgetUsed}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Primary CTA */}
          <Link
            to="/add"
            className="mb-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <CirclePlus size={20} strokeWidth={2.5} />
            记一笔
          </Link>
        </div>

        {/* Recent transactions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">近期交易</h2>
            <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">
              查看全部
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50">
              <EmptyState
                title="本月还没有记录"
                description="记下第一笔收支，开始管理你的财务吧"
                actionTo="/add"
                actionLabel="记一笔"
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {recent.map((t) => (
                <TransactionRow key={t.id} transaction={t} to={`/add?id=${t.id}`} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
