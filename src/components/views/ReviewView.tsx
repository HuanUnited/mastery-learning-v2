import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, TrendingUp, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ProblemDetail, AttemptView } from '@/lib/types'

type ErrorGroup = Record<string, Array<{ problem: ProblemDetail; attempt: AttemptView }>>
type MaterialGroup = Record<string, ProblemDetail[]>

export function ReviewView() {
  const [days, setDays] = useState(7)
  const [successFilter, setSuccessFilter] = useState('failed')
  const [searchTerm, setSearchTerm] = useState('')
  const [groupBy, setGroupBy] = useState<'error' | 'material' | 'none'>('error')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const { data: problems, isLoading } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  })

  // Filter recent attempts
  const filteredProblems = problems
    ?.map((p) => ({
      ...p,
      recentAttempts: p.attempts.filter((a) => {
        const attemptDate = new Date(a.timestamp)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        return attemptDate >= cutoffDate
      }),
    }))
    .filter((p) => {
      if (p.recentAttempts.length === 0) return false
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (successFilter === 'failed') return p.recentAttempts.some((a) => !a.successful)
      if (successFilter === 'success') return p.recentAttempts.every((a) => a.successful)
      return true
    })

  // Group by error patterns
  const errorGroups: ErrorGroup = filteredProblems?.reduce((acc, problem) => {
    problem.recentAttempts
      .filter((a) => !a.successful && a.errors)
      .forEach((attempt) => {
        const errors = attempt.errors!.toLowerCase()
        let category = 'Other'
        
        if (errors.includes('syntax') || errors.includes('type')) category = 'Syntax/Type'
        else if (errors.includes('logic') || errors.includes('algorithm')) category = 'Logic'
        else if (errors.includes('off by one') || errors.includes('boundary')) category = 'Boundary'
        else if (errors.includes('time') || errors.includes('timeout')) category = 'Performance'
        else if (errors.includes('forgot') || errors.includes('missed')) category = 'Recall'
        
        if (!acc[category]) acc[category] = []
        acc[category].push({ problem, attempt })
      })
    return acc
  }, {} as ErrorGroup) ?? {}

  // Group by material
  const materialGroups: MaterialGroup = filteredProblems?.reduce((acc, problem) => {
    const key = `${problem.subject_name} - ${problem.material_name}`
    if (!acc[key]) acc[key] = []
    acc[key].push(problem)
    return acc
  }, {} as MaterialGroup) ?? {}

  if (isLoading) {
    return (
      <BaseView title="Review Queue" density={density}>
        <p className="text-muted-foreground">Loading...</p>
      </BaseView>
    )
  }

  return (
    <BaseView 
      title="Review Queue"
      subtitle={`${filteredProblems?.length || 0} problems to review`}
      density={density}
      actions={
        <div className="flex items-center gap-2">
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
      {/* Filters */}
      <ViewCard density={density}>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          
          <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7d</SelectItem>
              <SelectItem value="14">Last 14d</SelectItem>
              <SelectItem value="30">Last 30d</SelectItem>
            </SelectContent>
          </Select>

          <Select value={successFilter} onValueChange={setSuccessFilter}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All attempts</SelectItem>
              <SelectItem value="failed">Failed only</SelectItem>
              <SelectItem value="success">Success only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Group by error</SelectItem>
              <SelectItem value="material">Group by material</SelectItem>
              <SelectItem value="none">No grouping</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs h-8 text-sm"
          />
        </div>
      </ViewCard>

      {/* Grouped by Error */}
      {groupBy === 'error' && (
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          <h3 className={`font-semibold flex items-center gap-2 ${density === 'compact' ? 'text-base' : 'text-lg'}`}>
            <TrendingUp className="h-5 w-5" />
            Errors by Pattern
          </h3>

          {Object.entries(errorGroups).map(([category, items]) => (
            <ViewCard key={category} density={density}>
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold flex items-center gap-2 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {category}
                </h4>
                <Badge variant="secondary" className={density === 'compact' ? 'text-[10px]' : 'text-xs'}>
                  {items.length}
                </Badge>
              </div>

              <div className={density === 'compact' ? 'space-y-1' : 'space-y-1.5'}>
                {items.slice(0, 5).map(({ problem, attempt }, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2 p-2 bg-muted/30 rounded ${density === 'compact' ? 'text-[11px]' : 'text-xs'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{problem.title}</p>
                      <p className="text-muted-foreground line-clamp-1">{attempt.errors}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {formatDate(attempt.timestamp)}
                    </span>
                  </div>
                ))}
                {items.length > 5 && (
                  <p className={`text-muted-foreground text-center pt-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                    +{items.length - 5} more
                  </p>
                )}
              </div>
            </ViewCard>
          ))}
        </div>
      )}

      {/* Grouped by Material */}
      {groupBy === 'material' && (
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          <h3 className={`font-semibold ${density === 'compact' ? 'text-base' : 'text-lg'}`}>
            By Material
          </h3>
          {Object.entries(materialGroups).map(([material, probs]) => (
            <ViewCard key={material} title={material} badge={`${probs.length} problems`} density={density}>
              <div className="flex flex-wrap gap-1.5">
                {probs.map((p) => (
                  <Badge 
                    key={p.id} 
                    variant="outline" 
                    className={density === 'compact' ? 'text-[10px]' : 'text-xs'}
                  >
                    {p.title}
                  </Badge>
                ))}
              </div>
            </ViewCard>
          ))}
        </div>
      )}

      {/* Flat List */}
      {groupBy === 'none' && (
        <div className={density === 'compact' ? 'space-y-1.5' : 'space-y-2'}>
          {filteredProblems?.map((problem) => (
            <ViewCard 
              key={problem.id}
              title={problem.title}
              badge={`${problem.recentAttempts.length} recent`}
              badgeVariant={problem.is_solved ? 'default' : 'secondary'}
              density={density}
            >
              <p className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                {problem.subject_name} • {problem.material_name}
              </p>

              <div className={density === 'compact' ? 'space-y-0.5' : 'space-y-1'}>
                {problem.recentAttempts.slice(0, 2).map((attempt) => (
                  <div
                    key={attempt.id}
                    className={`p-1.5 rounded ${density === 'compact' ? 'text-[10px]' : 'text-xs'} ${
                      attempt.successful
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {attempt.successful ? '✓' : '✗'} #{attempt.attempt_number}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(attempt.timestamp)}
                      </span>
                    </div>
                    {attempt.errors && (
                      <p className="mt-0.5 text-muted-foreground line-clamp-1">{attempt.errors}</p>
                    )}
                  </div>
                ))}
              </div>
            </ViewCard>
          ))}
        </div>
      )}
    </BaseView>
  )
}
