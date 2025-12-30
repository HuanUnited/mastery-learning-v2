import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useTimer } from '@/hooks/useTimer'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Plus, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react'

export function LearningView() {
  const queryClient = useQueryClient()
  const { capturedMinutes, clearCapturedMinutes } = useTimer()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')

  // Form state
  const [materialName, setMaterialName] = useState('')
  const [topic, setTopic] = useState('')
  const [phase, setPhase] = useState<'discovery' | 'drilling' | 'integration'>('discovery')
  const [duration, setDuration] = useState('')
  const [solved, setSolved] = useState<boolean | null>(null)
  const [errors, setErrors] = useState('')
  const [notes, setNotes] = useState('')

  // History filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const [filterSolved, setFilterSolved] = useState<string>('all')

  // Auto-fill duration from timer
  if (capturedMinutes !== null && !duration) {
    setDuration(capturedMinutes.toString())
    clearCapturedMinutes()
  }

  const { data: history, isLoading } = useQuery({
    queryKey: ['attempts', searchTerm, filterPhase, filterSolved],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterPhase !== 'all') params.append('phase', filterPhase)
      if (filterSolved !== 'all') params.append('solved', filterSolved)
      return api.getAttempts(params.toString())
    },
  })

  const addMutation = useMutation({
    mutationFn: () =>
      api.addAttempt(
        materialName,
        topic,
        phase,
        parseInt(duration),
        solved!,
        errors || undefined,
        notes || undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      // Reset form
      setMaterialName('')
      setTopic('')
      setDuration('')
      setSolved(null)
      setErrors('')
      setNotes('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialName || !topic || !duration || solved === null) {
      alert('Please fill all required fields')
      return
    }
    addMutation.mutate()
  }

  return (
    <BaseView
      title="Learning Sessions"
      subtitle="Log attempts and view history"
      density={density}
      maxWidth="7xl"
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
      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Left: Log Form */}
        <ViewCard title="Log New Attempt" density={density} className="lg:sticky lg:top-4 lg:self-start">
          <form onSubmit={handleSubmit} className={density === 'compact' ? 'space-y-3' : 'space-y-4'}>
            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Material Name *</Label>
              <Input
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g., Calculus Chapter 3"
                className={density === 'compact' ? 'h-9 text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Topic *</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Integration by Parts"
                className={density === 'compact' ? 'h-9 text-sm' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className={density === 'compact' ? 'text-xs' : ''}>Phase *</Label>
                <Select value={phase} onValueChange={(v: any) => setPhase(v)}>
                  <SelectTrigger className={density === 'compact' ? 'h-9 text-sm' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="drilling">Drilling</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={density === 'compact' ? 'text-xs' : ''}>
                  Duration (min) *
                  {capturedMinutes !== null && (
                    <span className="ml-1 text-xs text-green-600">✓ {capturedMinutes}m</span>
                  )}
                </Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="15"
                  className={density === 'compact' ? 'h-9 text-sm' : ''}
                />
              </div>
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Result *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={solved === true ? 'default' : 'outline'}
                  className="flex-1"
                  size={density === 'compact' ? 'sm' : 'default'}
                  onClick={() => setSolved(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Solved
                </Button>
                <Button
                  type="button"
                  variant={solved === false ? 'destructive' : 'outline'}
                  className="flex-1"
                  size={density === 'compact' ? 'sm' : 'default'}
                  onClick={() => setSolved(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Failed
                </Button>
              </div>
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Errors (Optional)</Label>
              <Textarea
                value={errors}
                onChange={(e) => setErrors(e.target.value)}
                placeholder="What went wrong?"
                rows={2}
                className={density === 'compact' ? 'text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className={density === 'compact' ? 'text-sm' : ''}
              />
            </div>

            <Button
              type="submit"
              disabled={!materialName || !topic || !duration || solved === null || addMutation.isPending}
              className="w-full"
              size={density === 'compact' ? 'sm' : 'default'}
            >
              {addMutation.isPending ? 'Saving...' : 'Log Attempt'}
            </Button>
          </form>
        </ViewCard>

        {/* Right: History */}
        <div className="space-y-4">
          {/* Filters */}
          <ViewCard title="History" density={density}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-9 ${density === 'compact' ? 'h-8 text-sm' : ''}`}
                />
              </div>

              <Select value={filterPhase} onValueChange={setFilterPhase}>
                <SelectTrigger className={density === 'compact' ? 'h-8 text-sm' : ''}>
                  <SelectValue placeholder="All Phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="drilling">Drilling</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSolved} onValueChange={setFilterSolved}>
                <SelectTrigger className={density === 'compact' ? 'h-8 text-sm' : ''}>
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="true">Solved Only</SelectItem>
                  <SelectItem value="false">Failed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : !history || history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attempts found.</p>
            ) : (
              <div className="space-y-2">
                {history.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{attempt.materialName}</h4>
                        <p className="text-xs text-muted-foreground">{attempt.topic}</p>
                      </div>
                      <Badge
                        variant={attempt.solved ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {attempt.solved ? '✓ Solved' : '✗ Failed'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="capitalize flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        {attempt.phase}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {attempt.durationMinutes}m
                      </span>
                      <span>{formatDateTime(attempt.timestamp)}</span>
                    </div>

                    {attempt.errors && (
                      <p className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                        {attempt.errors}
                      </p>
                    )}

                    {attempt.notes && (
                      <p className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                        {attempt.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ViewCard>
        </div>
      </div>
    </BaseView>
  )
}
