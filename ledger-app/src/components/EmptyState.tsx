import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionTo?: string
  actionLabel?: string
}

export default function EmptyState({
  icon: Icon = Wallet,
  title,
  description,
  actionTo,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-[260px] text-sm text-muted-foreground">{description}</p>}
      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
