import { CheckCircle2, CircleAlert, Info } from 'lucide-react'
import { useUiStore } from '@/store/ui'

const ICONS = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
}

const TONE_CLASS = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-primary',
}

export default function Toaster() {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone]
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className="toast-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-border bg-popover/95 px-4 py-2 text-sm font-medium text-popover-foreground shadow-lg backdrop-blur-md"
          >
            <Icon size={16} className={TONE_CLASS[t.tone]} />
            <span className="truncate">{t.message}</span>
          </button>
        )
      })}
    </div>
  )
}
