export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  account: string
  note: string
  /** Local date, 'YYYY-MM-DD' */
  date: string
  /** 'HH:mm' */
  time: string
}

export interface Profile {
  name: string
  email: string
}

export type ThemeMode = 'light' | 'dark' | 'system'
