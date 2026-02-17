import Link from 'next/link'
import { BananaIcon } from '@/components/public/icons'
import { SignupForm } from '@/features/auth/components'

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left flex flex-col lg:flex-row items-center gap-4">
        <div className="lg:hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <BananaIcon className="w-10 h-10 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Tu Súper Tienda</h1>
          <p className="mt-2 text-foreground-secondary italic font-medium">Registro de Administrador</p>
          <p className="mt-2 text-primary-600 dark:text-primary-400 font-semibold italic text-sm">"Grandes cosas tienen comienzos pequeños. ¡Tu éxito empieza aquí!"</p>
          <p className="mt-2 text-sm text-foreground-muted">Crea tu cuenta para empezar a gestionar tu tienda con éxito</p>
        </div>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-foreground-secondary">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-medium text-accent-500 hover:text-accent-600 hover:underline">
          Inicia sesión
        </Link>
      </p>

      <p className="text-center text-xs text-foreground-muted">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/terms" className="underline hover:text-foreground-secondary">
          Términos de Servicio
        </Link>{' '}
        y{' '}
        <Link href="/privacy" className="underline hover:text-foreground-secondary">
          Política de Privacidad
        </Link>
      </p>
    </div>
  )
}
