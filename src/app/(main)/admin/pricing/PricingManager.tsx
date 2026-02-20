'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TurnoType, Personal, Profile } from '@/types/database'

interface PricingManagerProps {
  initialTurnoTypes: TurnoType[]
  initialPersonals: (Personal & { profile: Profile })[]
}

export function PricingManager({ initialTurnoTypes, initialPersonals }: PricingManagerProps) {
  const [turnoTypes, setTurnoTypes] = useState(initialTurnoTypes)
  const [personals, setPersonals] = useState(initialPersonals)
  const [showAddType, setShowAddType] = useState(false)
  const [editingType, setEditingType] = useState<TurnoType | null>(null)
  const [editingPersonal, setEditingPersonal] = useState<string | null>(null)
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
        .from('turno_types')
        .update(typeData)
        .eq('id', editingType.id)

      if (!error) {
        setTurnoTypes(types =>
          types.map(t => t.id === editingType.id ? { ...t, ...typeData } : t)
        )
      }
    } else {
      const { data, error } = await supabase
        .from('turno_types')
        .insert(typeData)
        .select()
        .single()

      if (!error && data) {
        setTurnoTypes([...turnoTypes, data])
      }
    }

    resetForm()
    setSaving(false)
  }

  const handleDeleteType = async (id: string) => {
    if (!confirm('¿Eliminar este tipo de servicio?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('turno_types')
      .delete()
      .eq('id', id)

    if (!error) {
      setTurnoTypes(types => types.filter(t => t.id !== id))
    }
  }

  const handleUpdatePersonalRate = async (personalId: string, hourlyRate: number) => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('personals')
      .update({ hourly_rate: hourlyRate })
      .eq('id', personalId)

    if (!error) {
      setPersonals(personals =>
        personals.map(l => l.id === personalId ? { ...l, hourly_rate: hourlyRate } : l)
      )
    }

    setSaving(false)
    setEditingPersonal(null)
  }

  const resetForm = () => {
    setTypeName('')
    setTypeDescription('')
    setTypePrice(0)
    setEditingType(null)
    setShowAddType(false)
  }

  const startEditType = (type: TurnoType) => {
    setTypeName(type.name)
    setTypeDescription(type.description || '')
    setTypePrice(type.price)
    setEditingType(type)
    setShowAddType(true)
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Tipos de Servicio */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Estructura de Servicios</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Define los productos o consultas que ofreces en tu plataforma.</p>
          </div>
          <Button
            onClick={() => setShowAddType(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl px-6 py-6 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Servicio
          </Button>
        </div>

        {showAddType && (
          <Card className="p-8 mb-10 border-none bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-sm">
                {editingType ? '✎' : '+'}
              </span>
              {editingType ? 'Editar Servicio Existente' : 'Configurar Nuevo Servicio'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Nombre Público
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Ej: Asesoría Pro"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Precio Sugerido ($)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-indigo-600">$</span>
                  <input
                    type="number"
                    value={typePrice}
                    onChange={(e) => setTypePrice(Number(e.target.value))}
                    min={0}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-black text-lg text-indigo-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Breve Descripción
                </label>
                <input
                  type="text"
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  placeholder="¿Qué incluye este servicio?"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="ghost"
                onClick={resetForm}
                className="font-bold text-gray-500 hover:text-gray-700"
              >
                Descartar
              </Button>
              <Button
                onClick={handleSaveType}
                disabled={saving || !typeName.trim()}
                className="bg-gray-900 dark:bg-indigo-600 text-white font-black px-10 py-6 rounded-2xl transition-all"
              >
                {saving ? 'Procesando...' : editingType ? 'Guardar Cambios' : 'Lanzar Servicio'}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turnoTypes.map(type => (
            <Card key={type.id} className="p-0 border-none bg-white dark:bg-slate-900 shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${type.is_active
                      ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                    }`}>
                    {type.is_active ? 'Disponible' : 'Pausado'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                  {type.name}
                </h3>
                {type.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px] mb-4">
                    {type.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inversión Sugerida</p>
                    <p className="text-3xl font-black text-indigo-600">${type.price}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditType(type)}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      ✎
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 text-red-500"
                      onClick={() => handleDeleteType(type.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}

          {turnoTypes.length === 0 && (
            <Card className="col-span-full p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 bg-transparent rounded-[32px]">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay servicios</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Comienza definiendo tu primer servicio para que tus clientes puedan verte.</p>
              <Button
                onClick={() => setShowAddType(true)}
                className="bg-indigo-600 text-white font-black px-8 py-6 rounded-2xl"
              >
                Configurar Ahora
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* Tarifas por Personal */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Expertos y Colaboradores</h2>
            <p className="text-sm text-gray-500 font-medium">Gestiona las tarifas horarias y disponibilidad de tu equipo.</p>
          </div>
        </div>

        <Card className="rounded-[32px] overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                  <th className="text-left px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Especialidad</th>
                  <th className="text-left px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Tarifa Base</th>
                  <th className="text-left px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Disponibilidad</th>
                  <th className="text-right px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {personals.map(personal => (
                  <tr key={personal.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black text-lg">
                          {personal.profile?.full_name?.slice(0, 1).toUpperCase() || '👤'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">{personal.profile?.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{personal.profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                        {personal.specialty}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {editingPersonal === personal.id ? (
                        <div className="flex items-center gap-2 group-focus-within:ring-2 ring-indigo-500 rounded-xl p-1">
                          <span className="font-black text-indigo-600">$</span>
                          <input
                            type="number"
                            defaultValue={personal.hourly_rate}
                            min={0}
                            className="w-20 px-2 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:outline-none font-black text-indigo-600"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdatePersonalRate(personal.id, Number((e.target as HTMLInputElement).value))
                              }
                            }}
                          />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">/ hr</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">${personal.hourly_rate}</span>
                          <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">por hora</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${personal.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                          {personal.is_active ? 'Activo' : 'En Pausa'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {editingPersonal === personal.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPersonal(null)}
                          className="font-bold text-red-500 hover:bg-red-50"
                        >
                          Cancelar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPersonal(personal.id)}
                          className="rounded-xl border-gray-200 dark:border-gray-800 font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                        >
                          Ajustar Tarifa
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {personals.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 font-medium">Aún no hay expertos registrados en el equipo.</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
