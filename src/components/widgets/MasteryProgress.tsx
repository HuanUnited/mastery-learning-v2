import { Badge } from '@/components/ui/badge'

interface MasteryProgressProps {
  consecutiveSuccesses: number
  isSolved: boolean
}

export function MasteryProgress({ consecutiveSuccesses, isSolved }: MasteryProgressProps) {
  const target = 5
  const percentage = Math.min(100, (consecutiveSuccesses / target) * 100)

  if (isSolved) {
    return (
      <Badge className="bg-green-500">
        🎉 Mastered ({consecutiveSuccesses} consecutive)
      </Badge>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <div className="flex gap-0.5">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-6 rounded-sm ${
              i < consecutiveSuccesses ? 'bg-green-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {consecutiveSuccesses}/{target} to master
      </span>
    </div>
  )
}
