import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'
import { BananaIcon } from '@/components/public/icons'

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Logo móvil */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
          <BananaIcon className="w-8 h-8 text-white" />
        </div>
        <span className="text-3xl font-black text-primary-500 tracking-tight">Tú Súper Tienda</span>
      </div>

      <div className="text-center lg:text-left flex flex-col lg:flex-row items-center gap-4">
        <div className="hidden lg:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 items-center justify-center shadow-lg shadow-yellow-500/20">
          <BananaIcon className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-display-xs text-foreground font-bold leading-tight">Tú Súper Tienda</h1>
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
