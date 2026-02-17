import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminState {
    impersonatedUser: {
        id: string;
        storeName: string;
        fullName: string;
    } | null;
    isSupportMode: boolean;
    startSupportMode: (user: { id: string; storeName: string; fullName: string }) => void;
    stopSupportMode: () => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            impersonatedUser: null,
            isSupportMode: false,

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
        }
    )
);
