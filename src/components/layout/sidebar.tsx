'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'
import { useTour } from '@/components/onboarding'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAdminStore } from '@/features/admin/store/adminStore'
import {
  BananaIcon,
  HomeIcon,
  UsersIcon,
  CalculatorIcon,
  HelpCircleIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  LogoutIcon,
  ShieldCheckIcon,
  XIcon,
  SmartphoneIcon,
  CreditCardIcon
} from '@/components/public/icons'
import { useTheme } from '@/shared/components/ThemeProvider'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ className?: string }>
  roles: UserRole[]
  badge?: string
  tourId?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['admin', 'personal', 'client', 'super_admin'] },
  { href: '/subscription', label: 'Mi Suscripción', icon: CreditCardIcon, roles: ['admin', 'personal', 'client', 'super_admin'] },
  { href: '/debtors', label: 'Clientes Morosos', icon: UsersIcon, roles: ['admin', 'personal', 'client', 'super_admin'] },
  { href: '/finances', label: 'Contabilidad', icon: CalculatorIcon, roles: ['admin', 'personal', 'client', 'super_admin'], tourId: 'nav-finances' },
  { href: '/admin', label: 'Panel Maestro', icon: ShieldCheckIcon, roles: ['super_admin'] },
  { href: '/guia', label: 'Guía de Uso', icon: HelpCircleIcon, roles: ['admin', 'personal', 'client', 'super_admin'] },
  { href: '/settings', label: 'Configuración', icon: Cog6ToothIcon, roles: ['admin', 'personal', 'client', 'super_admin'] },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

import { useUIStore } from '@/shared/store/uiStore'

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const { startTour } = useTour()
  const { openPWAHelp } = useUIStore()
  // ... (rest same)

  const [userRole, setUserRole] = useState<UserRole>('client')
  const [userName, setUserName] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('Tu Súper Tienda')
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { isSupportMode, impersonatedUser, _hasHydrated } = useAdminStore()

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, store_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserRole(profile.role as UserRole)
          setUserName(profile.full_name || user.email?.split('@')[0] || 'Usuario')
          setStoreName(profile.store_name || 'Tu Súper Tienda')
        }
      }
      setIsLoading(false)
    }

    fetchUserRole()
  }, [])

  // Overrides for Support Mode
  const displayUserName = isSupportMode && impersonatedUser ? impersonatedUser.fullName : userName
  const displayStoreName = isSupportMode && impersonatedUser ? impersonatedUser.storeName : storeName
  const displayUserId = isSupportMode && impersonatedUser ? impersonatedUser.id : userId

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole))

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[48] lg:hidden transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside
        data-tour="sidebar"
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-primary-500 text-white flex flex-col z-[49]
          transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => onClose?.()}>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <BananaIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-lg tracking-tight truncate max-w-[140px]">
                {displayStoreName}
              </h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium">
                {isSupportMode ? 'Modo Soporte' : 'Gestión Inteligente'}
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <XIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* User Info */}
        <div data-tour="user-profile" className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSupportMode ? 'bg-red-500/30' : 'bg-white/20'}`}>
              <span className="text-sm font-semibold">
                {displayUserName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayUserName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSupportMode ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isSupportMode ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                  {isSupportMode ? 'Modo Soporte' : 'Tienda Activa'}
                </span>
              </div>
            </div>
            {userId && (
              <NotificationCenter userId={userId} />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-white/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-white/80 px-4 mb-2 font-bold">
                Menú Principal
              </p>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={item.tourId}
                    onClick={() => onClose?.()}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-white/15 text-white border-l-4 border-secondary-500'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-secondary-500 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/20 space-y-2 mt-auto">
          <p className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
            Sistema
          </p>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            {theme === 'light' ? (
              <>
                <MoonIcon className="w-5 h-5" />
                <span className="font-medium">Modo Oscuro</span>
              </>
            ) : (
              <>
                <SunIcon className="w-5 h-5" />
                <span className="font-medium">Modo Claro</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              openPWAHelp()
              onClose?.()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <SmartphoneIcon className="w-5 h-5" />
            <span className="font-medium">Instalar App</span>
          </button>
          <button
            onClick={startTour}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <HelpCircleIcon className="w-5 h-5" />
            <span className="font-medium">Tour de la App</span>
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* Logout Confirmation Modal - Moved outside aside for proper centering */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/10 ring-1 ring-black/5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-error-50/50 to-transparent dark:from-error-900/10 pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 bg-error-50 dark:bg-error-900/20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 text-error-600 shadow-sm">
                <LogoutIcon className="w-8 h-8" />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  ¿Cerrar Sesión?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[260px] mx-auto">
                  Tendrás que iniciar sesión nuevamente para acceder a tu tienda.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-3 rounded-xl font-bold text-sm bg-error-600 hover:bg-error-700 text-white shadow-lg shadow-error-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sí, Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

