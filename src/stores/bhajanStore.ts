// src/stores/bhajanStore.ts
import { create } from 'zustand'

interface BhajanState {
  currentBhajan: { title: string; author: string } | null
  setCurrentBhajan: (bhajan: { title: string; author: string } | null) => void
  search: string
  setSearch: (search: string) => void
}

export const useBhajanStore = create<BhajanState>((set) => ({
  currentBhajan: null,
  setCurrentBhajan: (bhajan) => set({ currentBhajan: bhajan }),
  search: '',
  setSearch: (search) => set({ search })
}))