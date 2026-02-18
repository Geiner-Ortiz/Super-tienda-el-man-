'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import type { Notification, NotificationType } from '@/types/database'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

interface NotificationCenterProps {
  userId: string
}

const NOTIFICATION_ICONS: Record<NotificationType, React.FC<{ className?: string }>> = {
  appointment_created: CalendarPlusIcon,
  appointment_confirmed: CheckCircleIcon,
  appointment_cancelled: XCircleIcon,
  appointment_reminder: BellIcon,
  payment_received: CurrencyIcon,
  case_update: DocumentIcon,
  document_request: FolderIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
}

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  appointment_created: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
  appointment_confirmed: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  appointment_cancelled: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
  appointment_reminder: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  payment_received: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
  case_update: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  document_request: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Load mute preference & mount for portal
  useEffect(() => {
    setMounted(true)
    const storedMute = localStorage.getItem('notification_muted')
    if (storedMute === 'true') setIsMuted(true)
  }, [])

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = !isMuted
    setIsMuted(newState)
    localStorage.setItem('notification_muted', String(newState))
    toast.info(newState ? 'Notificaciones silenciadas 🔕' : 'Notificaciones activadas 🔔')
  }

  // Close on click outside (Improved for both mobile and desktop)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is outside dropdown AND outside the trigger button
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
      }
      setIsLoading(false)
    }

    fetchNotifications()

    // Subscribe to new notifications
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
          // Play sound if not muted
          if (!isMuted) {
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => { })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, isMuted])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('Todas las notificaciones marcadas como leídas')
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `${minutes} min`
    if (hours < 24) return `${hours} h`
    if (days < 7) return `${days} d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Calculations for positioning if needed, but 'fixed' works well with Portal
  // We use Portal to break out of Sidebar transform constraints

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 active:scale-95 z-[60]"
      >
        {isMuted ? (
          <BellSlashIcon className={`w-6 h-6 text-gray-400 dark:text-gray-500`} />
        ) : (
          <BellIcon className={`w-6 h-6 ${isOpen ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'}`} />
        )}

        {!isMuted && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel - Portaled to Body to avoid Z-Index/Transform constraints */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* BACKDROP for Mobile Only - To close when clicking outside */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[9998] lg:hidden backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                className={`
                  fixed z-[9999] bg-white dark:bg-slate-900
                  rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10
                  overflow-hidden ring-1 ring-black/5

                  /* Mobile: Centered/Wide at top - Optimized for "Shop Owners" (Accessibility) */
                  left-4 right-4 top-24
                  max-w-lg mx-auto

                  /* Desktop: Popped out near the sidebar button (approx position) */
                  lg:left-[18rem] lg:top-16 lg:w-96 lg:right-auto lg:mx-0
                `}
                style={{ maxHeight: '80vh' }}
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between sticky top-0 backdrop-blur-xl z-10">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl lg:text-lg">Notificaciones</h3>
                    <p className="text-sm lg:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      {isMuted ? 'Silenciadas 🔕' : 'Tus alertas recientes'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Mute Button */}
                    <button
                      onClick={toggleMute}
                      className={`
                        p-3 lg:p-2 rounded-full transition-all
                        ${isMuted
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'}
                      `}
                      title={isMuted ? "Activar sonido" : "Silenciar notificaciones"}
                    >
                      {isMuted ? <BellSlashIcon className="w-5 h-5 lg:w-4 lg:h-4" /> : <BellIcon className="w-5 h-5 lg:w-4 lg:h-4" />}
                    </button>
                    {/* Close Button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-3 lg:p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Toolbar */}
                {unreadCount > 0 && (
                  <div className="px-5 py-3 lg:px-4 lg:py-2 bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-end backdrop-blur-sm">
                    <button
                      onClick={markAllAsRead}
                      className="text-sm lg:text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      Marcar todo como leído
                    </button>
                  </div>
                )}

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[60vh] lg:max-h-[400px] scrollbar-hide bg-white dark:bg-slate-900 overscroll-contain">
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <BellIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium text-lg lg:text-base">Estás al día</p>
                      <p className="text-gray-500 dark:text-gray-400 text-base lg:text-sm mt-1">No hay nuevas notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {notifications.map(notification => {
                        const Icon = NOTIFICATION_ICONS[notification.type] || BellIcon
                        const colorClass = NOTIFICATION_COLORS[notification.type] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

                        return (
                          <button
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`w-full p-5 lg:p-4 text-left transition-all hover:bg-gray-50/80 dark:hover:bg-white/5 relative group ${!notification.is_read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                              }`}
                          >
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass} shadow-sm md:group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className="w-6 h-6 lg:w-5 lg:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className={`text-base lg:text-sm ${notification.is_read ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-900 dark:text-white font-bold'}`}>
                                    {notification.title}
                                  </p>
                                  <span className="text-xs lg:text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-white/10 px-2 py-1 lg:px-1.5 lg:py-0.5 rounded-full">
                                    {formatTime(notification.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm lg:text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-4 lg:line-clamp-3">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 lg:w-1 lg:h-8 bg-primary-500 rounded-r-full" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

// Keep existing Icons and Add BellSlash
function BellSlashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  )
}

// Icons (Simple SVGs kept for brevity, improved styling in usage)
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function CalendarPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function InformationCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
