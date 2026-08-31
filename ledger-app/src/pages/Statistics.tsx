import { useMemo, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  ArcElement,
  Chart as ChartJS,
  type ChartOptions,
  Tooltip,
} from 'chart.js'
import { ChartPie } from 'lucide-react'
import MonthPicker from '@/components/MonthPicker'
import EmptyState from '@/components/EmptyState'
import CategoryIcon from '@/components/CategoryIcon'
import { useLedgerStore } from '@/store/ledger'
import { useUiStore } from '@/store/ui'
import { useResolvedTheme } from '@/lib/theme'
import { getCategory } from '@/lib/categories'
import { formatMoney, monthLabel, transactionsOfMonth } from '@/lib/utils'
import type { TransactionType } from '@/lib/types'

ChartJS.register(ArcElement, Tooltip)

interface RankItem {
  name: string
  total: number
  percent: number
  color: string
}

export default function Statistics() {
  const transactions = useLedgerStore((s) => s.transactions)
  const selectedMonth = useUiStore((s) => s.selectedMonth)
  const setSelectedMonth = useUiStore((s) => s.setSelectedMonth)
  const [tab, setTab] = useState<TransactionType>('expense')
  const resolvedTheme = useResolvedTheme()

  const monthTx = useMemo(
    () => transactionsOfMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  )

  const income = monthTx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const balance = income - expense

  const { ranking, total } = useMemo(() => {
    const sums = new Map<string, number>()
    for (const t of monthTx) {
      if (t.type !== tab) continue
      sums.set(t.category, (sums.get(t.category) ?? 0) + t.amount)
    }
    const total = [...sums.values()].reduce((a, b) => a + b, 0)
    const ranking: RankItem[] = [...sums.entries()]
      .map(([name, sum]) => ({
        name,
        total: sum,
        percent: total > 0 ? Math.round((sum / total) * 100) : 0,
        color: getCategory(name, tab).color,
      }))
      .sort((a, b) => b.total - a.total)
    return { ranking, total }
  }, [monthTx, tab])

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    layout: { padding: 8 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: resolvedTheme === 'dark' ? 'rgba(245,245,247,0.95)' : 'rgba(28,28,30,0.92)',
        titleColor: resolvedTheme === 'dark' ? '#1d1d1f' : '#f5f5f7',
        bodyColor: resolvedTheme === 'dark' ? '#1d1d1f' : '#f5f5f7',
        padding: 10,
        cornerRadius: 12,
        boxPadding: 4,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const item = ranking[ctx.dataIndex]
            return ` ${formatMoney(item.total)} · ${item.percent}%`
          },
        },
      },
    },
  }

  const chartData = {
    labels: ranking.map((r) => r.name),
    datasets: [
      {
        data: ranking.map((r) => r.total),
        backgroundColor: ranking.map((r) => r.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  return (
    <div className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-36 md:max-w-5xl md:px-8 md:pb-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">统计</h1>
        <MonthPicker month={selectedMonth} onChange={setSelectedMonth} variant="ghost" />
      </header>

      {/* Summary cards */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm md:p-4">
          <p className="text-xs text-muted-foreground">总支出</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-destructive md:text-base">
            ¥{expense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm md:p-4">
          <p className="text-xs text-muted-foreground">总收入</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-success md:text-base">
            ¥{income.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm md:p-4">
          <p className="text-xs text-muted-foreground">结余</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-primary md:text-base">
            ¥{balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-6">
        <div className="inline-flex rounded-full bg-muted p-1" role="tablist" aria-label="收支类型">
          {(
            [
              { value: 'expense', label: '支出' },
              { value: 'income', label: '收入' },
            ] as const
          ).map((t) => {
            const selected = tab === t.value
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.value)}
                className={`rounded-full px-6 py-1.5 text-sm font-medium transition-all active:scale-[0.97] ${
                  selected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </section>

      <div className="md:grid md:grid-cols-2 md:items-start md:gap-6">
        {/* Chart */}
        <section className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            {ranking.length === 0 ? (
              <EmptyState
                icon={ChartPie}
                title={`${monthLabel(selectedMonth)}暂无${tab === 'expense' ? '支出' : '收入'}`}
                description="记一笔后这里会生成分析图表"
                actionTo="/add"
                actionLabel="记一笔"
              />
            ) : (
              <>
                <div className="relative h-[220px] md:h-[260px]">
                  <Doughnut
                    key={`${resolvedTheme}-${selectedMonth}-${tab}-${ranking.length}`}
                    data={chartData}
                    options={chartOptions}
                  />
                  {/* Center overlay */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground">本月{tab === 'expense' ? '支出' : '收入'}</p>
                    <p className="mt-0.5 max-w-[140px] truncate font-mono text-lg font-semibold text-foreground md:text-xl">
                      {formatMoney(total)}
                    </p>
                  </div>
                </div>
                {/* Custom legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  {ranking.map((r) => (
                    <span key={r.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} aria-hidden="true" />
                      {r.name} {r.percent}%
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Category ranking */}
        <section className="mt-6">
          <h2 className="text-base font-semibold text-foreground">
            {tab === 'expense' ? '支出' : '收入'}排行
          </h2>
          {ranking.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border bg-card/50">
              <EmptyState icon={ChartPie} title="暂无数据" description={`本月还没有${tab === 'expense' ? '支出' : '收入'}记录`} />
            </div>
          ) : (
            <div className="mt-3 space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
              {ranking.map((r) => (
                <div key={r.name} className="flex items-center gap-3">
                  <CategoryIcon category={r.name} type={tab} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{r.name}</span>
                      <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
                        {formatMoney(r.total)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(r.percent, 2)}%`, backgroundColor: r.color }}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                        {r.percent}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
