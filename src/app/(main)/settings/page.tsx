'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAdminStore } from '@/features/admin/store/adminStore'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        id: '',
        full_name: '',
        store_name: '',
        profit_margin: 20
    })
    const { isSupportMode, impersonatedUser, _hasHydrated } = useAdminStore()
    const supabase = createClient()

    useEffect(() => {
        async function fetchProfile() {
            if (!_hasHydrated) return
            setLoading(true)

            let userId: string
            if (isSupportMode && impersonatedUser) {
                userId = impersonatedUser.id
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                userId = user.id
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (data) {
                setProfile({
                    id: userId,
                    full_name: data.full_name || '',
                    store_name: data.store_name || '',
                    profit_margin: (data.profit_margin || 0.20) * 100
                })
            }
            setLoading(false)
        }

        fetchProfile()
    }, [isSupportMode, impersonatedUser?.id, _hasHydrated])

    const handleSave = async () => {
        setSaving(true)
        let userId: string

        if (isSupportMode && impersonatedUser) {
            userId = impersonatedUser.id
        } else {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            userId = user.id
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: profile.full_name,
                store_name: profile.store_name,
                profit_margin: Number(profile.profit_margin) / 100,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (error) {
            toast.error('Error al guardar los ajustes')
        } else {
            toast.success('Ajustes guardados correctamente')
        }
        setSaving(false)
    }

    if (loading) {
        return <div className="p-8 animate-pulse text-foreground-secondary">Cargando ajustes...</div>
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-display-sm font-bold text-foreground">Configuración del Negocio</h1>
                <p className="text-foreground-secondary italic">Personaliza tu tienda y tus ganancias</p>
            </div>

            <Card className="p-6 md:p-8 border-none shadow-sm dark:bg-gray-900 space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Nombre del Administrador"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Tu nombre completo"
                    />

                    <Input
                        label="Nombre de la Tienda"
                        value={profile.store_name}
                        onChange={(e) => setProfile({ ...profile, store_name: e.target.value })}
                        placeholder="Ej: Tienda La Bendición"
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground-secondary">
                            Margen de Ganancia (%)
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={profile.profit_margin}
                                    onChange={(e) => setProfile({ ...profile, profit_margin: Number(e.target.value) })}
                                    className="w-32"
                                />
                                <span className="text-lg font-bold text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-foreground-muted">
                                Este porcentaje se aplicará a todas las nuevas ventas registradas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={handleSave}
                        isLoading={saving}
                        className="w-full md:w-auto px-8"
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </Card>

            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-dashed border-2 border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tu ID de Soporte</p>
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400 select-all">
                            {profile.id}
                        </code>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl flex gap-2 h-9"
                        onClick={() => {
                            navigator.clipboard.writeText(profile.id)
                            toast.success('ID copiado al portapapeles')
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Copiar
                    </Button>
                </div>
            </Card>

            <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-sm text-primary-800 dark:text-primary-300">
                        <p className="font-bold mb-1">Dato importante:</p>
                        <p>El margen de ganancia solo afecta a las ventas que registres desde **ahora en adelante**. Las ventas guardadas anteriormente mantendrán el margen que tenían en su momento.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
