import { getCategory } from '@/lib/categories'
import type { TransactionType } from '@/lib/types'

interface CategoryIconProps {
  category: string
  type?: TransactionType
  size?: number
  /** Overall box size (w/h in px); icon is size */
  box?: number
  className?: string
}

/** Circular tinted icon chip, matching the mockup's 12% color-mix treatment. */
export default function CategoryIcon({
  category,
  type,
  size = 18,
  box = 40,
  className = '',
}: CategoryIconProps) {
  const cat = getCategory(category, type)
  const Icon = cat.icon
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: box,
        height: box,
        backgroundColor: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
        color: cat.color,
      }}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={2} />
    </div>
  )
}
