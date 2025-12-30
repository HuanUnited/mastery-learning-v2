import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function RussianDrillView() {
  const queryClient = useQueryClient()

  // Form state
  const [materialName, setMaterialName] = useState('')
  const [status, setStatus] = useState<'learning' | 'practicing' | 'mastered'>('learning')
  const [errorsRu, setErrorsRu] = useState('')
  const [resolutionRu, setResolutionRu] = useState('')
  const [commentary, setCommentary] = useState('')
  const [vocabularyWords, setVocabularyWords] = useState('')

  const { data: drillHistory } = useQuery({
    queryKey: ['drill-history'],
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
      // Reset only drill-specific fields
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
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drill Form */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Russian Drill Session</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Material *</Label>
              <Input
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g., Linear Algebra, Topology"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
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
              <Label>Errors (Russian)</Label>
              <Textarea
                value={errorsRu}
                onChange={(e) => setErrorsRu(e.target.value)}
                placeholder="Описание ошибок на русском..."
                rows={3}
              />
            </div>

            <div>
              <Label>Resolution (Russian)</Label>
              <Textarea
                value={resolutionRu}
                onChange={(e) => setResolutionRu(e.target.value)}
                placeholder="Как исправили на русском..."
                rows={3}
              />
            </div>

            <div>
              <Label>Commentary</Label>
              <Textarea
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div>
              <Label>Vocabulary Words (comma-separated)</Label>
              <Input
                value={vocabularyWords}
                onChange={(e) => setVocabularyWords(e.target.value)}
                placeholder="теорема, доказательство, множество"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Links to dictionary entries (must exist first)
              </p>
            </div>

            <Button type="submit" className="w-full">
              Log Drill Session
            </Button>
          </form>
        </Card>

        {/* Recent Drills */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Recent Drill Sessions</h3>

          {!drillHistory || drillHistory.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No drill sessions yet
            </Card>
          ) : (
            <div className="space-y-3">
              {drillHistory.map((drill) => (
                <Card key={drill.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{drill.material_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Session #{drill.attempt_number}
                      </p>
                    </div>
                    <Badge variant={
                      drill.status === 'mastered' ? 'default' :
                      drill.status === 'practicing' ? 'secondary' : 'outline'
                    }>
                      {drill.status === 'mastered' && '🟢'}
                      {drill.status === 'practicing' && '🟠'}
                      {drill.status === 'learning' && '🟡'}
                      {' '}{drill.status}
                    </Badge>
                  </div>

                  {drill.errors_ru && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      ❌ {drill.errors_ru}
                    </p>
                  )}

                  {drill.resolution_ru && (
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      ✓ {drill.resolution_ru}
                    </p>
                  )}

                  {drill.commentary && (
                    <p className="text-sm text-muted-foreground">
                      💭 {drill.commentary}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(drill.timestamp).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
