import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Trash2, Edit2, X, Check } from 'lucide-react'
import type { ProblemDetail } from '@/lib/types'

interface ProblemDetailModalProps {
  problem: ProblemDetail
  open: boolean
  onClose: () => void
}

export function ProblemDetailModal({ problem, open, onClose }: ProblemDetailModalProps) {
  const queryClient = useQueryClient()
  const [editingAttemptId, setEditingAttemptId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    successful: false,
    timeSpentMinutes: 0,
    difficultyRating: 1,
    errors: '',
    resolution: '',
    commentary: '',
  })

  const deleteMutation = useMutation({
    mutationFn: (attemptId: number) => api.deleteAttempt(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-problems'] })
      queryClient.invalidateQueries({ queryKey: ['material-stats'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: any }) =>
      api.updateAttempt(attemptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-problems'] })
      queryClient.invalidateQueries({ queryKey: ['material-stats'] })
      setEditingAttemptId(null)
    },
  })

  const startEditing = (attempt: any) => {
    setEditingAttemptId(attempt.id)
    setEditForm({
      successful: attempt.successful,
      timeSpentMinutes: attempt.time_spent_minutes || 0,
      difficultyRating: attempt.difficulty_rating || 1,
      errors: attempt.errors || '',
      resolution: attempt.resolution || '',
      commentary: attempt.commentary || '',
    })
  }

  const saveEdit = () => {
    if (editingAttemptId) {
      updateMutation.mutate({
        attemptId: editingAttemptId,
        data: {
          successful: editForm.successful,
          timeSpentMinutes: editForm.timeSpentMinutes,
          difficultyRating: editForm.difficultyRating,
          errors: editForm.errors || undefined,
          resolution: editForm.resolution || undefined,
          commentary: editForm.commentary || undefined,
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Problem Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Problem Header */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{problem.title}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline">{problem.generated_id}</Badge>
                <Badge variant="outline">{problem.material_name}</Badge>
                <Badge variant="outline">{problem.subject_name}</Badge>
                {problem.is_solved && (
                  <Badge className="bg-green-500">✓ Solved</Badge>
                )}
              </div>
            </div>

            {/* Problem Description */}
            {problem.description && (
              <div className="p-4 bg-muted rounded-lg">
                <strong className="text-sm">Description:</strong>
                <p className="text-sm mt-1 whitespace-pre-wrap">{problem.description}</p>
              </div>
            )}

            {/* Problem Image */}
            {problem.image_filename && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <strong className="text-sm mb-2 block">Problem Image:</strong>
                <ImageDisplay filename={problem.image_filename} />
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold">{problem.attempts.length}</div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {problem.attempts.filter(a => a.successful).length}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {problem.attempts.length > 0
                  ? (
                      (problem.attempts.filter(a => a.successful).length /
                        problem.attempts.length) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </Card>
          </div>

          {/* Attempts List */}
          <div>
            <h3 className="font-semibold mb-3">Attempt History</h3>
            <div className="space-y-3">
              {problem.attempts
                .slice()
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((attempt) => (
                  <Card key={attempt.id} className="p-4">
                    {editingAttemptId === attempt.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.successful}
                              onChange={(e) =>
                                setEditForm({ ...editForm, successful: e.target.checked })
                              }
                            />
                            <span className="text-sm">Successful</span>
                          </label>

                          <Input
                            type="number"
                            value={editForm.timeSpentMinutes}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                timeSpentMinutes: parseFloat(e.target.value),
                              })
                            }
                            className="w-24"
                            placeholder="Time"
                          />

                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={editForm.difficultyRating}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                difficultyRating: parseInt(e.target.value),
                              })
                            }
                            className="w-24"
                            placeholder="Difficulty"
                          />
                        </div>

                        <Textarea
                          value={editForm.errors}
                          onChange={(e) => setEditForm({ ...editForm, errors: e.target.value })}
                          placeholder="Errors"
                          rows={2}
                        />

                        <Textarea
                          value={editForm.resolution}
                          onChange={(e) =>
                            setEditForm({ ...editForm, resolution: e.target.value })
                          }
                          placeholder="Resolution"
                          rows={2}
                        />

                        <Textarea
                          value={editForm.commentary}
                          onChange={(e) =>
                            setEditForm({ ...editForm, commentary: e.target.value })
                          }
                          placeholder="Commentary"
                          rows={2}
                        />

                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAttemptId(null)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={attempt.successful ? 'default' : 'destructive'}>
                              {attempt.successful ? '✓ Success' : '✗ Failed'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Attempt #{attempt.attempt_number}
                            </span>
                            {attempt.time_spent_minutes && (
                              <span className="text-sm text-muted-foreground">
                                {attempt.time_spent_minutes}min
                              </span>
                            )}
                            {attempt.difficulty_rating && (
                              <span className="text-sm">
                                {'⭐'.repeat(attempt.difficulty_rating)}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(attempt)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Delete this attempt?')) {
                                  deleteMutation.mutate(attempt.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {attempt.errors && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                            ❌ {attempt.errors}
                          </p>
                        )}

                        {attempt.resolution && (
                          <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                            ✓ {attempt.resolution}
                          </p>
                        )}

                        {attempt.commentary && (
                          <p className="text-sm text-muted-foreground mb-1">
                            💭 {attempt.commentary}
                          </p>
                        )}

                        {attempt.resources && attempt.resources.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {attempt.resources.map((resource, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {resource.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Image Display Helper Component
function ImageDisplay({ filename }: { filename: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        const imagePath = await api.getProblemImagePath(filename)
        const assetUrl = convertFileSrc(imagePath)
        setImageSrc(assetUrl)
      } catch (err) {
        console.error('Failed to load image:', err)
        setError(true)
      }
    }
    loadImage()
  }, [filename])

  if (error) {
    return <div className="text-sm text-muted-foreground">Failed to load image</div>
  }

  if (!imageSrc) {
    return <div className="text-sm text-muted-foreground">Loading image...</div>
  }

  return (
    <img
      src={imageSrc}
      alt="Problem"
      className="max-w-full max-h-96 object-contain rounded border"
    />
  )
}
