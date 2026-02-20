import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookingWizard } from '@/features/booking/components/BookingWizard'

export const metadata = {
  title: 'Nueva Turno | Tu Súper Tienda'
}

interface PageProps {
  searchParams: Promise<{ personal?: string }>
}

export default async function NewTurnoPage({ searchParams }: PageProps) {
  const params = await searchParams
  const preselectedPersonalId = params.personal

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/personals">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a personals
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Agendar Nueva Turno</h1>
        <p className="text-foreground-secondary mt-1">
          Sigue los pasos para reservar tu consulta legal
        </p>
      </div>

      <BookingWizard preselectedPersonalId={preselectedPersonalId} />
    </div>
  )
}
