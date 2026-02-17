import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminState {
    impersonatedUser: {
        id: string;
        storeName: string;
        fullName: string;
    } | null;
    isSupportMode: boolean;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    startSupportMode: (user: { id: string; storeName: string; fullName: string }) => void;
    stopSupportMode: () => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            impersonatedUser: null,
            isSupportMode: false,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            startSupportMode: (user) => set({
                impersonatedUser: user,
                isSupportMode: true
            }),

            stopSupportMode: () => set({
                impersonatedUser: null,
                isSupportMode: false
            }),
        }),
        {
            name: 'admin-support-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);
