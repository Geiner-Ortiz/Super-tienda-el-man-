// No imports needed for logo text

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-3xl tracking-tighter">ST</span>
              </div>
              <span className="text-4xl xl:text-5xl font-black text-white tracking-tight">Tu Súper Tienda</span>
            </div>
            <h1 className="text-display-md text-white mb-4">
              Tu negocio, bendecido y nítido
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              La herramienta esencial para dueños de tiendas que buscan claridad total en sus ventas y resultados nítidos día tras día.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Registro de ventas ultra-rápido</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Cálculo automático del 20% de ganancia</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Dashboard nítido con métricas en vivo</span>
            </div>
          </div>
        </div>

        {/* Decoración */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
