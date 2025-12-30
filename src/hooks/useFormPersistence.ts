import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FormState {
  subjectName: string
  materialNameEn: string
  materialNameRu: string
  problemTitle: string

  setContext: (context: Partial<FormState>) => void
  reset: () => void
}

export const useFormPersistence = create<FormState>()(
  persist(
    (set) => ({
      subjectName: '',
      materialNameEn: '',
      materialNameRu: '',
      problemTitle: '',

      setContext: (context) => set((state) => ({ ...state, ...context })),

      reset: () => set({
        subjectName: '',
        materialNameEn: '',
        materialNameRu: '',
        problemTitle: '',
      }),
    }),
    {
      name: 'mastery-form-persistence',
    }
  )
)
