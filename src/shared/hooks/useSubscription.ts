'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export interface SubscriptionStatus {
    isActive: boolean
    isTrial: boolean
    isExpired: boolean
    daysRemaining: number
    isLoading: boolean
}

export function useSubscription() {
    const [status, setStatus] = useState<SubscriptionStatus>({
        isActive: false,
        isTrial: false,
        isExpired: false,
        daysRemaining: 0,
        isLoading: true
    })

    useEffect(() => {
        const fetchSubscription = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setStatus(prev => ({ ...prev, isLoading: false }))
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_status, trial_ends_at, created_at')
                .eq('id', user.id)
                .single()

            if (profile) {
                const isActive = profile.subscription_status === 'active'

                // Si no hay trial_ends_at (usuario viejo), calculamos 30 días desde created_at
                const trialEndDate = profile.trial_ends_at
                    ? new Date(profile.trial_ends_at)
                    : new Date(new Date(profile.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)

                const now = new Date()
                const isExpired = !isActive && now > trialEndDate
                const isTrial = !isActive && now <= trialEndDate

                const diffTime = trialEndDate.getTime() - now.getTime()
                const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

                setStatus({
                    isActive,
                    isTrial,
                    isExpired,
                    daysRemaining,
                    isLoading: false
                })
            } else {
                setStatus(prev => ({ ...prev, isLoading: false }))
            }
        }

        fetchSubscription()
    }, [])

    return status
}
