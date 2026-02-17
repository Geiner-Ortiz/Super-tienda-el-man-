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
      title: 'Menú de Navegación',
      description: 'Desde aquí puedes acceder a todas las secciones de tu tienda. El menú es sencillo y directo.',
      position: isMobile ? 'bottom' : 'right'
    },
    {
      target: '[data-tour="dashboard"]',
      title: 'Dashboard de Ventas',
      description: 'Tu panel principal con el total de ventas del día, del mes y tu ganancia nítida (calculada al 20%).',
      position: isMobile ? 'bottom' : 'right'
    },
    {
      target: '[data-tour="chat-widget"]',
      title: 'Asistente Digital',
      description: 'Nuestro asistente te ayuda a entender cómo usar la plataforma y resolver dudas rápidas sobre tus cálculos.',
      position: 'left'
    },
    {
      target: '[data-tour="user-profile"]',
      title: 'Sesión y Perfil',
      description: 'Desde aquí puedes gestionar tu cuenta, notificaciones y salir del sistema de forma segura.',
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

    const padding = 16
    const tooltipWidth = isMobile ? Math.min(window.innerWidth - 32, 320) : 320

    if (isMobile) {
      const spaceBelow = window.innerHeight - targetRect.bottom
      const spaceAbove = targetRect.top

      if (spaceBelow > 220) {
        return {
          top: `${targetRect.bottom + padding}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tooltipWidth}px`
        }
      } else {
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tooltipWidth}px`
        }
      }
    }

    switch (step.position) {
      case 'right':
        return {
          top: `${Math.max(padding, targetRect.top + targetRect.height / 2)}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)',
          width: `${tooltipWidth}px`
        }
      case 'left':
        return {
          top: `${Math.max(padding, targetRect.top + targetRect.height / 2)}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: 'translateY(-50%)',
          width: `${tooltipWidth}px`
        }
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
          width: `${tooltipWidth}px`
        }
      case 'top':
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
          width: `${tooltipWidth}px`
        }
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${tooltipWidth}px` }
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Overlay with hole */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" />

      {/* Highlight box */}
      {targetRect && (
        <div
          className="absolute border-2 border-secondary-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] bg-transparent pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl p-6 transition-all duration-300 pointer-events-auto"
        style={getTooltipPosition()}
      >
        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${index <= currentStep ? 'bg-secondary-500' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <div className="text-xs text-foreground-secondary mb-2">
          Paso {currentStep + 1} de {steps.length}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-foreground-secondary mb-6">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Saltar tour
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
