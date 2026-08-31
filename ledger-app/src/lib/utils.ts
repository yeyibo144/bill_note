import type { Transaction } from './types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/** 'YYYY-MM-DD' for a local date (no timezone drift). */
export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 'YYYY-MM' */
export function monthKeyOf(d: Date | string): string {
  if (typeof d === 'string') return d.slice(0, 7)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function currentMonthKey(): string {
  return monthKeyOf(new Date())
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key)
  const d = new Date(year, month + delta, 1)
  return monthKeyOf(d)
}

/** '2026年8月' */
export function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key)
  return `${year}年${month + 1}月`
}

/** '8月' — short label used inside compact steppers. */
export function monthShortLabel(key: string): string {
  const { month } = parseMonthKey(key)
  return `${month + 1}月`
}

/** '周一，8月31日' — dashboard header style. */
export function todayHeaderLabel(d = new Date()): string {
  return `周${WEEKDAYS[d.getDay()]}，${d.getMonth() + 1}月${d.getDate()}日`
}

/** '8月31日 星期六' — transaction group header style. */
export function groupDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = dateKey(new Date()) === dateStr
  const yesterday = dateKey(new Date(Date.now() - 86400000)) === dateStr
  const base = `${m}月${d}日 星期${WEEKDAYS[date.getDay()]}`
  if (today) return `今天 · ${base}`
  if (yesterday) return `昨天 · ${base}`
  return base
}

/** '¥12,580.00' */
export function formatMoney(n: number): string {
  return `¥${Math.abs(n).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** '-¥38.50' / '+¥18,200.00' */
export function formatSignedMoney(t: Pick<Transaction, 'type' | 'amount'>): string {
  const sign = t.type === 'income' ? '+' : '-'
  return `${sign}${formatMoney(t.amount)}`
}

export function transactionsOfMonth(
  transactions: Transaction[],
  month: string,
): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month))
}

export function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + t.amount, 0)
}

/** Sort by date+time desc (newest first). */
export function sortByDateTimeDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) =>
    `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`),
  )
}

export interface DayGroup {
  date: string
  label: string
  total: number
  items: Transaction[]
}

export function groupByDay(transactions: Transaction[]): DayGroup[] {
  const sorted = sortByDateTimeDesc(transactions)
  const map = new Map<string, Transaction[]>()
  for (const t of sorted) {
    const list = map.get(t.date) ?? []
    list.push(t)
    map.set(t.date, list)
  }
  return [...map.entries()].map(([date, items]) => ({
    date,
    label: groupDateLabel(date),
    total: items.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0),
    items,
  }))
}

export function greeting(hour = new Date().getHours()): string {
  if (hour >= 5 && hour < 11) return '早上好'
  if (hour >= 11 && hour < 13) return '中午好'
  if (hour >= 13 && hour < 18) return '下午好'
  return '晚上好'
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
