import { Link } from 'react-router-dom'
import CategoryIcon from './CategoryIcon'
import { formatSignedMoney } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface TransactionRowProps {
  transaction: Transaction
  /** Card-internal row gets a bottom divider (mockup's list treatment) */
  divider?: boolean
  to?: string
}

export function TransactionRowInner({ transaction: t, divider = true }: TransactionRowProps) {
  return (
    <div className={`flex min-h-[44px] items-center gap-3 px-4 py-3 ${divider ? 'border-b border-border' : ''}`}>
      <CategoryIcon category={t.category} type={t.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{t.category}</span>
          <span
            className={`shrink-0 font-mono text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}
          >
            {formatSignedMoney(t)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {t.time}
            {t.note ? ` · ${t.note}` : ''}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/80">{t.account}</span>
        </div>
      </div>
    </div>
  )
}

/** Clickable variant — navigates to the edit page. */
export default function TransactionRow(props: TransactionRowProps) {
  const to = props.to ?? `/add?id=${props.transaction.id}`
  return (
    <Link
      to={to}
      className="block transition-colors hover:bg-muted/60 active:bg-muted"
      aria-label={`编辑 ${props.transaction.category} ${formatSignedMoney(props.transaction)}`}
    >
      <TransactionRowInner {...props} />
    </Link>
  )
}
