import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  writeTokenHash: string | null
  setWriteTokenHash: (writeTokenHash: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      writeTokenHash: null,
      setWriteTokenHash: (writeTokenHash) => set({ writeTokenHash })
    }),
    {
      name: 'auth-storage'
    }
  )
) 