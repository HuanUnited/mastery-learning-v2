import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AnalyticsView() {
  const { data: problems } = useQuery({
    queryKey: ['recent-problems-analytics'],
    queryFn: () => api.getRecentProblems(100),
  })

  const { data: materialStats } = useQuery({
    queryKey: ['material-stats'],
    queryFn: () => api.getAllMaterialStats(),
  })

  if (!problems || !materialStats) {
    return <div className="p-8">Loading analytics...</div>
  }

  // Calculate insights
  const totalAttempts = problems.reduce((sum, p) => sum + p.attempts.length, 0)
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
    ? (recentAttempts.filter(a => a.successful).length / recentAttempts.length) * 100
    : 0

  // Problems by mastery stage
  const attemptCounts = problems.map(p => ({
    title: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
    attempts: p.attempts.length,
    successes: p.attempts.filter(a => a.successful).length,
    solved: p.is_solved,
  })).sort((a, b) => b.attempts - a.attempts)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold">Advanced Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-3xl font-bold">{totalProblems}</div>
          <div className="text-sm text-muted-foreground">Problems Tracked</div>
        </Card>

        <Card className="p-4">
          <div className="text-3xl font-bold text-green-600">{solvedProblems}</div>
          <div className="text-sm text-muted-foreground">Mastered</div>
          <div className="text-xs text-muted-foreground mt-1">
            ({totalProblems > 0 ? ((solvedProblems / totalProblems) * 100).toFixed(0) : 0}%)
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-3xl font-bold">{avgAttemptsToSolve.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Avg to Master</div>
        </Card>

        <Card className="p-4">
          <div className="text-3xl font-bold">{recentSuccessRate.toFixed(0)}%</div>
          <div className="text-sm text-muted-foreground">Recent Success</div>
          <div className="text-xs text-muted-foreground mt-1">(Last 20 attempts)</div>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Difficulty Distribution</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((rating) => {
            const count = difficultyDist[rating] || 0
            const total = Object.values(difficultyDist).reduce((a, b) => a + b, 0)
            const percentage = total > 0 ? (count / total) * 100 : 0

            return (
              <div key={rating}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{'⭐'.repeat(rating)}</span>
                  <span className="font-semibold">{count} attempts ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Status Tags */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Learning Phases</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusDist)
            .sort(([, a], [, b]) => b - a)
            .map(([tag, count]) => (
              <Badge key={tag} variant="secondary" className="text-sm py-2 px-4">
                {tag}: {count}
              </Badge>
            ))}
        </div>
      </Card>

      {/* Problems by Attempt Count */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Problems by Mastery Stage</h3>
        <div className="space-y-2">
          {attemptCounts.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-8 text-sm text-muted-foreground">#{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">{item.title}</span>
                  {item.solved && <Badge className="bg-green-500 text-xs">✓</Badge>}
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(item.successes / item.attempts) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm font-mono text-muted-foreground shrink-0">
                {item.successes}/{item.attempts}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Material Comparison */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Material Performance</h3>
        <div className="space-y-3">
          {materialStats
            .sort((a, b) => b.success_rate - a.success_rate)
            .map((material) => (
              <div key={material.material_id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{material.material_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {material.success_rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{ width: `${material.success_rate}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {material.solved_problems}/{material.total_problems}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
