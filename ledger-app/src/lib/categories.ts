import {
  CircleAlert,
  Heart,
  House,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  ShoppingBag,
  Star,
  Tag,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { TransactionType } from './types'

export interface CategoryConfig {
  name: string
  type: TransactionType
  color: string
  icon: LucideIcon
}

/**
 * Category palette follows the design mockup: each category is anchored on an
 * Apple system color, tinted at 12% for icon backgrounds (see CategoryIcon).
 */
export const CATEGORIES: CategoryConfig[] = [
  { name: '餐饮', type: 'expense', color: '#ff9500', icon: Tag },
  { name: '交通', type: 'expense', color: '#007aff', icon: MapPin },
  { name: '购物', type: 'expense', color: '#5856d6', icon: ShoppingBag },
  { name: '娱乐', type: 'expense', color: '#af52de', icon: Heart },
  { name: '居住', type: 'expense', color: '#34c759', icon: House },
  { name: '医疗', type: 'expense', color: '#ff3b30', icon: CircleAlert },
  { name: '教育', type: 'expense', color: '#5e5ce6', icon: Pencil },
  { name: '通讯', type: 'expense', color: '#5ac8fa', icon: Mail },
  { name: '其他', type: 'expense', color: '#8e8e93', icon: MessageCircle },
  { name: '工资', type: 'income', color: '#34c759', icon: Star },
  { name: '理财', type: 'income', color: '#ff9500', icon: Wallet },
  { name: '其他', type: 'income', color: '#8e8e93', icon: MessageCircle },
]

export const ACCOUNTS = ['现金', '支付宝', '微信', '银行卡'] as const

export function categoriesOf(type: TransactionType): CategoryConfig[] {
  return CATEGORIES.filter((c) => c.type === type)
}

const fallbackIcon = MessageCircle

export function getCategory(name: string, type?: TransactionType): CategoryConfig {
  return (
    CATEGORIES.find((c) => c.name === name && (!type || c.type === type)) ?? {
      name,
      type: type ?? 'expense',
      color: '#8e8e93',
      icon: fallbackIcon,
    }
  )
}
