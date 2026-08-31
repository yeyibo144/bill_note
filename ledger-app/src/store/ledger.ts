import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSeedTransactions } from '@/lib/seed'
import { uid } from '@/lib/utils'
import type { Profile, ThemeMode, Transaction } from '@/lib/types'

interface LedgerState {
  transactions: Transaction[]
  profile: Profile
  budget: number
  theme: ThemeMode
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setBudget: (budget: number) => void
  setProfile: (patch: Partial<Profile>) => void
  setTheme: (theme: ThemeMode) => void
  resetData: () => void
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set) => ({
      transactions: createSeedTransactions(),
      profile: { name: 'Alex', email: 'alex@example.com' },
      budget: 8000,
      theme: 'system',

      addTransaction: (t) =>
        set((state) => ({ transactions: [{ ...t, id: uid() }, ...state.transactions] })),

      updateTransaction: (id, patch) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

      setBudget: (budget) => set({ budget }),
      setProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),
      setTheme: (theme) => set({ theme }),

      resetData: () =>
        set({
          transactions: createSeedTransactions(),
          profile: { name: 'Alex', email: 'alex@example.com' },
          budget: 8000,
        }),
    }),
    {
      name: 'pinguo-ledger',
      version: 1,
      partialize: (state) => ({
        transactions: state.transactions,
        profile: state.profile,
        budget: state.budget,
        theme: state.theme,
      }),
    },
  ),
)
