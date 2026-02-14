'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { salesService } from '../../sales/services/salesService';
import { DashboardStats } from './DashboardStats';
import { RecentSalesList } from './RecentSalesList';
import { AddSaleForm } from '../../sales/components/AddSaleForm';

export function DashboardContainer() {
    const { setStats, setProfiles, setLoading } = useDashboardStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Cargar perfiles primero para el mapeo de nombres
                const profiles = await salesService.getProfiles();
                setProfiles(profiles);

                const sales = await salesService.getSales();
                setStats(sales);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [setStats, setLoading]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Súper Tienda El Maná
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Control total de tus ventas y ganancias (20%)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">En Vivo</span>
                </div>
            </header>

            <section>
                <DashboardStats />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <aside className="lg:col-span-1">
                    <AddSaleForm />
                </aside>

                <main className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas Recientes</h2>
                    </div>
                    <RecentSalesList />
                </main>
            </div>
        </div>
    );
}
