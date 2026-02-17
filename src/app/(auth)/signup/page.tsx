import Link from 'next/link'
import { SignupForm } from '@/features/auth/components'

export default function SignupPage() {
  return (
    <div className="space-y-8">
      {/* Logo móvil */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl">ST</span>
        </div>
        <span className="text-3xl font-black text-primary-500 tracking-tight">Tu Súper Tienda</span>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-display-xs text-foreground font-bold italic">Tu Súper Tienda</h1>
        <p className="mt-2 text-foreground-secondary italic font-medium">Registro de Administrador</p>
        <p className="mt-2 text-primary-600 dark:text-primary-400 font-semibold italic text-sm">"Grandes cosas tienen comienzos pequeños. ¡Tu éxito empieza aquí!"</p>
        <p className="mt-2 text-sm text-foreground-muted">Crea tu cuenta para empezar a gestionar tu tienda con éxito</p>
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
