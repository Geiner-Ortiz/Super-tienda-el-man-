'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { dashboardService } from '../services/dashboardService';
import { salesService } from '../../sales/services/salesService';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStore } from '@/features/admin/store/adminStore';
import { DashboardStats } from './DashboardStats';
import { SalesList } from '../../sales/components/SalesList';
import { AddSaleForm } from '../../sales/components/AddSaleForm';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface Props {
    overrideUserId?: string;
}

export function DashboardContainer({ overrideUserId }: Props) {
    const { user: currentUser, profile: currentProfile, loading: authLoading } = useAuth();
    const { setFinancialData, setLoading, recentSales, isLoading: storeLoading } = useDashboardStore();
    const { impersonatedUser, isSupportMode, _hasHydrated } = useAdminStore();

    const [remoteProfile, setRemoteProfile] = useState<Profile | null>(null);

    // Si hay overrideUserId o estamos en modo soporte, mostramos vista de "Maestro"
    const isMaestroView = !!overrideUserId || isSupportMode;
    const activeUserId = overrideUserId || (isSupportMode ? impersonatedUser?.id : currentUser?.id);

    // Determine which profile to use
    const profile = isSupportMode ? impersonatedUser : (isMaestroView ? remoteProfile : currentProfile);

    // Safe access to store name for TS
    let displayStoreName = 'Tu Súper Tienda';
    if (isSupportMode && impersonatedUser) {
        displayStoreName = impersonatedUser.storeName;
    } else if (profile && 'store_name' in profile && profile.store_name) {
        displayStoreName = profile.store_name;
    }

    const storeName = displayStoreName;

    // Safe access to profit margin for TS
    let displayProfitMargin = '20%';
    if (!isSupportMode && profile && 'profit_margin' in profile && profile.profit_margin) {
        displayProfitMargin = `${(profile.profit_margin * 100).toFixed(0)}%`;
    }

    const profitMargin = displayProfitMargin;

    const MOTIVATIONAL_PHRASES = [
        "Un negocio organizado es el primer paso hacia la libertad financiera.",
        "Hoy es el mejor día para registrar tu éxito y ver crecer tus ganancias.",
        "Controlar tus gastos es la forma más rápida de subir tus ingresos.",
        "Tu tienda merece la mejor tecnología. ¡Vamos a vender con toda!",
        "Tus números bajo control, tu mente en paz para crecer más.",
        "Cada venta que registras hoy, es una semilla para tu éxito de mañana."
    ];

    // Usar el ID del usuario para que la frase sea consistente durante el día
    const userIdForPhrase = activeUserId;
    const phraseIndex = userIdForPhrase ? (userIdForPhrase.charCodeAt(0) + userIdForPhrase.charCodeAt(userIdForPhrase.length - 1)) % MOTIVATIONAL_PHRASES.length : 0;
    const dailyPhrase = MOTIVATIONAL_PHRASES[phraseIndex];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch remote profile if overrideUserId is provided
                if (overrideUserId) {
                    const supabase = createClient();
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', overrideUserId)
                        .single();
                    setRemoteProfile(data);
                } else {
                    setRemoteProfile(null); // Clear remote profile if not in maestro view
                }

                const [stats, trends, sales] = await Promise.all([
                    dashboardService.getFinancialStats(overrideUserId),
                    dashboardService.getDailyTrends(7, overrideUserId),
                    salesService.getSales(undefined, undefined, overrideUserId)
                ]);

                setFinancialData(stats, trends, sales);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [setFinancialData, setLoading, overrideUserId, isSupportMode, impersonatedUser?.id, _hasHydrated]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-12">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1
                        data-tour="dashboard"
                        className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight italic"
                    >
                        {storeName}
                    </h1>
                    <div className="mt-3 flex flex-col gap-1">
                        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium">
                            Control total de tus ventas y ganancias <span className="text-secondary-500 font-bold">({profitMargin})</span>
                        </p>
                        <p className="text-sm md:text-base text-primary-600 dark:text-primary-400 font-bold italic animate-in fade-in slide-in-from-left duration-700">
                            " {dailyPhrase} "
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 self-start md:self-auto">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">En Vivo</span>
                </div>
            </header>

            <section>
                <DashboardStats />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <aside className="lg:col-span-1">
                    <AddSaleForm />
                </aside>

                <main className="lg:col-span-2 space-y-6">
                    <SalesList sales={recentSales} />
                </main>
            </div>
        </div>
    );
}
