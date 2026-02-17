import { create } from 'zustand'

interface UIState {
    isPWAHelpOpen: boolean
    openPWAHelp: () => void
    closePWAHelp: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isPWAHelpOpen: false,
    openPWAHelp: () => set({ isPWAHelpOpen: true }),
    closePWAHelp: () => set({ isPWAHelpOpen: false }),
}))
