import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { AttemptFormV2 } from '@/components/forms/AttemptFormV2'
import { formatDateTime, formatDuration } from '@/lib/utils'
import { Clock } from 'lucide-react'

export function MainView() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')

  const { data: recentHistory } = useQuery({
    queryKey: ['recent-problems', 10],
    queryFn: () => api.getRecentProblems(10),
  })

  return (
    <BaseView 
      title="Learning Session"
      density={density}
      maxWidth="4xl"
      actions={
        <Badge 
          variant="outline" 
          className="cursor-pointer"
          onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
        >
          {density === 'compact' ? '☰' : '⊟'}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Form (3 columns) */}
        <div className="lg:col-span-3">
          <AttemptFormV2 />
        </div>

        {/* Right: Recent History (2 columns) */}
        <div className="lg:col-span-2">
          <ViewCard title="Recent Attempts" density={density}>
            {!recentHistory || recentHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No attempts yet
              </p>
            ) : (
              <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
                {recentHistory.slice(0, 8).map((problem) => {
                  const latestAttempt = problem.attempts[0]
                  if (!latestAttempt) return null

                  return (
                    <div
                      key={problem.id}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        problem.is_solved
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className={`font-semibold line-clamp-1 ${
                          density === 'compact' ? 'text-xs' : 'text-sm'
                        }`}>
                          {problem.title}
                        </h4>
                        {problem.is_solved && (
                          <Badge className="bg-green-500 text-white shrink-0" size="sm">
                            ✓
                          </Badge>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 text-muted-foreground ${
                        density === 'compact' ? 'text-[10px]' : 'text-xs'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(latestAttempt.duration_minutes)}</span>
                        <span>•</span>
                        <span className="line-clamp-1">{problem.material_name}</span>
                      </div>

                      <p className={`text-muted-foreground mt-1 ${
                        density === 'compact' ? 'text-[10px]' : 'text-xs'
                      }`}>
                        {formatDateTime(latestAttempt.timestamp)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </ViewCard>
        </div>
      </div>
    </BaseView>
  )
}
