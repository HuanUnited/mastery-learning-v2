import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { exportAllData } from '@/lib/export'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { formatPercentage, formatDuration } from '@/lib/utils'
import { useState } from 'react'

export function StatsView() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['material-stats'],
    queryFn: () => api.getAllMaterialStats(),
  })

  const handleExport = async () => {
    const success = await exportAllData()
    if (success) {
      alert('Data exported successfully!')
    } else {
      alert('Export failed. Check console for errors.')
    }
  }

  if (isLoading) {
    return (
      <BaseView title="Progress Dashboard" density={density}>
        <p className="text-muted-foreground">Loading stats...</p>
      </BaseView>
    )
  }

  if (!stats || stats.length === 0) {
    return (
      <BaseView title="Progress Dashboard" density={density}>
        <div className="text-center text-muted-foreground py-12">
          No materials tracked yet. Start logging attempts!
        </div>
      </BaseView>
    )
  }

  const totalProblems = stats.reduce((sum, s) => sum + s.total_problems, 0)
  const solvedProblems = stats.reduce((sum, s) => sum + s.solved_problems, 0)
  const totalAttempts = stats.reduce((sum, s) => sum + s.total_attempts, 0)
  const totalTimeMinutes = stats.reduce((sum, s) => sum + s.total_time_minutes, 0)

  return (
    <BaseView 
      title="Progress Dashboard"
      density={density}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Badge 
            variant="outline" 
            className="cursor-pointer"
            onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
          >
            {density === 'compact' ? '☰ Compact' : '⊟ Comfortable'}
          </Badge>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${density === 'compact' ? 'gap-2' : 'gap-3'}`}>
        <ViewCard density={density}>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {totalProblems}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Total Problems
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`font-bold text-green-600 ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {solvedProblems}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Solved Problems
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {totalAttempts}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Total Attempts
          </div>
        </ViewCard>

        <ViewCard density={density}>
          <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
            {formatDuration(totalTimeMinutes)}
          </div>
          <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-sm'}`}>
            Total Time
          </div>
        </ViewCard>
      </div>

      {/* Material Breakdown */}
      <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
        <h3 className={`font-semibold ${density === 'compact' ? 'text-base' : 'text-xl'}`}>
          Materials
        </h3>

        {stats.map((material) => {
          const isMastered = material.solved_problems === material.total_problems && material.total_problems > 0
          const timePerProblem = material.total_problems > 0 
            ? material.total_time_minutes / material.total_problems 
            : 0
          
          return (
            <ViewCard
              key={material.material_id}
              density={density}
              className={isMastered ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' : ''}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold truncate ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                    {material.material_name}
                  </h4>
                  <p className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                    {material.subject_name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <Badge variant="outline" className={density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
                    {material.solved_problems}/{material.total_problems} solved
                  </Badge>
                  {isMastered && (
                    <Badge className={`bg-yellow-500 text-white ${density === 'compact' ? 'text-[10px] px-1.5 py-0' : ''}`}>
                      🏆 Mastery
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className={density === 'compact' ? 'mb-2' : 'mb-3'}>
                <div className={`flex justify-between mb-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">{formatPercentage(material.success_rate / 100)}</span>
                </div>
                <div className={`bg-muted rounded-full overflow-hidden ${density === 'compact' ? 'h-1.5' : 'h-2'}`}>
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${material.success_rate}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className={`grid grid-cols-2 md:grid-cols-4 ${density === 'compact' ? 'gap-2 text-[10px]' : 'gap-3 text-xs'}`}>
                <div>
                  <div className="text-muted-foreground">Attempts</div>
                  <div className={`font-semibold ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                    {material.successful_attempts}/{material.total_attempts}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Avg per Problem</div>
                  <div className={`font-semibold ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                    {material.avg_attempts_per_problem.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Total Time</div>
                  <div className={`font-semibold ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                    {formatDuration(material.total_time_minutes)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Time/Problem</div>
                  <div className={`font-semibold ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                    {formatDuration(timePerProblem)}
                  </div>
                </div>
              </div>
            </ViewCard>
          )
        })}
      </div>
    </BaseView>
  )
}
