import { useRef, useState } from 'react'
import {
  Bell,
  ChevronRight,
  CircleHelp,
  FileCog,
  Info,
  LogOut,
  Moon,
  Pencil,
  PieChart,
  Sun,
  User,
  Wallet,
  Download,
  Upload,
  Monitor,
} from 'lucide-react'
import Modal from '@/components/Modal'
import AnimatedNumber from '@/components/AnimatedNumber'
import { useLedgerStore } from '@/store/ledger'
import { useUiStore } from '@/store/ui'
import { nextTheme, THEME_LABELS } from '@/lib/theme'
import { formatMoney, monthKeyOf, sumByType, transactionsOfMonth } from '@/lib/utils'

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor }

export default function Profile() {
  const { profile, budget, theme, setProfile, setBudget, setTheme, resetData } = useLedgerStore()
  const transactions = useLedgerStore((s) => s.transactions)
  const toast = useUiStore((s) => s.toast)

  const [profileOpen, setProfileOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.name)
  const [emailDraft, setEmailDraft] = useState(profile.email)
  const [budgetDraft, setBudgetDraft] = useState(String(budget))
  const fileRef = useRef<HTMLInputElement>(null)

  const monthTx = transactionsOfMonth(transactions, monthKeyOf(new Date()))
  const monthExpense = sumByType(monthTx, 'expense')
  const budgetUsed = budget > 0 ? Math.min(100, Math.round((monthExpense / budget) * 100)) : 0

  const openProfileModal = () => {
    setNameDraft(profile.name)
    setEmailDraft(profile.email)
    setProfileOpen(true)
  }

  const openBudgetModal = () => {
    setBudgetDraft(String(budget))
    setBudgetOpen(true)
  }

  const saveProfile = () => {
    if (!nameDraft.trim()) {
      toast('昵称不能为空', 'error')
      return
    }
    setProfile({ name: nameDraft.trim(), email: emailDraft.trim() })
    setProfileOpen(false)
    toast('资料已更新', 'success')
  }

  const saveBudget = () => {
    const n = Number(budgetDraft)
    if (Number.isNaN(n) || n < 0 || budgetDraft.trim() === '') {
      toast('请输入有效的预算金额', 'error')
      return
    }
    setBudget(n)
    setBudgetOpen(false)
    toast(n === 0 ? '已关闭预算提醒' : `月度预算已设为 ${formatMoney(n)}`, 'success')
  }

  const exportData = () => {
    const payload = JSON.stringify({ profile, budget, transactions }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pinguo-ledger-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('备份文件已导出', 'success')
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (!Array.isArray(data.transactions)) throw new Error('invalid')
        localStorage.setItem(
          'pinguo-ledger',
          JSON.stringify({
            state: {
              transactions: data.transactions,
              profile: data.profile ?? profile,
              budget: typeof data.budget === 'number' ? data.budget : budget,
              theme,
            },
            version: 1,
          }),
        )
        window.location.reload()
      } catch {
        toast('文件格式不正确，恢复失败', 'error')
      }
    }
    reader.readAsText(file)
  }

  const handleLogout = () => {
    resetData()
    setLogoutOpen(false)
    toast('已恢复为演示数据', 'success')
  }

  const menuGroupClass = 'overflow-hidden rounded-2xl border border-border bg-card shadow-sm'

  const rowClass =
    'flex w-full items-center justify-between border-b border-border bg-card px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted active:bg-muted/70'

  return (
    <div className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-36 md:max-w-3xl md:px-8 md:pb-12">
      <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-foreground">我的</h1>

      {/* User card */}
      <section className="mb-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-medium text-primary-foreground"
          aria-hidden="true"
        >
          {profile.name.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-card-foreground">{profile.name}</p>
          <p className="truncate text-sm text-muted-foreground">{profile.email || '未设置邮箱'}</p>
        </div>
        <button
          type="button"
          onClick={openProfileModal}
          aria-label="编辑资料"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil size={20} />
        </button>
      </section>

      {/* Budget cards */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-1 text-xs text-muted-foreground">本月预算</p>
          <p className="truncate font-mono text-xl font-semibold text-card-foreground">
            {formatMoney(budget)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:col-span-2">
          <p className="mb-1 text-xs text-muted-foreground">本月已用</p>
          <p className="font-mono text-xl font-semibold text-card-foreground">
            <AnimatedNumber value={monthExpense} />
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${budgetUsed > 100 ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${budgetUsed}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:col-span-1">
          <p className="mb-1 text-xs text-muted-foreground">剩余预算</p>
          <p
            className={`truncate font-mono text-xl font-semibold ${budget - monthExpense < 0 ? 'text-destructive' : 'text-card-foreground'}`}
          >
            {formatMoney(Math.max(budget - monthExpense, 0))}
          </p>
        </div>
      </section>

      {/* Settings */}
      <section className="mb-6 space-y-4">
        <div className={menuGroupClass}>
          <button type="button" className={rowClass} onClick={() => toast('账户管理 · 演示功能', 'info')}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <User size={16} />
              </span>
              <span className="text-base text-card-foreground">账户管理</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button type="button" className={rowClass} onClick={openBudgetModal}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <Wallet size={16} />
              </span>
              <span className="text-base text-card-foreground">预算设置</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-sm text-muted-foreground">
              {budget > 0 ? formatMoney(budget) : '未设置'}
              <ChevronRight size={18} />
            </span>
          </button>
          <button type="button" className={rowClass} onClick={() => toast('分类管理 · 演示功能', 'info')}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <FileCog size={16} />
              </span>
              <span className="text-base text-card-foreground">分类管理</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className={menuGroupClass}>
          <button type="button" className={rowClass} onClick={exportData}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <Download size={16} />
              </span>
              <span className="text-base text-card-foreground">备份数据</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button type="button" className={rowClass} onClick={() => fileRef.current?.click()}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <Upload size={16} />
              </span>
              <span className="text-base text-card-foreground">恢复数据</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            className={rowClass}
            onClick={() => {
              const next = nextTheme(theme)
              setTheme(next)
              toast(`主题已切换为${THEME_LABELS[next]}`, 'success')
            }}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                {(() => {
                  const Icon = THEME_ICONS[theme]
                  return <Icon size={16} />
                })()}
              </span>
              <span className="text-base text-card-foreground">主题模式</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {THEME_LABELS[theme]}
              <ChevronRight size={18} />
            </span>
          </button>
          <button type="button" className={rowClass} onClick={() => toast('通知设置 · 演示功能', 'info')}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <Bell size={16} />
              </span>
              <span className="text-base text-card-foreground">通知设置</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className={menuGroupClass}>
          <button type="button" className={rowClass} onClick={() => toast('帮助与反馈 · 演示功能', 'info')}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <CircleHelp size={16} />
              </span>
              <span className="text-base text-card-foreground">帮助与反馈</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <button type="button" className={rowClass} onClick={() => toast('Pinguo 记账 v1.0 · 本地演示项目', 'info')}>
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <Info size={16} />
              </span>
              <span className="text-base text-card-foreground">关于我们</span>
            </span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* 分组导航快捷入口 */}
        <div className="hidden md:flex md:gap-3">
          <button
            type="button"
            onClick={() => toast('分类管理 · 演示功能', 'info')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <PieChart size={16} />
            查看消费分析
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className="w-full py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        退出登录
      </button>

      {/* ===== Modals ===== */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="编辑资料">
        <div className="space-y-3">
          <div className="rounded-xl border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
            <label htmlFor="profile-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              昵称
            </label>
            <input
              id="profile-name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={20}
              className="h-10 w-full bg-transparent text-base text-foreground focus:outline-none"
            />
          </div>
          <div className="rounded-xl border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
            <label htmlFor="profile-email" className="mb-1 block text-xs font-medium text-muted-foreground">
              邮箱
            </label>
            <input
              id="profile-email"
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="h-11 flex-1 rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            取消
          </button>
          <button
            type="button"
            onClick={saveProfile}
            className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            保存
          </button>
        </div>
      </Modal>

      <Modal open={budgetOpen} onClose={() => setBudgetOpen(false)} title="预算设置">
        <p className="mb-3 text-sm text-muted-foreground">
          设置每月支出预算，首页与统计页将展示预算使用进度。设为 0 可关闭。
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
          <span className="font-mono text-lg text-foreground">¥</span>
          <input
            type="text"
            inputMode="decimal"
            value={budgetDraft}
            onChange={(e) => setBudgetDraft(e.target.value.replace(/[^\d.]/g, ''))}
            aria-label="月度预算"
            className="h-10 w-full bg-transparent font-mono text-lg text-foreground focus:outline-none"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setBudgetOpen(false)}
            className="h-11 flex-1 rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            取消
          </button>
          <button
            type="button"
            onClick={saveBudget}
            className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            保存
          </button>
        </div>
      </Modal>

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="退出登录">
        <p className="text-sm text-muted-foreground">
          将清除本地记录并恢复演示数据（当前浏览器），确定退出吗？
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setLogoutOpen(false)}
            className="h-11 flex-1 rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="h-11 flex-1 rounded-full bg-destructive text-sm font-semibold text-destructive-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-1.5">
              <LogOut size={16} />
              退出
            </span>
          </button>
        </div>
      </Modal>

    </div>
  )
}
