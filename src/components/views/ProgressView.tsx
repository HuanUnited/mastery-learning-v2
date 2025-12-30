import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react'
import { formatDuration, formatPercentage } from '@/lib/utils'

export function ProgressView() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['material-stats'],
    queryFn: api.getAllMaterialStats,
  })

  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  })

  const isLoading = statsLoading || problemsLoading

  // Calculate learning velocity per material
  const velocityData = stats?.map((material) => {
    const materialProblems = problems?.filter(
      (p) => p.material_name === material.material_name
    ) || []

    const batchStats: Record<number, { total: number; successful: number }> = {}
    
    materialProblems.forEach((problem) => {
      problem.attempts.forEach((attempt) => {
        if (!batchStats[attempt.batch_number]) {
          batchStats[attempt.batch_number] = { total: 0, successful: 0 }
        }
        batchStats[attempt.batch_number].total++
        if (attempt.successful) batchStats[attempt.batch_number].successful++
      })
    })

    const batches = Object.entries(batchStats).map(([num, data]) => ({
      batch: Number(num),
      successRate: (data.successful / data.total) * 100,
      attempts: data.total,
    }))

    return {
      material: material.material_name,
      subject: material.subject_name,
      batches: batches.sort((a, b) => a.batch - b.batch),
      avgAttempts: material.avg_attempts_per_problem,
      totalTime: material.total_time_minutes,
    }
  }) || []

  // Difficulty hotspots
  const hotspots = stats
    ?.filter((m) => m.avg_attempts_per_problem > 3)
    .sort((a, b) => b.avg_attempts_per_problem - a.avg_attempts_per_problem) || []

  // Time efficiency trends
  const timeEfficiency = problems
    ?.filter((p) => p.is_solved)
    .map((p) => ({
      title: p.title,
      totalAttempts: p.attempts.length,
      totalTime: p.attempts.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0),
      avgTimePerAttempt: p.attempts.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0) / p.attempts.length,
    }))
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 10) || []

  const masteredCount = stats?.filter((m) => m.success_rate >= 80).length || 0
  const avgSuccess = stats?.length
    ? stats.reduce((sum, m) => sum + m.success_rate, 0) / stats.length
    : 0
  const totalTimeMinutes = stats?.reduce((sum, m) => sum + m.total_time_minutes, 0) || 0

  if (isLoading) {
    return (
      <BaseView title="Learning Progress" density={density}>
        <p className="text-muted-foreground">Loading progress data...</p>
      </BaseView>
    )
  }

  return (
    <BaseView 
      title="Learning Progress"
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
      {/* Summary Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${density === 'compact' ? 'gap-2' : 'gap-3'}`}>
        <ViewCard density={density}>
          <div className={`flex items-center gap-2 mb-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            <Target className={`text-green-500 ${density === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className="text-muted-foreground">Mastered</span>
          </div>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {masteredCount}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            materials
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`flex items-center gap-2 mb-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            <TrendingUp className={`text-blue-500 ${density === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className="text-muted-foreground">Avg Success</span>
          </div>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {formatPercentage(avgSuccess / 100, 0)}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            across all materials
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`flex items-center gap-2 mb-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            <Clock className={`text-orange-500 ${density === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className="text-muted-foreground">Total Time</span>
          </div>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {formatDuration(totalTimeMinutes)}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            invested
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`flex items-center gap-2 mb-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            <TrendingDown className={`text-red-500 ${density === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className="text-muted-foreground">Hotspots</span>
          </div>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {hotspots.length}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            need focus
          </div>
        </ViewCard>
      </div>

      {/* Learning Velocity */}
      <ViewCard 
        title="Learning Velocity"
        density={density}
      >
        <p className={`text-muted-foreground mb-3 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
          Success rate improvement across batches
        </p>

        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          {velocityData.slice(0, 8).map((data) => (
            <div key={data.material} className={density === 'compact' ? 'space-y-1' : 'space-y-1.5'}>
              <div className={`flex items-center justify-between ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                <span className="font-medium truncate">{data.material}</span>
                <span className={`text-muted-foreground shrink-0 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                  {data.batches.length} batches
                </span>
              </div>

              <div className={`flex items-center gap-1 ${density === 'compact' ? 'h-4' : 'h-6'}`}>
                {data.batches.map((batch, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded overflow-hidden relative group"
                    style={{
                      background: `hsl(${batch.successRate * 1.2}, 70%, 50%)`,
                      opacity: 0.3 + batch.successRate / 150,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {batch.successRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`flex justify-between text-muted-foreground ${density === 'compact' ? 'text-[9px]' : 'text-[10px]'}`}>
                <span>Batch 1</span>
                <span>Latest</span>
              </div>
            </div>
          ))}
        </div>
      </ViewCard>

      {/* Difficulty Hotspots */}
      <ViewCard 
        title="Difficulty Hotspots"
        density={density}
      >
        <p className={`text-muted-foreground mb-2 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
          Materials requiring &gt;3 attempts on average
        </p>

        <div className={density === 'compact' ? 'space-y-1.5' : 'space-y-2'}>
          {hotspots.slice(0, 8).map((material) => (
            <div 
              key={material.material_id} 
              className={`flex items-center gap-2 bg-red-50 dark:bg-red-900/10 rounded ${density === 'compact' ? 'p-1.5' : 'p-2'}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                  {material.material_name}
                </p>
                <p className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                  {material.subject_name}
                </p>
              </div>
              <Badge 
                variant="destructive" 
                className={`shrink-0 ${density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}`}
              >
                {material.avg_attempts_per_problem.toFixed(1)} avg
              </Badge>
            </div>
          ))}
        </div>
      </ViewCard>

      {/* Time Efficiency */}
      <ViewCard 
        title="Time Investment"
        density={density}
      >
        <p className={`text-muted-foreground mb-2 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
          Problems with highest time investment
        </p>

        <div className={density === 'compact' ? 'space-y-1.5' : 'space-y-2'}>
          {timeEfficiency.map((prob, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`text-muted-foreground ${density === 'compact' ? 'w-4 text-[10px]' : 'w-5 text-xs'}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                  {prob.title}
                </p>
                <div className={`flex items-center gap-2 text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                  <span>{prob.totalAttempts} attempts</span>
                  <span>•</span>
                  <span>{formatDuration(prob.avgTimePerAttempt)}/attempt</span>
                </div>
              </div>
              <span className={`font-bold shrink-0 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                {formatDuration(prob.totalTime)}
              </span>
            </div>
          ))}
        </div>
      </ViewCard>
    </BaseView>
  )
}
