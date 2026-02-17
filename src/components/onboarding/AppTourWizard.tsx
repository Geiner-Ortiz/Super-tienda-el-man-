'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/button'

interface TourStep {
  target: string // CSS selector
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}


interface AppTourWizardProps {
  onComplete: () => void
  onSkip: () => void
}

export function AppTourWizard({ onComplete, onSkip }: AppTourWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth < 1024)
  }, [])

  const steps: TourStep[] = [
    {
      target: isMobile ? '[data-tour="sidebar-trigger"]' : '[data-tour="sidebar"]',
      title: 'Menú Principal',
      description: 'Accede a todas las secciones. En celular, usa este botón para abrir el menú lateral.',
      position: isMobile ? 'bottom' : 'right'
    },
    {
      target: '[data-tour="dashboard"]',
      title: 'Tu Dashboard',
      description: 'Mira tus ventas y ganancias reales al instante. Todo calculado automáticamente.',
      position: isMobile ? 'bottom' : 'right'
    },
    {
      target: '[data-tour="add-sale-button"]',
      title: 'Registrar Venta',
      description: 'Este es el motor de tu negocio. Cada vez que vendas algo, regístralo aquí para ver tu ganancia diaria.',
      position: 'top'
    },
    {
      target: '[data-tour="help-button"]',
      title: 'Manual de Uso',
      description: 'Si tienes dudas, aquí siempre encontrarás el Manual del Maestro con guías paso a paso.',
      position: 'bottom'
    },
    {
      target: '[data-tour="chat-widget"]',
      title: 'Asistente Digital',
      description: '¿Necesitas ayuda con cálculos o dudas rápidas? Pregúntale a nuestra IA.',
      position: 'left'
    },
    {
      target: '[data-tour="user-profile"]',
      title: 'Perfil y Salida',
      description: 'Gestiona tu cuenta y cierra sesión de forma segura desde aquí.',
      position: 'bottom'
    }
  ]

  useEffect(() => {
    const step = steps[currentStep]
    const checkElement = () => {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // Si no encuentra el elemento en 2 segundos, saltar
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1)
        }
      }
    }

    const timer = setTimeout(checkElement, 300)
    return () => clearTimeout(timer)
  }, [currentStep, isMobile])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const step = steps[currentStep]

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '320px' }

    const padding = 20
    const tooltipWidth = isMobile ? Math.min(window.innerWidth - 32, 340) : 340

    if (isMobile) {
      const spaceBelow = window.innerHeight - targetRect.bottom

      // En móvil, preferimos centrado horizontal relativo al viewport
      if (spaceBelow > 280) {
        return {
          top: `${targetRect.bottom + padding}px`,
          left: '16px',
          right: '16px',
          width: 'calc(100% - 32px)',
          maxWidth: '400px',
          margin: '0 auto'
        }
      } else {
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: '16px',
          right: '16px',
          width: 'calc(100% - 32px)',
          maxWidth: '400px',
          margin: '0 auto'
        }
      }
    }

    // Desktop positioning with refined logic
    switch (step.position) {
      case 'right':
        return {
          top: `${Math.max(padding, Math.min(window.innerHeight - 300, targetRect.top + targetRect.height / 2))}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)',
          width: `${tooltipWidth}px`
        }
      case 'left':
        return {
          top: `${Math.max(padding, Math.min(window.innerHeight - 300, targetRect.top + targetRect.height / 2))}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: 'translateY(-50%)',
          width: `${tooltipWidth}px`
        }
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(tooltipWidth / 2 + padding, Math.min(window.innerWidth - tooltipWidth / 2 - padding, targetRect.left + targetRect.width / 2))}px`,
          transform: 'translateX(-50%)',
          width: `${tooltipWidth}px`
        }
      case 'top':
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${Math.max(tooltipWidth / 2 + padding, Math.min(window.innerWidth - tooltipWidth / 2 - padding, targetRect.left + targetRect.width / 2))}px`,
          transform: 'translateX(-50%)',
          width: `${tooltipWidth}px`
        }
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${tooltipWidth}px` }
    }
  }

  if (!mounted) return null

  const tooltipPosition = getTooltipPosition()

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Overlay with hole */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto" />

      {/* Highlight box */}
      {targetRect && (
        <div
          className="absolute border-2 border-secondary-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] bg-transparent pointer-events-none transition-all duration-500 ease-in-out"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <div className="absolute inset-0 rounded-xl animate-pulse-ring border-4 border-secondary-400/50" />
        </div>
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 transition-all duration-500 ease-out pointer-events-auto"
        style={tooltipPosition}
      >
        {/* Progress indicator */}
        <div className="flex gap-1.5 mb-5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${index <= currentStep ? 'bg-secondary-500 scale-y-110' : 'bg-gray-200/50 dark:bg-gray-700/50'
                }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500 bg-secondary-500/10 px-2 py-1 rounded-md">
            Guía de Inicio
          </span>
          <span className="text-xs font-bold text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight italic">
          {step.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onSkip}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors uppercase tracking-widest"
          >
            Saltar
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="font-bold text-xs uppercase"
              >
                Atrás
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs uppercase px-6 rounded-xl shadow-lg shadow-secondary-500/20"
            >
              {currentStep === steps.length - 1 ? '¡Listo!' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>,
    document.body
  )
}
