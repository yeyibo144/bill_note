import type { Transaction } from './types'

/**
 * Demo dataset for the current month. Amounts are hand-crafted so the monthly
 * totals match the design mockup exactly: 支出 ¥5,620.00 · 收入 ¥18,200.00 · 结余 ¥12,580.00.
 */
export function createSeedTransactions(): Transaction[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const at = (day: number, time: string) => `${year}-${month}-${String(day).padStart(2, '0')}T${time}`

  interface Seed {
    day: number
    time: string
    type: Transaction['type']
    amount: number
    category: string
    account: string
    note: string
  }

  const seeds: Seed[] = [
    { day: 28, time: '19:30', type: 'expense', amount: 139.0, category: '餐饮', account: '微信', note: '朋友聚餐' },
    { day: 28, time: '09:15', type: 'expense', amount: 32.0, category: '交通', account: '支付宝', note: '地铁' },
    { day: 26, time: '19:00', type: 'expense', amount: 128.0, category: '餐饮', account: '支付宝', note: '晚餐' },
    { day: 26, time: '12:30', type: 'expense', amount: 38.5, category: '餐饮', account: '支付宝', note: '午餐 · 便利店' },
    { day: 24, time: '20:30', type: 'expense', amount: 128.0, category: '娱乐', account: '微信', note: '电影票' },
    { day: 24, time: '18:45', type: 'expense', amount: 420.0, category: '购物', account: '微信', note: '超市采购' },
    { day: 22, time: '10:00', type: 'expense', amount: 67.0, category: '通讯', account: '支付宝', note: '话费' },
    { day: 20, time: '19:20', type: 'expense', amount: 245.6, category: '购物', account: '微信', note: '超市采购' },
    { day: 20, time: '20:00', type: 'expense', amount: 89.0, category: '娱乐', account: '微信', note: '电影票' },
    { day: 18, time: '15:30', type: 'expense', amount: 128.5, category: '医疗', account: '现金', note: '药店' },
    { day: 16, time: '12:30', type: 'expense', amount: 56.0, category: '餐饮', account: '支付宝', note: '午餐' },
    { day: 15, time: '16:00', type: 'expense', amount: 99.0, category: '教育', account: '支付宝', note: '在线课程' },
    { day: 12, time: '21:00', type: 'expense', amount: 128.0, category: '购物', account: '银行卡', note: '日用品' },
    { day: 12, time: '09:00', type: 'expense', amount: 14.0, category: '交通', account: '支付宝', note: '地铁通勤' },
    { day: 10, time: '08:45', type: 'expense', amount: 7.0, category: '交通', account: '支付宝', note: '地铁通勤' },
    { day: 10, time: '08:00', type: 'income', amount: 18200.0, category: '工资', account: '银行卡', note: '月薪' },
    { day: 10, time: '07:00', type: 'expense', amount: 3500.0, category: '居住', account: '银行卡', note: '月租' },
    { day: 8, time: '18:30', type: 'expense', amount: 92.0, category: '餐饮', account: '微信', note: '晚餐' },
    { day: 8, time: '22:00', type: 'expense', amount: 45.0, category: '娱乐', account: '微信', note: '游戏充值' },
    { day: 5, time: '13:00', type: 'expense', amount: 45.0, category: '餐饮', account: '现金', note: '午餐' },
    { day: 5, time: '08:30', type: 'expense', amount: 7.0, category: '交通', account: '支付宝', note: '地铁通勤' },
    { day: 3, time: '19:00', type: 'expense', amount: 85.0, category: '餐饮', account: '微信', note: '晚餐' },
    { day: 3, time: '20:00', type: 'expense', amount: 89.9, category: '购物', account: '支付宝', note: '生活用品' },
    { day: 1, time: '12:00', type: 'expense', amount: 36.5, category: '餐饮', account: '支付宝', note: '午餐' },
  ]

  return seeds.map((s, i) => ({
    id: at(s.day, s.time) + '-' + i.toString(36),
    type: s.type,
    amount: s.amount,
    category: s.category,
    account: s.account,
    note: s.note,
    date: at(s.day, s.time).slice(0, 10),
    time: s.time,
  }))
}
