import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { formatPercentage, formatDuration, formatDate } from '@/lib/utils'
import { TrendingUp, Target, Clock, Brain } from 'lucide-react'

export function InsightsView() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')

  const { data: problems } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  })

  const { data: materialStats } = useQuery({
    queryKey: ['material-stats'],
    queryFn: () => api.getAllMaterialStats(),
  })

  const { data: reviewData } = useQuery({
    queryKey: ['review-data'],
    queryFn: () => api.getReviewData(),
  })

  if (!problems || !materialStats) {
    return (
      <BaseView title="Insights" density={density} maxWidth="6xl">
        <p className="text-muted-foreground">Loading...</p>
      </BaseView>
    )
  }

  // Calculate metrics
  const totalProblems = problems.length
  const solvedProblems = problems.filter(p => p.is_solved).length
  const masteryRate = totalProblems > 0 ? solvedProblems / totalProblems : 0
  
  const avgAttemptsToSolve = solvedProblems > 0
    ? problems
        .filter(p => p.is_solved)
        .reduce((sum, p) => sum + p.attempts.length, 0) / solvedProblems
    : 0

  const recentAttempts = problems
    .flatMap(p => p.attempts)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
  
  const recentSuccessRate = recentAttempts.length > 0
    ? (recentAttempts.filter(a => a.successful).length / recentAttempts.length)
    : 0

  const difficultyDist = problems
    .flatMap(p => p.attempts)
    .filter(a => a.difficulty_rating)
    .reduce((acc, a) => {
      const rating = a.difficulty_rating!
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {} as Record<number, number>)

  const statusDist = problems
    .flatMap(p => p.attempts)
    .filter(a => a.status_tag)
    .reduce((acc, a) => {
      const tag = a.status_tag!
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const attemptCounts = problems
    .map(p => ({
      title: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
      attempts: p.attempts.length,
      successes: p.attempts.filter(a => a.successful).length,
      solved: p.is_solved,
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 10)

  return (
    <BaseView 
      title="Insights Dashboard"
      density={density}
      maxWidth="6xl"
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
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ViewCard density={density} className="text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{totalProblems}</div>
          <div className="text-xs text-muted-foreground">Total Problems</div>
        </ViewCard>

        <ViewCard density={density} className="text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{solvedProblems}</div>
          <div className="text-xs text-muted-foreground">Mastered ({formatPercentage(masteryRate, 0)})</div>
        </ViewCard>

        <ViewCard density={density} className="text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold">{avgAttemptsToSolve.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg to Master</div>
        </ViewCard>

        <ViewCard density={density} className="text-center">
          <Brain className="h-5 w-5 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold">{formatPercentage(recentSuccessRate, 0)}</div>
          <div className="text-xs text-muted-foreground">Recent Success</div>
        </ViewCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Material Performance */}
        <ViewCard title="Material Performance" density={density}>
          <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
            {materialStats.slice(0, 8).map((material) => (
              <div key={material.material_id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium truncate ${
                      density === 'compact' ? 'text-xs' : 'text-sm'
                    }`}>
                      {material.material_name}
                    </span>
                    <span className={`text-muted-foreground shrink-0 ml-2 ${
                      density === 'compact' ? 'text-[10px]' : 'text-xs'
                    }`}>
                      {formatPercentage(material.success_rate / 100, 0)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                      style={{ width: `${material.success_rate}%` }}
                    />
                  </div>
                </div>
                <div className={`text-muted-foreground shrink-0 ${
                  density === 'compact' ? 'text-[10px]' : 'text-xs'
                }`}>
                  {material.solved_problems}/{material.total_problems}
                </div>
              </div>
            ))}
          </div>
        </ViewCard>

        {/* Difficulty Distribution */}
        <ViewCard title="Difficulty Distribution" density={density}>
          <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
            {[1, 2, 3, 4, 5].map((rating) => {
              const count = difficultyDist[rating] || 0
              const total = Object.values(difficultyDist).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={rating}>
                  <div className={`flex items-center justify-between mb-1 ${
                    density === 'compact' ? 'text-xs' : 'text-sm'
                  }`}>
                    <span>{'⭐'.repeat(rating)}</span>
                    <span className="font-semibold">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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

        {/* Learning Phases */}
        <ViewCard title="Learning Phases" density={density}>
          <div className="flex flex-wrap gap-1.5">
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

        {/* Top Focus Problems */}
        <ViewCard title="Problems by Mastery Stage" density={density}>
          <div className={density === 'compact' ? 'space-y-1.5' : 'space-y-2'}>
            {attemptCounts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`text-muted-foreground shrink-0 ${
                  density === 'compact' ? 'w-5 text-[10px]' : 'w-6 text-xs'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`truncate ${
                      density === 'compact' ? 'text-xs' : 'text-sm'
                    }`}>
                      {item.title}
                    </span>
                    {item.solved && (
                      <Badge className={`bg-green-500 text-white shrink-0 ${
                        density === 'compact' ? 'text-[9px] px-1 py-0' : 'text-xs'
                      }`}>
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(item.successes / item.attempts) * 100}%` }}
                    />
                  </div>
                </div>
                <div className={`font-mono text-muted-foreground shrink-0 ${
                  density === 'compact' ? 'text-[10px]' : 'text-sm'
                }`}>
                  {item.successes}/{item.attempts}
                </div>
              </div>
            ))}
          </div>
        </ViewCard>
      </div>

      {/* Review Schedule */}
      {reviewData && reviewData.length > 0 && (
        <ViewCard title="Review Schedule" density={density}>
          <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
            {reviewData.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${
                    density === 'compact' ? 'text-xs' : 'text-sm'
                  }`}>
                    {item.title}
                  </div>
                  <div className={`text-muted-foreground ${
                    density === 'compact' ? 'text-[10px]' : 'text-xs'
                  }`}>
                    {item.material_name}
                  </div>
                </div>
                <div className={`text-right shrink-0 ml-3 ${
                  density === 'compact' ? 'text-[10px]' : 'text-xs'
                }`}>
                  <div className="font-semibold">
                    {formatDate(item.next_review_date)}
                  </div>
                  <div className="text-muted-foreground">
                    {item.review_count} reviews
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ViewCard>
      )}
    </BaseView>
  )
}
