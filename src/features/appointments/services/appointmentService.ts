import { createClient } from '@/lib/supabase/client'
import type { BookingWithRelations } from '@/types/database'

export const BookingService = {
  async getByClient(clientId: string): Promise<BookingWithRelations[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('Bookings')
      .select(`
        *,
        client:clients(*, profile:profiles(*)),
        Staff:Staffs(*, profile:profiles(*)),
        Booking_type:Booking_types(*)
      `)
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data as BookingWithRelations[]
  },

  async getByStaff(StaffId: string): Promise<BookingWithRelations[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('Bookings')
      .select(`
        *,
        client:clients(*, profile:profiles(*)),
        Staff:Staffs(*, profile:profiles(*)),
        Booking_type:Booking_types(*)
      `)
      .eq('Staff_id', StaffId)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data as BookingWithRelations[]
  },

  async getById(id: string): Promise<BookingWithRelations | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('Bookings')
      .select(`
        *,
        client:clients(*, profile:profiles(*)),
        Staff:Staffs(*, profile:profiles(*)),
        Booking_type:Booking_types(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data as BookingWithRelations
  },

  async getBookingTypes() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('Booking_types')
      .select('*')
      .eq('is_active', true)
      .order('price')

    if (error) throw error
    return data
  }
}
