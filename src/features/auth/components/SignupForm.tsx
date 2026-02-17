'use client'

import { useState } from 'react'
import { signup } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    console.log('Cliente: Enviando formulario...');
    setLoading(true)
    setError(null)

    try {
      const result = await signup(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (e) {
      console.error('Signup error:', e)
      // En Next.js, redirect lanza un error, pero el componente debería desmontarse.
      // Si llegamos aquí y no es un redirect, reseteamos el loading.
      if (!(e instanceof Error && e.message === 'NEXT_REDIRECT')) {
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.')
        setLoading(false)
      }
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-primary-600 dark:text-primary-400 font-bold">Registro de Socio</p>
          <p className="text-sm font-bold text-foreground">Perfil de Administrador</p>
        </div>
      </div>

      <Input
        id="storeName"
        name="storeName"
        type="text"
        label="Nombre de tu Tienda"
        placeholder="Ej: Tienda La Bendición"
        required
      />

      <Input
        id="fullName"
        name="fullName"
        type="text"
        label="Nombre del Administrador"
        placeholder="Tu nombre completo"
        required
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="tu@email.com"
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        hint="La contraseña debe tener al menos 6 caracteres"
        required
        minLength={6}
      />

      {error && (
        <div className="rounded-lg bg-error-50 border border-error-500 p-3">
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        isLoading={loading}
        className="w-full"
      >
        Crear Cuenta
      </Button>
    </form>
  )
}
