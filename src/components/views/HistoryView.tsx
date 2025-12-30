import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProblemDetailModal } from './ProblemDetailModal'
import { Search, Filter } from 'lucide-react'
import type { ProblemDetail } from '@/lib/types'

export function HistoryView() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['recent-problems'],
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
    return <div className="p-8">Loading history...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Problem History</h2>
        <p className="text-muted-foreground">
          Click on any problem to view details and edit attempts
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
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
      <div className="space-y-4">
        {filteredProblems.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No problems found. Start logging attempts!
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <Card
              key={problem.id}
              className="p-4 hover:bg-accent cursor-pointer transition-colors"
              onClick={() => setSelectedProblem(problem)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{problem.title}</h3>
                    {problem.is_solved && (
                      <Badge className="bg-green-500">✓ Solved</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{problem.generated_id}</Badge>
                    <Badge variant="outline">{problem.material_name}</Badge>
                    <Badge variant="outline">{problem.subject_name}</Badge>
                  </div>

                  {problem.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {problem.description}
                    </p>
                  )}

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{problem.attempts.length} attempts</span>
                    <span>
                      {problem.attempts.filter(a => a.successful).length} successful
                    </span>
                    <span>
                      {problem.attempts.length > 0
                        ? `${((problem.attempts.filter(a => a.successful).length / problem.attempts.length) * 100).toFixed(0)}% success rate`
                        : '0% success rate'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {problem.attempts.length}
                  </div>
                  <div className="text-xs text-muted-foreground">attempts</div>
                </div>
              </div>
            </Card>
          ))
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
    </div>
  )
}
