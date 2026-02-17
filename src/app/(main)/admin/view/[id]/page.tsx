'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardContainer } from '@/features/dashboard/components/DashboardContainer'
import { Button } from '@/components/ui/button'

export default function MaestroUserView() {
    const { id } = useParams()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || profile.role !== 'super_admin') {
                setIsAuthorized(false)
                router.push('/dashboard')
                return
            }

            setIsAuthorized(true)
        }

        checkAuth()
    }, [router])

    if (isAuthorized === null) return <div className="p-8 text-center">Verificando acceso Maestro...</div>
    if (!isAuthorized) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="bg-primary-600 text-white px-4 py-2 flex items-center justify-between shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-primary-700"
                        onClick={() => router.push('/admin')}
                    >
                        ← Volver al Panel Maestro
                    </Button>
                    <div className="h-6 w-px bg-primary-500" />
                    <p className="text-sm font-bold">
                        ESTÁS EN MODO INSPECCIÓN <span className="text-primary-200">(ID: {id})</span>
                    </p>
                </div>
            </div>

            <DashboardContainer overrideUserId={id as string} />
        </div>
    )
}
