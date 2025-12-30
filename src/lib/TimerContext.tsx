import { createContext, useContext, useState, useEffect, useRef } from 'react'

interface TimerContextType {
  // State
  phase: 'discovery' | 'drilling' | 'integration'
  isRunning: boolean
  elapsedMs: number
  capturedMinutes: number | null
  
  // Actions
  start: () => void
  stop: () => void
  reset: () => void
  setPhase: (phase: 'discovery' | 'drilling' | 'integration') => void
}

const TimerContext = createContext<TimerContextType | null>(null)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'discovery' | 'drilling' | 'integration'>('discovery')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [capturedMinutes, setCapturedMinutes] = useState<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedMs
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          setElapsedMs(Date.now() - startTimeRef.current)
        }
      }, 10) // Update every 10ms for smooth display
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, elapsedMs])

  const start = () => setIsRunning(true)
  
  const stop = () => {
    setIsRunning(false)
    const minutes = Math.round((elapsedMs / 60000) * 10) / 10 // Round to 1 decimal
    setCapturedMinutes(minutes)
  }
  
  const reset = () => {
    setIsRunning(false)
    setElapsedMs(0)
    setCapturedMinutes(null)
  }

  const handleSetPhase = (newPhase: typeof phase) => {
    setPhase(newPhase)
    reset()
  }

  return (
    <TimerContext.Provider
      value={{
        phase,
        isRunning,
        elapsedMs,
        capturedMinutes,
        start,
        stop,
        reset,
        setPhase: handleSetPhase,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider')
  }
  return context
}
