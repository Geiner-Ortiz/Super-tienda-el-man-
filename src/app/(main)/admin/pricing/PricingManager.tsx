'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubscriptionBanner } from '@/features/payments/components/SubscriptionBanner'
import type { BookingType, Staff, Profile } from '@/types/database'

interface PricingManagerProps {
  initialBookingTypes: BookingType[]
  initialStaff: (Staff & { profile: Profile })[]
}

export function PricingManager({ initialBookingTypes, initialStaff }: PricingManagerProps) {
  const [BookingTypes, setBookingTypes] = useState(initialBookingTypes)
  const [staff, setStaff] = useState(initialStaff)
  const [showAddType, setShowAddType] = useState(false)
  const [editingType, setEditingType] = useState<BookingType | null>(null)
  const [editingStaff, setEditingStaff] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [typeName, setTypeName] = useState('')
  const [typeDescription, setTypeDescription] = useState('')
  const [typePrice, setTypePrice] = useState(0)

  const handleSaveType = async () => {
    if (!typeName.trim()) return
    setSaving(true)

    const supabase = createClient()
    const typeData = {
      name: typeName,
      description: typeDescription || null,
      price: typePrice,
      is_active: true,
    }

    if (editingType) {
      const { error } = await supabase
        .from('Booking_types')
        .update(typeData)
        .eq('id', editingType.id)

      if (!error) {
        setBookingTypes(types =>
          types.map(t => t.id === editingType.id ? { ...t, ...typeData } : t)
        )
      }
    } else {
      const { data, error } = await supabase
        .from('Booking_types')
        .insert(typeData)
        .select()
        .single()

      if (!error && data) {
        setBookingTypes([...BookingTypes, data])
      }
    }

    resetForm()
    setSaving(false)
  }

  const handleDeleteType = async (id: string) => {
    if (!confirm('¿Eliminar este tipo de servicio?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('Booking_types')
      .delete()
      .eq('id', id)

    if (!error) {
      setBookingTypes(types => types.filter(t => t.id !== id))
    }
  }

  const handleUpdateStaffRate = async (StaffId: string, hourlyRate: number) => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('Staffs')
      .update({ hourly_rate: hourlyRate })
      .eq('id', StaffId)

    if (!error) {
      setStaffs(Staffs =>
        Staffs.map(l => l.id === StaffId ? { ...l, hourly_rate: hourlyRate } : l)
      )
    }

    setSaving(false)
    setEditingStaff(null)
  }

  const resetForm = () => {
    setTypeName('')
    setTypeDescription('')
    setTypeDuration(60)
    setTypePrice(0)
    setEditingType(null)
    setShowAddType(false)
  }

  const startEditType = (type: BookingType) => {
    setTypeName(type.name)
    setTypeDescription(type.description || '')
    setTypePrice(type.price)
    setEditingType(type)
    setShowAddType(true)
  }

  return (
    <div className="space-y-8">
      {/* Plan de Suscripción */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4 italic">Suscripción de la Tienda</h2>
        <SubscriptionBanner />
      </section>

      {/* Tipos de Servicio */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Tipos de Servicio</h2>
          <Button onClick={() => setShowAddType(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Servicio
          </Button>
        </div>

        {showAddType && (
          <Card className="p-6 mb-4 border-2 border-accent-200 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4">
              {editingType ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Ej: Servicio de Domicilio"
                  className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">
                  Precio Base ($)
                </label>
                <input
                  type="number"
                  value={typePrice}
                  onChange={(e) => setTypePrice(Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  placeholder="Descripción breve..."
                  className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSaveType} disabled={saving || !typeName.trim()}>
                {saving ? 'Guardando...' : editingType ? 'Actualizar' : 'Crear Servicio'}
              </Button>
            </div>
          </Card >
        )
        }

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BookingTypes.map(type => (
            <Card key={type.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{type.name}</h3>
                  {type.description && (
                    <p className="text-sm text-foreground-secondary mt-1">{type.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {type.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-foreground-secondary">Precio</p>
                  <p className="font-semibold text-secondary-600">${type.price}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={() => startEditType(type)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-error-600 hover:text-error-700" onClick={() => handleDeleteType(type.id)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}

          {BookingTypes.length === 0 && (
            <Card className="col-span-full p-8 text-center">
              <p className="text-foreground-secondary">No hay servicios configurados</p>
              <Button onClick={() => setShowAddType(true)} className="mt-4">
                Crear Primer Servicio
              </Button>
            </Card>
          )}
        </div>
      </section >

      {/* Tarifas por Personal */}
      < section >
        <h2 className="text-lg font-semibold text-foreground mb-4">Tarifas por Personal</h2>

        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground-secondary">Colaborador</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground-secondary">Costo por Hora</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground-secondary">Estado</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map(Staff => (
                <tr key={Staff.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {Staff.profile?.full_name?.slice(0, 2).toUpperCase() || '??'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{Staff.profile?.full_name}</p>
                        <p className="text-sm text-foreground-secondary">{Staff.profile?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingStaff === Staff.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-foreground-secondary">$</span>
                        <input
                          type="number"
                          defaultValue={Staff.hourly_rate}
                          min={0}
                          className="w-24 px-3 py-1 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateStaffRate(Staff.id, Number((e.target as HTMLInputElement).value))
                            }
                          }}
                        />
                        <span className="text-foreground-secondary">/hora</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-secondary-600">${Staff.hourly_rate}/hora</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${Staff.is_active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {Staff.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingStaff === Staff.id ? (
                      <Button variant="ghost" size="sm" onClick={() => setEditingStaff(null)}>
                        Cancelar
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setEditingStaff(Staff.id)}>
                        Editar Costo
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {Staffs.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-foreground-secondary">No hay personal registrado</p>
            </div>
          )}
        </Card>
      </section >
    </div >
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
