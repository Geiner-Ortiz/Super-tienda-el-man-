'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Profile, UserRole } from '@/types/database'

interface UserManagementProps {
    initialUsers: Profile[]
}

const ROLES: { value: UserRole; label: string; color: string }[] = [
    { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700' },
    { value: 'lawyer', label: 'Vendedor', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'client', label: 'Cliente', color: 'bg-purple-100 text-purple-700' },
]

export function UserManagement({ initialUsers }: UserManagementProps) {
    const [users, setUsers] = useState(initialUsers)
    const [filter, setFilter] = useState<UserRole | 'all'>('all')
    const [search, setSearch] = useState('')
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'all' || user.role === filter
        const matchesSearch =
            user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setSaving(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (!error) {
            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ))
        }

        setSaving(false)
        setEditingUser(null)
    }

    const getRoleBadge = (role: UserRole) => {
        const roleConfig = ROLES.find(r => r.value === role)
        return roleConfig || ROLES[2]
    }

    return (
        <Card className="overflow-hidden border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
            {/* Filters */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        Todos
                    </button>
                    {ROLES.map(role => (
                        <button
                            key={role.value}
                            onClick={() => setFilter(role.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === role.value
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            {role.label}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Personal</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rol</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Registrado</th>
                            <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredUsers.map((user) => {
                            const roleBadge = getRoleBadge(user.role)
                            const isEditing = editingUser === user.id

                            return (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {user.full_name?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {user.full_name || 'Sin nombre'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                {ROLES.map(role => (
                                                    <button
                                                        key={role.value}
                                                        onClick={() => handleRoleChange(user.id, role.value)}
                                                        disabled={saving}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${user.role === role.value
                                                                ? `${role.color} ring-2 ring-offset-1 ring-blue-500`
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {role.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${roleBadge.color}`}>
                                                {roleBadge.label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString('es-CO', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingUser(null)}
                                                className="rounded-xl"
                                            >
                                                Cancelar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingUser(user.id)}
                                                className="rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                Cambiar Rol
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
                    </div>
                )}
            </div>
        </Card>
    )
}
