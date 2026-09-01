import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Landmark,
  PencilLine,
  Trash2,
} from 'lucide-react'
import { ACCOUNTS, categoriesOf } from '@/lib/categories'
import { dateKey, formatMoney } from '@/lib/utils'
import { useLedgerStore } from '@/store/ledger'
import { useUiStore } from '@/store/ui'
import type { Transaction, TransactionType } from '@/lib/types'

export default function AddTransaction() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const transactions = useLedgerStore((s) => s.transactions)
  const addTransaction = useLedgerStore((s) => s.addTransaction)
  const updateTransaction = useLedgerStore((s) => s.updateTransaction)
  const deleteTransaction = useLedgerStore((s) => s.deleteTransaction)
  const toast = useUiStore((s) => s.toast)
  const setSelectedMonth = useUiStore((s) => s.setSelectedMonth)

  const editing = useMemo(
    () => (editId ? transactions.find((t) => t.id === editId) : undefined),
    [editId, transactions],
  )

  const [type, setType] = useState<TransactionType>(editing?.type ?? 'expense')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [category, setCategory] = useState(
    editing?.category ?? categoriesOf(editing?.type ?? 'expense')[0].name,
  )
  const [date, setDate] = useState(editing?.date ?? dateKey(new Date()))
  const [account, setAccount] = useState(editing?.account ?? ACCOUNTS[0])
  const [note, setNote] = useState(editing?.note ?? '')
  const [error, setError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  // When switching type, snap category to the first one of that type.
  const switchType = (next: TransactionType) => {
    setType(next)
    setCategory(categoriesOf(next)[0].name)
  }

  // If editing an entry that disappeared (deleted elsewhere), bail out.
  useEffect(() => {
    if (editId && !editing) navigate('/transactions', { replace: true })
  }, [editId, editing, navigate])

  useEffect(() => {
    if (!confirmDelete) return
    const timer = setTimeout(() => setConfirmDelete(false), 2600)
    return () => clearTimeout(timer)
  }, [confirmDelete])

  const categories = categoriesOf(type)
  const parsedAmount = Number(amount)
  const canSave = amount !== '' && !Number.isNaN(parsedAmount) && parsedAmount > 0

  const handleSave = () => {
    if (!canSave) {
      setError(true)
      amountRef.current?.focus()
      toast('请输入有效的金额', 'error')
      setTimeout(() => setError(false), 500)
      return
    }

    if (editing) {
      updateTransaction(editing.id, {
        type,
        amount: parsedAmount,
        category,
        account,
        note: note.trim(),
        date,
      })
      toast('修改已保存', 'success')
    } else {
      const now = new Date()
      const record: Omit<Transaction, 'id'> = {
        type,
        amount: parsedAmount,
        category,
        account,
        note: note.trim(),
        date,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      }
      addTransaction(record)
      setSelectedMonth(date.slice(0, 7))
      toast(`${type === 'income' ? '收入' : '支出'} ${formatMoney(parsedAmount)} 已记录`, 'success')
    }
    navigate('/')
  }

  const handleDelete = () => {
    if (!editing) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteTransaction(editing.id)
    toast('记录已删除', 'success')
    navigate('/transactions')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-5 pb-36 pt-4 md:mx-auto md:max-w-xl md:pb-12">
      {/* Top navigation */}
      <header className="mb-6 flex h-12 items-center justify-between md:h-14">
        <button
          type="button"
          aria-label="返回"
          onClick={() => navigate(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-muted/70"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {editing ? '编辑记录' : '记一笔'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex h-11 items-center justify-center px-2 text-base font-medium text-muted-foreground transition-colors active:text-foreground hover:text-foreground"
        >
          取消
        </button>
      </header>

      {/* Type segmented control */}
      <div className="mb-6 flex rounded-full bg-muted p-1" role="tablist" aria-label="交易类型">
        {(
          [
            { value: 'expense', label: '支出' },
            { value: 'income', label: '收入' },
          ] as const
        ).map((t) => {
          const selected = type === t.value
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => switchType(t.value)}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                selected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Amount input */}
      <div
        className={`mb-6 flex items-center gap-3 rounded-xl border bg-card px-4 py-5 transition-shadow focus-within:ring-2 focus-within:ring-primary ${
          error ? 'animate-shake border-destructive' : 'border-input'
        }`}
      >
        <span className="select-none font-mono text-3xl font-medium text-foreground">¥</span>
        <input
          ref={amountRef}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d.]/g, '')
            const parts = v.split('.')
            setAmount(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : v)
          }}
          aria-label="金额"
          className="w-full bg-transparent font-mono text-4xl font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none md:text-5xl"
        />
      </div>

      {/* Category grid */}
      <div className="mb-6 grid grid-cols-5 gap-2" role="radiogroup" aria-label="分类">
        {categories.map((c) => {
          const selected = category === c.name && type === c.type
          const Icon = c.icon
          return (
            <button
              key={c.name + c.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setCategory(c.name)}
              className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all active:scale-[0.97] ${
                selected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-xs font-medium">{c.name}</span>
            </button>
          )
        })}
      </div>

      {/* Form fields */}
      <div className="mb-6 space-y-3">
        <div className="rounded-xl border border-input bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-primary">
          <label htmlFor="date" className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarDays size={16} />
            日期
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={dateKey(new Date())}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full bg-transparent text-base text-foreground focus:outline-none"
          />
        </div>

        <div className="relative rounded-xl border border-input bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-primary">
          <label htmlFor="account" className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Landmark size={16} />
            账户
          </label>
          <select
            id="account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="h-10 w-full appearance-none bg-transparent text-base text-foreground focus:outline-none"
          >
            {ACCOUNTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronRight
            size={16}
            className="pointer-events-none absolute right-4 bottom-4 rotate-90 text-muted-foreground"
          />
        </div>

        <div className="rounded-xl border border-input bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-primary">
          <label htmlFor="note" className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <PencilLine size={16} />
            备注
          </label>
          <input
            id="note"
            type="text"
            placeholder="添加备注..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={40}
            className="h-10 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Save / Delete */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSave}
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {editing ? '保存修改' : '保存'}
        </button>

        {editing && (
          <button
            type="button"
            onClick={handleDelete}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full border text-base font-semibold transition-all active:scale-[0.98] ${
              confirmDelete
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : 'border-border text-destructive hover:bg-destructive/5'
            }`}
          >
            <Trash2 size={18} />
            {confirmDelete ? '再点一次确认删除' : '删除这条记录'}
          </button>
        )}
      </div>
    </div>
  )
}
