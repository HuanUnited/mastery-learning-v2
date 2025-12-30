import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function RussianDrillView() {
  const queryClient = useQueryClient()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  // Form state
  const [materialName, setMaterialName] = useState('')
  const [status, setStatus] = useState<'learning' | 'practicing' | 'mastered'>('learning')
  const [errorsRu, setErrorsRu] = useState('')
  const [resolutionRu, setResolutionRu] = useState('')
  const [commentary, setCommentary] = useState('')
  const [vocabularyWords, setVocabularyWords] = useState('')

  const { data: drillHistory } = useQuery({
    queryKey: ['drill-history', 20],
    queryFn: () => api.getDrillHistory(20),
  })

  const logMutation = useMutation({
    mutationFn: () => api.logDrillAttempt(
      materialName,
      status,
      errorsRu || undefined,
      resolutionRu || undefined,
      commentary || undefined,
      vocabularyWords ? vocabularyWords.split(',').map(w => w.trim()) : []
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drill-history'] })
      setErrorsRu('')
      setResolutionRu('')
      setCommentary('')
      setVocabularyWords('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialName) {
      alert('Material name is required')
      return
    }
    logMutation.mutate()
  }

  return (
    <BaseView 
      title="Russian Drill Session"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Drill Form */}
        <ViewCard title="Log Drill Session" density={density}>
          <form onSubmit={handleSubmit} className={density === 'compact' ? 'space-y-2.5' : 'space-y-4'}>
            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Material *</Label>
              <Input
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g., Linear Algebra, Topology"
                className={density === 'compact' ? 'h-8 text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className={density === 'compact' ? 'h-8 text-sm' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">🟡 Learning</SelectItem>
                  <SelectItem value="practicing">🟠 Practicing</SelectItem>
                  <SelectItem value="mastered">🟢 Mastered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Errors (Russian)</Label>
              <Textarea
                value={errorsRu}
                onChange={(e) => setErrorsRu(e.target.value)}
                placeholder="Описание ошибок на русском..."
                rows={density === 'compact' ? 2 : 3}
                className={density === 'compact' ? 'text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Resolution (Russian)</Label>
              <Textarea
                value={resolutionRu}
                onChange={(e) => setResolutionRu(e.target.value)}
                placeholder="Как исправили на русском..."
                rows={density === 'compact' ? 2 : 3}
                className={density === 'compact' ? 'text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Commentary</Label>
              <Textarea
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className={density === 'compact' ? 'text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Vocabulary Words (comma-separated)</Label>
              <Input
                value={vocabularyWords}
                onChange={(e) => setVocabularyWords(e.target.value)}
                placeholder="теорема, доказательство, множество"
                className={density === 'compact' ? 'h-8 text-sm' : ''}
              />
              <p className={`text-muted-foreground mt-1 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                Links to dictionary entries (must exist first)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              size={density === 'compact' ? 'sm' : 'default'}
              disabled={logMutation.isPending}
            >
              {logMutation.isPending ? 'Logging...' : 'Log Drill Session'}
            </Button>
          </form>
        </ViewCard>

        {/* Recent Drills */}
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          <h3 className={`font-bold ${density === 'compact' ? 'text-base' : 'text-xl'}`}>
            Recent Drill Sessions
          </h3>

          {!drillHistory || drillHistory.length === 0 ? (
            <ViewCard density={density}>
              <p className="text-center text-muted-foreground">
                No drill sessions yet
              </p>
            </ViewCard>
          ) : (
            <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
              {drillHistory.map((drill) => (
                <ViewCard key={drill.id} density={density}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
                        {drill.material_name}
                      </h4>
                      <p className={`text-muted-foreground ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                        Session #{drill.attempt_number}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        drill.status === 'mastered' ? 'default' :
                        drill.status === 'practicing' ? 'secondary' : 'outline'
                      }
                      className={density === 'compact' ? 'text-[10px] px-1.5 py-0 shrink-0' : 'text-xs shrink-0'}
                    >
                      {drill.status === 'mastered' && '🟢'}
                      {drill.status === 'practicing' && '🟠'}
                      {drill.status === 'learning' && '🟡'}
                      {' '}{drill.status}
                    </Badge>
                  </div>

                  {drill.errors_ru && (
                    <p className={`text-red-600 dark:text-red-400 mb-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                      ❌ {drill.errors_ru}
                    </p>
                  )}

                  {drill.resolution_ru && (
                    <p className={`text-green-600 dark:text-green-400 mb-1 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                      ✓ {drill.resolution_ru}
                    </p>
                  )}

                  {drill.commentary && (
                    <p className={`text-muted-foreground ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                      💭 {drill.commentary}
                    </p>
                  )}

                  <p className={`text-muted-foreground mt-2 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                    {formatDateTime(drill.timestamp)}
                  </p>
                </ViewCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseView>
  )
}
