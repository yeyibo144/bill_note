import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  /** 清空全部数据（交易 / 资料 / 预算），仅保留主题偏好 */
  resetData: () => void
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set) => ({
      transactions: [],
      profile: { name: '', email: '' },
      budget: 0,
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
          transactions: [],
          profile: { name: '', email: '' },
          budget: 0,
        }),
    }),
    {
      name: 'pinguo-ledger',
      version: 2,
      partialize: (state) => ({
        transactions: state.transactions,
        profile: state.profile,
        budget: state.budget,
        theme: state.theme,
      }),
      /**
       * Migrate persisted data to the "clean slate" shape:
       * - v1 (seeded): drop the demo transactions & demo profile/budget
       * - unknown -> empty defaults
       */
      migrate: (persisted: unknown, version): Partial<LedgerState> => {
        const obj = (persisted ?? {}) as Partial<LedgerState>
        // Always strip any seed-era demo entries, regardless of version.
        return {
          transactions: [],
          profile: { name: '', email: '' },
          budget: 0,
          theme: typeof obj.theme === 'string' ? (obj.theme as ThemeMode) : 'system',
        }
        // Note: version already guaranteed >=1 by zustand/migrate signature; keep for future.
        void version
      },
    },
  ),
)
