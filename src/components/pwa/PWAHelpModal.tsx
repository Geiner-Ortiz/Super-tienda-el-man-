'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XIcon, BananaIcon } from '@/components/public/icons'
import { Button } from '@/components/ui/button'

interface PWAHelpModalProps {
    isOpen: boolean
    onClose: () => void
    initialPlatform?: 'ios' | 'android'
}

export function PWAHelpModal({ isOpen, onClose, initialPlatform }: PWAHelpModalProps) {
    const [activeTab, setActiveTab] = useState<'ios' | 'android'>('android')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (initialPlatform) {
            setActiveTab(initialPlatform)
        } else {
            const ua = window.navigator.userAgent.toLowerCase()
            if (/iphone|ipad|ipod/.test(ua)) {
                setActiveTab('ios')
            }
        }
    }, [initialPlatform])

    if (!mounted || !isOpen) return null

    const AppleIcon = () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.05 20.28c-.98.95-2.05 1.78-3.11 1.78-.35 0-.74-.08-1.12-.22-.38-.14-.76-.32-1.13-.32-.38 0-.76.18-1.14.33-.38.15-.77.25-1.13.25-1.13 0-2.25-.92-3.32-2.19-2.02-2.4-3.18-5.91-3.18-8.72 0-2.19.8-3.87 2.22-4.72.63-.38 1.41-.62 2.22-.62.46 0 .95.1 1.43.27.48.17.95.42 1.34.42s.8-.25 1.35-.43c.55-.18 1.1-.31 1.62-.31 1.05 0 2.06.33 2.91.95 1.54 1.12 2.37 2.76 2.37 2.76s-1.87 1.13-1.87 3.33c0 1.95 1.44 2.87 1.44 2.87a5.57 5.57 0 0 1-1.2 2.15zM12.03 5.4c.1-.88.61-1.9 1.43-2.6.84-.71 1.83-1.19 2.84-1.19.06 0 .12 0 .17.01.12.87-.52 1.92-1.4 2.59-.83.62-1.86 1.16-2.91 1.16-.05 0-.11 0-.13-.01v.04z" />
        </svg>
    )

    const AndroidIcon = () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.523 15.3414c-.5511 0-.9977-.4467-.9977-.9977s.4466-.9977.9977-.9977.9977.4467.9977.9977-.4466.9977-.9977.9977M6.477 15.3414c-.5511 0-.9977-.4467-.9977-.9977s.4466-.9977.9977-.9977.9977.4467.9977.9977-.4466.9977-.9977.9977M12 5.006c-3.134 0-5.839 1.838-7.143 4.512h14.286C17.839 6.844 15.134 5.006 12 5.006m5.845 15.378l1.45 2.512c.105.183.338.245.52.14.183-.105.245-.338.14-.52l-1.464-2.535C21.05 18.347 22.463 15.835 22.463 13.064c0-.986-.184-1.927-.518-2.793H2.055c-.334.866-.518 1.807-.518 2.793 0 2.771 1.413 5.283 3.972 6.917l-1.464 2.535c-.105.183-.043.416.14.52.183.105.416.043.52-.14l1.45-2.512C7.636 21.36 9.742 21.895 12 21.895c2.258 0 4.364-.535 5.845-1.511" />
        </svg>
    )

    const steps = {
        ios: [
            {
                text: 'Toca el botón de "Compartir" en la barra inferior de Safari.',
                icon: (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V3m0 0L8 7m4-4l4 4" />
                        </svg>
                    </div>
                )
            },
            {
                text: 'Desliza hacia abajo y selecciona "Añadir a pantalla de inicio".',
                icon: (
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 font-bold text-xl">
                        +
                    </div>
                )
            },
            {
                text: 'Confirma tocando "Añadir" en la esquina superior derecha.',
                icon: (
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )
            }
        ],
        android: [
            {
                text: 'Toca los tres puntos de opciones en la esquina superior derecha.',
                icon: (
                    <div className="flex flex-col gap-0.5 items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                )
            },
            {
                text: 'Busca y selecciona la opción "Instalar aplicación" o "Añadir a pantalla de inicio".',
                icon: (
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                )
            },
            {
                text: 'Confirma en el cuadro de diálogo que aparecerá.',
                icon: (
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )
            }
        ]
    }

    return createPortal(
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-950 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-primary-500 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <BananaIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tight uppercase leading-none">Instalar App</h2>
                            <p className="text-white/70 text-sm font-medium">Súper Tienda El Maná</p>
                        </div>
                    </div>

                    <div className="flex bg-black/10 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('ios')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ios' ? 'bg-white text-primary-600 shadow-sm' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <AppleIcon />
                            Apple iOS
                        </button>
                        <button
                            onClick={() => setActiveTab('android')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'android' ? 'bg-white text-primary-600 shadow-sm' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <AndroidIcon />
                            Android
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {steps[activeTab].map((step, idx) => (
                        <div key={idx} className="flex gap-5 group">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center text-sm font-black border border-primary-100 dark:border-primary-800 shrink-0">
                                    {idx + 1}
                                </div>
                                {idx < 2 && <div className="w-0.5 h-full bg-gradient-to-b from-primary-200 to-transparent dark:from-primary-800 mt-2" />}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                                        {step.icon}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {step.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4">
                        <Button
                            onClick={onClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest h-12 rounded-xl"
                        >
                            ¡Entendido!
                        </Button>
                        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.1em] font-bold">
                            Disfruta de una mejor experiencia sin navegador
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
