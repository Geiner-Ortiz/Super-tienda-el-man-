import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Logo móvil */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl">ST</span>
        </div>
        <span className="text-3xl font-black text-primary-500 tracking-tight">Tu Súper Tienda</span>
      </div>

      <div className="text-center lg:text-left flex flex-col lg:flex-row items-center gap-4">
        <div className="hidden lg:flex w-16 h-16 rounded-2xl bg-primary-500 items-center justify-center shadow-lg shadow-primary-500/20">
          <span className="text-white font-black text-3xl">ST</span>
        </div>
        <div>
          <h1 className="text-display-xs text-foreground font-bold leading-tight">Tu Súper Tienda</h1>
          <p className="mt-1 text-foreground-secondary">Inicia sesión en tu cuenta para continuar</p>
        </div>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-foreground-secondary">
        ¿No tienes una cuenta?{' '}
        <Link href="/signup" className="font-medium text-accent-500 hover:text-accent-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
