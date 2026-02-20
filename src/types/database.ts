// ============================================
// TIPOS DEL DOMINIO - Tu Súper Tienda
// ============================================

export type UserRole = 'client' | 'staff' | 'admin' | 'super_admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  store_name?: string
  profit_margin?: number
  subscription_id?: string | null
  subscription_status?: 'active' | 'inactive' | 'past_due' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  user_id: string
  role_description: string | null
  bio: string | null
  experience_years: number
  hourly_rate: number
  rating: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Relaciones
  profile?: Profile
}

export interface Client {
  id: string
  user_id: string | null // null for guest clients
  full_name: string | null // Direct name for guest clients
  email: string | null // Direct email for guest clients
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relaciones
  profile?: Profile | null
}

export interface BookingType {
  id: string
  name: string
  description: string | null
  price: number
  is_active: boolean
  created_at: string
}

export interface Availability {
  id: string
  Staff_id: string
  day_of_week: number // 0=Domingo, 6=Sabado
  start_time: string // "09:00"
  end_time: string // "17:00"
  is_available: boolean
  created_at: string
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'paid'
  | 'no_show'

export interface Booking {
  id: string
  client_id: string
  Staff_id: string
  Booking_type_id: string | null
  scheduled_at: string
  duration_minutes: number
  status: BookingStatus
  notes: string | null
  client_notes: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  // Relaciones expandidas
  client?: Client & { profile: Profile }
  Staff?: Staff & { profile: Profile }
  Booking_type?: BookingType
}

// ============================================
// DTOs para operaciones
// ============================================

export interface CreateBookingDTO {
  Staff_id: string
  Booking_type_id: string
  scheduled_at: string
  client_notes?: string
}

export interface UpdateBookingDTO {
  status?: BookingStatus
  notes?: string
  scheduled_at?: string
  cancellation_reason?: string
}

export interface CreateStaffDTO {
  user_id: string
  specialty: string
  bio?: string
  experience_years?: number
  hourly_rate?: number
}

export interface UpdateStaffDTO {
  specialty?: string
  bio?: string
  experience_years?: number
  hourly_rate?: number
  is_active?: boolean
}

export interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

// ============================================
// Tipo expandido de Staff con perfil
// ============================================

export interface StaffWithProfile extends Staff {
  profile: Profile
  availability?: Availability[]
}

export interface BookingWithRelations extends Omit<Booking, 'client' | 'staff' | 'Booking_type'> {
  client: Client & { profile?: Profile | null }
  staff: Staff & { profile: Profile }
  Booking_type: BookingType | null
}

// ============================================
// Sistema de Precios y Servicios
// ============================================

export type PricingType = 'hourly' | 'fixed'

export interface ServicePricing {
  id: string
  Staff_id: string
  service_name: string
  pricing_type: PricingType
  hourly_rate: number | null
  fixed_price: number | null
  duration_minutes: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateServicePricingDTO {
  Staff_id: string
  service_name: string
  pricing_type: PricingType
  hourly_rate?: number
  fixed_price?: number
  duration_minutes: number
  description?: string
}

// ============================================
// Sistema de Pagos
// ============================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'card' | 'transfer' | 'cash'

export interface Payment {
  id: string
  Booking_id: string
  amount: number
  status: PaymentStatus
  payment_method: PaymentMethod | null
  transaction_id: string | null
  paid_at: string | null
  created_at: string
  // Relaciones
  Booking?: Booking
}

// ============================================
// Sistema de Notificaciones
// ============================================

export type NotificationType =
  | 'Booking_created'
  | 'Booking_confirmed'
  | 'Booking_cancelled'
  | 'Booking_reminder'
  | 'payment_received'
  | 'case_update'
  | 'document_request'
  | 'info'
  | 'warning'
  | 'success'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

// ============================================
// Sistema de Proyectos/Casos
// ============================================

export type ProjectStatus = 'pending' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  Staff_id: string
  client_id: string | null
  title: string
  description: string | null
  status: ProjectStatus
  case_type: string | null
  start_date: string
  due_date: string | null
  budget: number
  amount_paid: number
  priority: ProjectPriority
  notes: string | null
  created_at: string
  updated_at: string
  // Relaciones
  Staff?: Staff & { profile: Profile }
  client?: (Client & { profile?: Profile | null }) | null
}

export interface ProjectWithRelations extends Omit<Project, 'staff' | 'client'> {
  staff: Staff & { profile: Profile }
  client: (Client & { profile?: Profile | null }) | null
}

// ============================================
// Permisos por Rol
// ============================================

export const ROLE_PERMISSIONS = {
  admin: {
    canViewAllBookings: true,
    canViewFinancials: true,
    canManageUsers: true,
    canManageStaff: true,
    canViewAnalytics: true,
    canConfigurePricing: true,
    canViewAllCases: true,
  },
  super_admin: {
    canViewAllBookings: true,
    canViewFinancials: true,
    canManageUsers: true,
    canManageStaff: true,
    canViewAnalytics: true,
    canConfigurePricing: true,
    canViewAllCases: true,
    canManagePlatform: true,
  },
  staff: {
    canViewAllBookings: false,
    canViewFinancials: false,
    canManageUsers: false,
    canManageStaff: false,
    canViewAnalytics: false,
    canConfigurePricing: false,
    canViewAllCases: false,
  },
  client: {
    canViewAllBookings: false,
    canViewFinancials: false,
    canManageUsers: false,
    canManageStaff: false,
    canViewAnalytics: false,
    canConfigurePricing: false,
    canViewAllCases: false,
  },
} as const

export type Permission = keyof typeof ROLE_PERMISSIONS.admin

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

// ============================================
// Database type para Supabase client
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      Staffs: {
        Row: Staff
        Insert: CreateStaffDTO
        Update: UpdateStaffDTO
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      Booking_types: {
        Row: BookingType
        Insert: Omit<BookingType, 'id' | 'created_at'>
        Update: Partial<Omit<BookingType, 'id' | 'created_at'>>
      }
      availability: {
        Row: Availability
        Insert: Omit<Availability, 'id' | 'created_at'>
        Update: Partial<Omit<Availability, 'id' | 'created_at'>>
      }
      Bookings: {
        Row: Booking
        Insert: CreateBookingDTO & { client_id: string }
        Update: UpdateBookingDTO
      }
    }
  }
}
