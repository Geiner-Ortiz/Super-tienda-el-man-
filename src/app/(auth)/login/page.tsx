import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'
import { BananaIcon } from '@/components/public/icons'

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left flex flex-col lg:flex-row items-center gap-4">
        <div className="lg:hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <BananaIcon className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Inicia sesión en tu cuenta para continuar</h1>
          <p className="mt-2 text-lg text-foreground-secondary">Gestiona tu tienda con éxito y claridad total</p>
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
