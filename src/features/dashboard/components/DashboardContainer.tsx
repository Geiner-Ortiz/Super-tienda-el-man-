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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight italic">
                        Súper Tienda El Maná
                    </h1>
                    <p className="mt-3 text-xl text-gray-500 dark:text-gray-400 font-medium pb-2">
                        Control total de tus ventas y ganancias <span className="text-secondary-500 font-bold">(20%)</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">En Vivo</span>
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
