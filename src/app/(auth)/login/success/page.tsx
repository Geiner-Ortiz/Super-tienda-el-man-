'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TransitionLoader } from '@/features/auth/components/TransitionLoader'

export default function LoginSuccessPage() {
    const router = useRouter()

    useEffect(() => {
        // Forzamos un refresh para asegurar que las cookies de sesión se reconozcan
        router.refresh()

        const timer = setTimeout(() => {
            router.push('/dashboard')
        }, 3000)

        return () => clearTimeout(timer)
    }, [router])

    return <TransitionLoader message="Ahora tu tienda es más eficiente..." />
}
