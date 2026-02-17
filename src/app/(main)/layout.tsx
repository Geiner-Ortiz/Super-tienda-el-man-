'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { ChatWidget } from '@/features/chatbot/components/ChatWidget'
import { WhatsAppHelp } from '@/features/support/components/WhatsAppHelp'
import { TourProvider } from '@/components/onboarding'
import { createClient } from '@/lib/supabase/client'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { SupportModeBanner } from '@/features/admin/components'
import { useAdminStore } from '@/features/admin/store/adminStore'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [storeName, setStoreName] = useState('Tu Súper Tienda')
  const supabase = createClient()

  useEffect(() => {
    async function fetchStoreName() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('store_name')
          .eq('id', user.id)
          .single()
        if (data?.store_name) setStoreName(data.store_name)
      }
    }
    fetchStoreName()
  }, [])

  const { isSupportMode, impersonatedUser, _hasHydrated } = useAdminStore()

  // Branding dynamic
  const displayStoreName = (isSupportMode && impersonatedUser && _hasHydrated)
    ? impersonatedUser.storeName
    : storeName

  return (
    <TourProvider>
      <div className={`min-h-screen bg-background transition-all duration-300 ${isSupportMode ? 'pt-12' : ''}`}>
        <SupportModeBanner />
        <MobileHeader
          onMenuClick={() => setIsMenuOpen(true)}
          storeName={displayStoreName}
        />

        <Sidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <main className="lg:ml-64 pt-16 lg:pt-0">
          {children}
        </main>

        <WhatsAppHelp />
        <ChatWidget />
        <PWAInstallPrompt />
      </div>
    </TourProvider>
  )
}
