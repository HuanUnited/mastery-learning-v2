import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Phase = 'discovery' | 'drilling' | 'integration'

interface TimerState {
  // Current state
  phase: Phase
  isRunning: boolean
  elapsedMs: number // Changed to milliseconds
  startTime: number | null

  // Captured time (when user stops timer)
  capturedMinutes: number | null

  // Phase durations (in minutes)
  phaseDurations: {
    discovery: number
    drilling: number
    integration: number
  }

  // Actions
  start: () => void
  stop: () => void
  reset: () => void
  setPhase: (phase: Phase) => void
  setPhaseDuration: (phase: Phase, minutes: number) => void
}

let timerInterval: NodeJS.Timeout | null = null

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      phase: 'discovery',
      isRunning: false,
      elapsedMs: 0,
      startTime: null,
      capturedMinutes: null,
      phaseDurations: {
        discovery: 10,  // 10 min
        drilling: 20,   // 20 min
        integration: 10 // 10 min
      },

      start: () => {
        // Clear any existing interval
        if (timerInterval) {
          clearInterval(timerInterval)
        }

        set({
          isRunning: true,
          startTime: Date.now(),
          capturedMinutes: null,
        })

        // Update elapsed time every 10ms for smooth display
        timerInterval = setInterval(() => {
          const state = get()
          if (!state.isRunning || !state.startTime) {
            if (timerInterval) {
              clearInterval(timerInterval)
              timerInterval = null
            }
            return
          }

          const elapsed = Date.now() - state.startTime
          set({ elapsedMs: elapsed })
        }, 10)
      },

      stop: () => {
        if (timerInterval) {
          clearInterval(timerInterval)
          timerInterval = null
        }

        const { elapsedMs } = get()
        const minutes = parseFloat((elapsedMs / 60000).toFixed(1))
        set({
          isRunning: false,
          capturedMinutes: minutes,
        })
      },

      reset: () => {
        if (timerInterval) {
          clearInterval(timerInterval)
          timerInterval = null
        }

        set({
          elapsedMs: 0,
          startTime: null,
          capturedMinutes: null,
          isRunning: false,
        })
      },

      setPhase: (phase) => {
        const { isRunning } = get()
        if (isRunning) {
          // Auto-stop when switching phases
          get().stop()
        }

        set({
          phase,
          elapsedMs: 0,
          startTime: null,
          capturedMinutes: null
        })
      },

      setPhaseDuration: (phase, minutes) => {
        set((state) => ({
          phaseDurations: {
            ...state.phaseDurations,
            [phase]: minutes,
          },
        }))
      },
    }),
    {
      name: 'mastery-timer',
      // Don't persist running state or elapsed time
      partialize: (state) => ({
        phase: state.phase,
        phaseDurations: state.phaseDurations,
      }),
    }
  )
)
