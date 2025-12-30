import { useState, useRef, useEffect } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Pin, PinOff } from 'lucide-react'

export function PhaseTimer() {
  const { 
    phase, 
    isRunning, 
    elapsedMs, 
    capturedMinutes, 
    phaseDurations,
    start, 
    stop, 
    reset, 
    setPhase 
  } = useTimer()
  
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const isExpanded = isPinned || isHovered
  const targetMs = phaseDurations[phase] * 60000
  const remainingMs = Math.max(0, targetMs - elapsedMs)
  const isOvertime = elapsedMs > targetMs

  // Click outside to close (only if not pinned)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isPinned && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsHovered(false)
      }
    }

    if (isExpanded && !isPinned) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, isPinned])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)
    return { minutes, seconds, milliseconds }
  }

  const elapsed = formatTime(elapsedMs)
  const remaining = formatTime(remainingMs)

  return (
    <div 
      className="relative"
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isPinned && setIsHovered(false)}
    >
      {/* Compact Display */}
      <div 
        className="flex items-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30 cursor-pointer hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
        onClick={() => setIsHovered(true)}
      >
        <div className="font-mono text-sm text-white font-semibold drop-shadow-md">
          {String(elapsed.minutes).padStart(2, '0')}:{String(elapsed.seconds).padStart(2, '0')}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white hover:bg-white/30 dark:hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            isRunning ? stop() : start()
          }}
        >
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
      </div>

      {/* Expanded Dropdown */}
      {isExpanded && (
        <Card 
          className="absolute top-full mt-2 left-0 w-80 p-4 z-50 shadow-xl bg-background border animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pin Button */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPinned(!isPinned)}
              className="h-6 w-6"
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
          </div>

          {/* Phase Selector */}
          <div className="flex gap-1 mb-4">
            {(['discovery', 'drilling', 'integration'] as const).map((p) => (
              <Button
                key={p}
                variant={phase === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase(p)}
                className="flex-1 capitalize text-xs"
              >
                {p}
              </Button>
            ))}
          </div>

          {/* Count Up Display (Primary) */}
          <div className="text-center mb-2">
            <div className={`font-mono text-5xl font-bold transition-colors ${
              isOvertime ? 'text-red-600 dark:text-red-400' : 'text-foreground'
            }`}>
              {String(elapsed.minutes).padStart(2, '0')}:
              {String(elapsed.seconds).padStart(2, '0')}.
              <span className="text-3xl">{String(elapsed.milliseconds).padStart(2, '0')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isOvertime ? 'Overtime!' : 'Elapsed Time'}
            </p>
          </div>

          {/* Count Down Display (Translucent) */}
          <div className="text-center mb-4 opacity-40">
            <div className={`font-mono text-lg transition-colors ${
              isOvertime ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {isOvertime ? '+' : '−'}
              {String(Math.abs(remaining.minutes)).padStart(2, '0')}:
              {String(remaining.seconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOvertime ? 'Over Target' : 'Remaining'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all ${
                isOvertime ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, (elapsedMs / targetMs) * 100)}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-4">
            {!isRunning ? (
              <Button onClick={start} className="flex-1" size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={stop} variant="secondary" className="flex-1" size="lg">
                <Pause className="h-5 w-5 mr-2" />
                Stop
              </Button>
            )}
            <Button onClick={reset} variant="outline" size="lg">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* Captured Time Display */}
          {capturedMinutes !== null && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center border border-green-500/20">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                ✓ Captured: {capturedMinutes} min
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Will auto-fill form
              </p>
            </div>
          )}

          {/* Phase Info */}
          <div className="mt-3 pt-3 border-t text-center text-xs text-muted-foreground">
            <p className="font-semibold capitalize mb-1">{phase} Phase</p>
            <p>Target: {phaseDurations[phase]} minutes</p>
          </div>
        </Card>
      )}
    </div>
  )
}
