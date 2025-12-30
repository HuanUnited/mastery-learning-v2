import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { exportAllData } from '@/lib/export'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function StatsView() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['material-stats'],
    queryFn: () => api.getAllMaterialStats(),
  })

  if (isLoading) {
    return <div className="p-8">Loading stats...</div>
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No materials tracked yet. Start logging attempts!
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Progress Dashboard</h2>
        <Button
          variant="outline"
          onClick={async () => {
            const success = await exportAllData()
            if (success) {
              alert('Data exported successfully!')
            } else {
              alert('Export failed. Check console for errors.')
            }
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export All Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {stats.reduce((sum, s) => sum + s.total_problems, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Problems</div>
        </Card>

        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.reduce((sum, s) => sum + s.solved_problems, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Solved Problems</div>
        </Card>

        <Card className="p-4">
          <div className="text-2xl font-bold">
            {stats.reduce((sum, s) => sum + s.total_attempts, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Attempts</div>
        </Card>

        <Card className="p-4">
          <div className="text-2xl font-bold">
            {(stats.reduce((sum, s) => sum + s.total_time_minutes, 0) / 60).toFixed(1)}h
          </div>
          <div className="text-sm text-muted-foreground">Total Time</div>
        </Card>
      </div>

      {/* Material Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Materials</h3>

        {stats.map((material) => {
          const isMastered = material.solved_problems === material.total_problems && material.total_problems > 0
          
          return (
            <Card 
              key={material.material_id} 
              className={`p-6 ${
                isMastered
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold">{material.material_name}</h4>
                  <p className="text-sm text-muted-foreground">{material.subject_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {material.solved_problems}/{material.total_problems} solved
                  </Badge>
                  {isMastered && (
                    <Badge className="bg-yellow-500">🏆 Mastery</Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Success Rate</span>
                  <span className="font-semibold">{material.success_rate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${material.success_rate}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Attempts</div>
                  <div className="font-semibold text-lg">
                    {material.successful_attempts}/{material.total_attempts}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Avg per Problem</div>
                  <div className="font-semibold text-lg">
                    {material.avg_attempts_per_problem.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Total Time</div>
                  <div className="font-semibold text-lg">
                    {material.total_time_minutes.toFixed(0)}min
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Time per Problem</div>
                  <div className="font-semibold text-lg">
                    {material.total_problems > 0
                      ? (material.total_time_minutes / material.total_problems).toFixed(0)
                      : 0}min
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
