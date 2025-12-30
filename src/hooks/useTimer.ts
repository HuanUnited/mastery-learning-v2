import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Phase = 'discovery' | 'drilling' | 'integration'

interface TimerState {
  // Current state
  phase: Phase
  isRunning: boolean
  elapsedMs: number
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
        discovery: 10,
        drilling: 20,
        integration: 10
      },

      start: () => {
        if (timerInterval) {
          clearInterval(timerInterval)
        }

        const currentElapsed = get().elapsedMs
        const now = Date.now()

        set({
          isRunning: true,
          startTime: now - currentElapsed, // Preserve elapsed time
          capturedMinutes: null,
        })

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
        const { isRunning, stop } = get()
        if (isRunning) {
          stop()
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
      partialize: (state) => ({
        phase: state.phase,
        phaseDurations: state.phaseDurations,
        // Persist elapsedMs when stopped
        ...(state.capturedMinutes !== null && {
          elapsedMs: state.elapsedMs,
          capturedMinutes: state.capturedMinutes
        })
      }),
    }
  )
)
