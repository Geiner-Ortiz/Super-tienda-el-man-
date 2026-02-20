import { create } from 'zustand'

interface BookingState {
  // Paso 1: Selección
  StaffId: string | null
  BookingTypeId: string | null

  // Paso 2: Fecha y hora
  selectedDate: Date | null
  selectedTime: string | null

  // Paso 3: Notas
  clientNotes: string

  // Navegación
  currentStep: 1 | 2 | 3

  // Acciones
  setStaff: (id: string) => void
  setBookingType: (id: string) => void
  setDate: (date: Date) => void
  setTime: (time: string) => void
  setNotes: (notes: string) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: 1 | 2 | 3) => void
  reset: () => void

  // Validación
  canProceedToStep2: () => boolean
  canProceedToStep3: () => boolean
  canSubmit: () => boolean
}

const initialState = {
  StaffId: null,
  BookingTypeId: null,
  selectedDate: null,
  selectedTime: null,
  clientNotes: '',
  currentStep: 1 as const
}

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  setStaff: (id) => set({ StaffId: id }),
  setBookingType: (id) => set({ BookingTypeId: id }),
  setDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setTime: (time) => set({ selectedTime: time }),
  setNotes: (notes) => set({ clientNotes: notes }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 3) {
      set({ currentStep: (currentStep + 1) as 1 | 2 | 3 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as 1 | 2 | 3 })
    }
  },

  goToStep: (step) => set({ currentStep: step }),

  reset: () => set(initialState),

  canProceedToStep2: () => {
    const { StaffId, BookingTypeId } = get()
    return StaffId !== null && BookingTypeId !== null
  },

  canProceedToStep3: () => {
    const { selectedDate, selectedTime } = get()
    return selectedDate !== null && selectedTime !== null
  },

  canSubmit: () => {
    const state = get()
    return (
      state.StaffId !== null &&
      state.BookingTypeId !== null &&
      state.selectedDate !== null &&
      state.selectedTime !== null
    )
  }
}))
