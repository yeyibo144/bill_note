import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { monthLabel, parseMonthKey } from '@/lib/utils'

interface MonthPickerProps {
  month: string
  onChange: (month: string) => void
  /** Pill visual variant */
  variant?: 'pill' | 'ghost'
}

export default function MonthPicker({ month, onChange, variant = 'pill' }: MonthPickerProps) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(() => parseMonthKey(month).year)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setYear(parseMonthKey(month).year)
  }, [open, month])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const { month: selectedMonth } = parseMonthKey(month)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const pillClass =
    variant === 'pill'
      ? 'inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-foreground min-h-[44px] transition-colors hover:bg-muted/80 active:bg-muted/70'
      : 'inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted'

  return (
    <div ref={rootRef} className="relative">
      <button type="button" className={pillClass} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {monthLabel(month)}
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="pop-in absolute left-0 top-[calc(100%+8px)] z-50 w-[288px] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl" role="dialog" aria-label="选择月份">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="上一年"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/70"
                onClick={() => setYear((y) => y - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-base font-semibold tabular-nums">{year}年</span>
              <button
                type="button"
                aria-label="下一年"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/70"
                onClick={() => setYear((y) => y + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => {
                const selected = year === parseMonthKey(month).year && i === selectedMonth
                const isCurrent = year === currentYear && i === currentMonth
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(`${year}-${String(i + 1).padStart(2, '0')}`)
                      setOpen(false)
                    }}
                    className={[
                      'flex h-11 items-center justify-center rounded-xl text-sm font-medium tabular-nums transition-all active:scale-[0.96]',
                      selected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    <span className="relative">
                      {i + 1}月
                      {isCurrent && !selected && (
                        <span className="absolute -right-2.5 -top-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
