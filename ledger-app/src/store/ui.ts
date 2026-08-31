import { create } from 'zustand'
import { currentMonthKey } from '@/lib/utils'

export interface ToastItem {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
}

interface UiState {
  /** 'YYYY-MM' — shared across Dashboard / Transactions / Statistics */
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  toasts: ToastItem[]
  toast: (message: string, tone?: ToastItem['tone']) => void
  dismissToast: (id: number) => void
}

let toastId = 0

export const useUiStore = create<UiState>((set, get) => ({
  selectedMonth: currentMonthKey(),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  toasts: [],
  toast: (message, tone = 'info') => {
    const id = ++toastId
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
    setTimeout(() => get().dismissToast(id), 2200)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
