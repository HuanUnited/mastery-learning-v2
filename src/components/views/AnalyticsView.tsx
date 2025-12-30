import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { formatPercentage } from '@/lib/utils'

export function AnalyticsView() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  })

  const { data: materialStats, isLoading: statsLoading } = useQuery({
    queryKey: ['material-stats'],
    queryFn: () => api.getAllMaterialStats(),
  })

  const isLoading = problemsLoading || statsLoading

  if (isLoading) {
    return (
      <BaseView title="Advanced Analytics" density={density}>
        <p className="text-muted-foreground">Loading analytics...</p>
      </BaseView>
    )
  }

  if (!problems || !materialStats) {
    return (
      <BaseView title="Advanced Analytics" density={density}>
        <div className="text-center text-muted-foreground py-12">
          No data available yet. Start logging attempts!
        </div>
      </BaseView>
    )
  }

  // Calculate insights
  const totalProblems = problems.length
  const solvedProblems = problems.filter(p => p.is_solved).length
  const avgAttemptsToSolve = solvedProblems > 0
    ? problems
        .filter(p => p.is_solved)
        .reduce((sum, p) => sum + p.attempts.length, 0) / solvedProblems
    : 0

  // Difficulty distribution
  const difficultyDist = problems
    .flatMap(p => p.attempts)
    .filter(a => a.difficulty_rating)
    .reduce((acc, a) => {
      const rating = a.difficulty_rating!
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {} as Record<number, number>)

  // Status tag distribution
  const statusDist = problems
    .flatMap(p => p.attempts)
    .filter(a => a.status_tag)
    .reduce((acc, a) => {
      const tag = a.status_tag!
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Recent success trend (last 20 attempts)
  const recentAttempts = problems
    .flatMap(p => p.attempts)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
  
  const recentSuccessRate = recentAttempts.length > 0
    ? (recentAttempts.filter(a => a.successful).length / recentAttempts.length)
    : 0

  // Problems by mastery stage
  const attemptCounts = problems.map(p => ({
    title: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
    attempts: p.attempts.length,
    successes: p.attempts.filter(a => a.successful).length,
    solved: p.is_solved,
  })).sort((a, b) => b.attempts - a.attempts)

  const masteryRate = totalProblems > 0 ? solvedProblems / totalProblems : 0

  return (
    <BaseView 
      title="Advanced Analytics"
      density={density}
      actions={
        <Badge 
          variant="outline" 
          className="cursor-pointer"
          onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
        >
          {density === 'compact' ? '☰ Compact' : '⊟ Comfortable'}
        </Badge>
      }
    >
      {/* Key Metrics */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${density === 'compact' ? 'gap-2' : 'gap-3'}`}>
        <ViewCard density={density}>
          <div className={`font-bold ${density === 'compact' ? 'text-2xl' : 'text-3xl'}`}>
            {totalProblems}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Problems Tracked
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`font-bold text-green-600 ${density === 'compact' ? 'text-2xl' : 'text-3xl'}`}>
            {solvedProblems}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Mastered
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[9px] mt-0.5' : 'text-xs mt-1'}`}>
            ({formatPercentage(masteryRate, 0)})
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`font-bold ${density === 'compact' ? 'text-2xl' : 'text-3xl'}`}>
            {avgAttemptsToSolve.toFixed(1)}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Avg to Master
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`font-bold ${density === 'compact' ? 'text-2xl' : 'text-3xl'}`}>
            {formatPercentage(recentSuccessRate, 0)}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Recent Success
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[9px] mt-0.5' : 'text-xs mt-1'}`}>
            (Last 20 attempts)
          </div>
        </ViewCard>
      </div>

      {/* Difficulty Distribution */}
      <ViewCard title="Difficulty Distribution" density={density}>
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          {[1, 2, 3, 4, 5].map((rating) => {
            const count = difficultyDist[rating] || 0
            const total = Object.values(difficultyDist).reduce((a, b) => a + b, 0)
            const percentage = total > 0 ? (count / total) * 100 : 0

            return (
              <div key={rating}>
                <div className={`flex items-center justify-between mb-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                  <span>{'⭐'.repeat(rating)}</span>
                  <span className="font-semibold">
                    {count} attempts ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className={`bg-muted rounded-full overflow-hidden ${density === 'compact' ? 'h-1.5' : 'h-2'}`}>
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </ViewCard>

      {/* Status Tags */}
      <ViewCard title="Learning Phases" density={density}>
        <div className={`flex flex-wrap ${density === 'compact' ? 'gap-1.5' : 'gap-2'}`}>
          {Object.entries(statusDist)
            .sort(([, a], [, b]) => b - a)
            .map(([tag, count]) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={density === 'compact' ? 'text-[10px] px-2 py-1' : 'text-sm py-2 px-4'}
              >
                {tag}: {count}
              </Badge>
            ))}
        </div>
      </ViewCard>

      {/* Problems by Attempt Count */}
      <ViewCard title="Problems by Mastery Stage" density={density}>
        <div className={density === 'compact' ? 'space-y-1.5' : 'space-y-2'}>
          {attemptCounts.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`text-muted-foreground ${density === 'compact' ? 'w-6 text-[10px]' : 'w-8 text-sm'}`}>
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`truncate ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                    {item.title}
                  </span>
                  {item.solved && (
                    <Badge className={`bg-green-500 text-white ${density === 'compact' ? 'text-[9px] px-1 py-0' : 'text-xs'}`}>
                      ✓
                    </Badge>
                  )}
                </div>
                <div className={`bg-muted rounded-full overflow-hidden ${density === 'compact' ? 'h-1.5 mt-0.5' : 'h-2 mt-1'}`}>
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(item.successes / item.attempts) * 100}%` }}
                  />
                </div>
              </div>
              <div className={`font-mono text-muted-foreground shrink-0 ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
                {item.successes}/{item.attempts}
              </div>
            </div>
          ))}
        </div>
      </ViewCard>

      {/* Material Comparison */}
      <ViewCard title="Material Performance" density={density}>
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          {materialStats
            .sort((a, b) => b.success_rate - a.success_rate)
            .map((material) => (
              <div key={material.material_id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center justify-between mb-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                    <span className="font-medium truncate">{material.material_name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {formatPercentage(material.success_rate / 100, 0)}
                    </span>
                  </div>
                  <div className={`bg-muted rounded-full overflow-hidden ${density === 'compact' ? 'h-1.5' : 'h-2'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                      style={{ width: `${material.success_rate}%` }}
                    />
                  </div>
                </div>
                <div className={`text-muted-foreground shrink-0 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                  {material.solved_problems}/{material.total_problems}
                </div>
              </div>
            ))}
        </div>
      </ViewCard>
    </BaseView>
  )
}
