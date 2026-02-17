import { create } from 'zustand'

interface UIState {
    isPWAHelpOpen: boolean
    pwaPlatform: 'ios' | 'android' | null
    openPWAHelp: (platform?: 'ios' | 'android') => void
    closePWAHelp: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isPWAHelpOpen: false,
    pwaPlatform: null,
    openPWAHelp: (platform) => set({
        isPWAHelpOpen: true,
        pwaPlatform: platform || null
    }),
    closePWAHelp: () => set({ isPWAHelpOpen: false, pwaPlatform: null }),
}))
