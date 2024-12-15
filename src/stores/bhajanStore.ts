// src/stores/bhajanStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BhajanState {
  currentBhajan: { title: string; author: string } | null
  setCurrentBhajan: (bhajan: { title: string; author: string } | null) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  firstVisibleBhajan: { title: string; author: string } | null
  setFirstVisibleBhajan: (bhajan: { title: string; author: string } | null) => void
}

export const useBhajanStore = create<BhajanState>()(
  persist(
    (set) => ({
      currentBhajan: null,
      setCurrentBhajan: (bhajan) => set({ currentBhajan: bhajan }),
      searchTerm: '',
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      firstVisibleBhajan: null,
      setFirstVisibleBhajan: (bhajan) => set({ firstVisibleBhajan: bhajan })
    }),
    {
      name: 'bhajan-storage'
    }
  )
)