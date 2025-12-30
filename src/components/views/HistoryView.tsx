import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProblemDetailModal } from './ProblemDetailModal'
import { Search } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'
import type { ProblemDetail } from '@/lib/types'

export function HistoryView() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  })

  // Filter problems
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.generated_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.material_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSubject = 
      filterSubject === 'all' || problem.subject_name === filterSubject

    return matchesSearch && matchesSubject
  })

  // Get unique subjects for filter
  const subjects = Array.from(new Set(problems.map(p => p.subject_name)))

  if (isLoading) {
    return (
      <BaseView title="Problem History" density={density}>
        <p className="text-muted-foreground">Loading history...</p>
      </BaseView>
    )
  }

  return (
    <BaseView 
      title="Problem History"
      subtitle="Click on any problem to view details and edit attempts"
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterSubject === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterSubject('all')}
            size="sm"
          >
            All
          </Button>
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={filterSubject === subject ? 'default' : 'outline'}
              onClick={() => setFilterSubject(subject)}
              size="sm"
            >
              {subject}
            </Button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
        {filteredProblems.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No problems found. Start logging attempts!
          </div>
        ) : (
          filteredProblems.map((problem) => {
            const successCount = problem.attempts.filter(a => a.successful).length
            const successRate = problem.attempts.length > 0 
              ? successCount / problem.attempts.length 
              : 0

            return (
              <ViewCard
                key={problem.id}
                density={density}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedProblem(problem)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className={`font-semibold truncate ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                        {problem.title}
                      </h3>
                      {problem.is_solved && (
                        <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">
                          ✓ Solved
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1.5 mb-2 flex-wrap ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                      <Badge variant="outline" className={density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
                        {problem.generated_id}
                      </Badge>
                      <Badge variant="outline" className={density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
                        {problem.material_name}
                      </Badge>
                      <Badge variant="outline" className={density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
                        {problem.subject_name}
                      </Badge>
                    </div>

                    {problem.description && (
                      <p className={`text-muted-foreground line-clamp-2 mb-2 ${density === 'compact' ? 'text-[11px]' : 'text-sm'}`}>
                        {problem.description}
                      </p>
                    )}

                    <div className={`flex gap-3 text-muted-foreground flex-wrap ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                      <span>{problem.attempts.length} attempts</span>
                      <span>{successCount} successful</span>
                      <span>{formatPercentage(successRate, 0)} success rate</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-bold ${density === 'compact' ? 'text-xl' : 'text-2xl'}`}>
                      {problem.attempts.length}
                    </div>
                    <div className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                      attempts
                    </div>
                  </div>
                </div>
              </ViewCard>
            )
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          open={!!selectedProblem}
          onClose={() => setSelectedProblem(null)}
        />
      )}
    </BaseView>
  )
}
