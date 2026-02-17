import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckEmailPage() {
  return (
    <div className="space-y-8 text-center">
      {/* Logo móvil */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <span className="text-xl font-bold text-primary-500">Tú Súper Tienda</span>
      </div>

      <div className="mx-auto w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
        <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <h1 className="text-display-xs text-foreground font-bold italic">¡Ya casi estamos listos!</h1>
        <div className="mt-4 p-6 bg-gradient-to-r from-success-50 to-indigo-50 dark:from-success-950/20 dark:to-indigo-950/20 rounded-2xl border border-success-100 dark:border-success-900/30">
          <p className="text-lg font-medium text-success-700 dark:text-success-400 italic">
            "Cada gran tienda comenzó con un primer paso. ¡Este es el tuyo hacia el éxito!"
          </p>
        </div>
        <p className="mt-6 text-foreground-secondary leading-relaxed">
          Te hemos enviado un enlace de confirmación a tu correo electrónico.
        </p>

        <div className="mt-8 space-y-4 text-left bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
            <p className="text-sm text-foreground-secondary">Busca el correo de activación y haz clic en el enlace.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
            <p className="text-sm text-foreground-secondary">Una vez confirmado, regresa aquí para <strong>iniciar sesión</strong> y empezar a vender.</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full h-12 text-base font-bold rounded-xl bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all duration-200"
        >
          Ir a Iniciar Sesión
        </Link>
        <p className="mt-6 text-xs text-foreground-muted">
          ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
          <button className="font-medium text-accent-500 hover:text-accent-600 hover:underline">
            solicita uno nuevo
          </button>
        </p>
      </div>
    </div>
  )
}
