import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, X } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function RussianView() {
  const queryClient = useQueryClient()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')
  const [activeTab, setActiveTab] = useState<'drill' | 'dictionary'>('drill')

  // Drill state
  const [materialName, setMaterialName] = useState('')
  const [status, setStatus] = useState<'learning' | 'practicing' | 'mastered'>('learning')
  const [errorsRu, setErrorsRu] = useState('')
  const [resolutionRu, setResolutionRu] = useState('')
  const [commentary, setCommentary] = useState('')
  const [vocabularyWords, setVocabularyWords] = useState('')

  // Dictionary state
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [wordRu, setWordRu] = useState('')
  const [translationEn, setTranslationEn] = useState('')
  const [dictMaterialName, setDictMaterialName] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')

  const { data: drillHistory } = useQuery({
    queryKey: ['drill-history', 10],
    queryFn: () => api.getDrillHistory(10),
  })

  const { data: vocabulary } = useQuery({
    queryKey: ['vocabulary', searchTerm],
    queryFn: () => searchTerm ? api.searchVocabulary(searchTerm) : api.getAllVocabulary(),
  })

  const logDrillMutation = useMutation({
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

  const addVocabMutation = useMutation({
    mutationFn: () => api.addVocabulary(
      wordRu,
      translationEn,
      dictMaterialName || undefined,
      exampleSentence || undefined
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
      setWordRu('')
      setTranslationEn('')
      setDictMaterialName('')
      setExampleSentence('')
      setShowAddForm(false)
    },
  })

  const handleDrillSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialName) {
      alert('Material name is required')
      return
    }
    logDrillMutation.mutate()
  }

  const handleVocabSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wordRu || !translationEn) {
      alert('Russian word and English translation are required')
      return
    }
    addVocabMutation.mutate()
  }

  return (
    <BaseView 
      title="Russian Learning"
      density={density}
      maxWidth="6xl"
      actions={
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer"
            onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
          >
            {density === 'compact' ? '☰' : '⊟'}
          </Badge>
        </div>
      }
    >
      {/* Tab Selector */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'drill' ? 'default' : 'outline'}
          onClick={() => setActiveTab('drill')}
          size="sm"
        >
          Drill Sessions
        </Button>
        <Button
          variant={activeTab === 'dictionary' ? 'default' : 'outline'}
          onClick={() => setActiveTab('dictionary')}
          size="sm"
        >
          Dictionary
        </Button>
      </div>

      {activeTab === 'drill' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Drill Form */}
          <ViewCard title="Log Drill Session" density={density}>
            <form onSubmit={handleDrillSubmit} className={density === 'compact' ? 'space-y-2.5' : 'space-y-4'}>
              <div>
                <Label className={density === 'compact' ? 'text-xs' : ''}>Material *</Label>
                <Input
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g., Linear Algebra"
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
                  placeholder="Описание ошибок..."
                  rows={2}
                  className={density === 'compact' ? 'text-sm' : ''}
                />
              </div>

              <div>
                <Label className={density === 'compact' ? 'text-xs' : ''}>Resolution (Russian)</Label>
                <Textarea
                  value={resolutionRu}
                  onChange={(e) => setResolutionRu(e.target.value)}
                  placeholder="Как исправили..."
                  rows={2}
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
                <Label className={density === 'compact' ? 'text-xs' : ''}>Vocabulary (comma-separated)</Label>
                <Input
                  value={vocabularyWords}
                  onChange={(e) => setVocabularyWords(e.target.value)}
                  placeholder="теорема, доказательство"
                  className={density === 'compact' ? 'h-8 text-sm' : ''}
                />
              </div>

              <Button 
                type="submit"
                className="w-full"
                size={density === 'compact' ? 'sm' : 'default'}
                disabled={logDrillMutation.isPending}
              >
                {logDrillMutation.isPending ? 'Logging...' : 'Log Session'}
              </Button>
            </form>
          </ViewCard>

          {/* Recent Drills */}
          <div>
            <h3 className={`font-bold mb-3 ${
              density === 'compact' ? 'text-base' : 'text-xl'
            }`}>
              Recent Sessions
            </h3>
            {!drillHistory || drillHistory.length === 0 ? (
              <ViewCard density={density}>
                <p className="text-center text-muted-foreground py-4 text-sm">
                  No drill sessions yet
                </p>
              </ViewCard>
            ) : (
              <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
                {drillHistory.map((drill) => (
                  <ViewCard key={drill.id} density={density}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate ${
                          density === 'compact' ? 'text-sm' : 'text-base'
                        }`}>
                          {drill.material_name}
                        </h4>
                        <p className={`text-muted-foreground ${
                          density === 'compact' ? 'text-[10px]' : 'text-xs'
                        }`}>
                          Session #{drill.attempt_number}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          drill.status === 'mastered' ? 'default' :
                          drill.status === 'practicing' ? 'secondary' : 'outline'
                        }
                        className={`shrink-0 ${
                          density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'
                        }`}
                      >
                        {drill.status === 'mastered' && '🟢'}
                        {drill.status === 'practicing' && '🟠'}
                        {drill.status === 'learning' && '🟡'}
                        {' '}{drill.status}
                      </Badge>
                    </div>

                    {drill.errors_ru && (
                      <p className={`text-red-600 dark:text-red-400 mb-1 ${
                        density === 'compact' ? 'text-xs' : 'text-sm'
                      }`}>
                        ❌ {drill.errors_ru}
                      </p>
                    )}

                    {drill.resolution_ru && (
                      <p className={`text-green-600 dark:text-green-400 mb-1 ${
                        density === 'compact' ? 'text-xs' : 'text-sm'
                      }`}>
                        ✓ {drill.resolution_ru}
                      </p>
                    )}

                    <p className={`text-muted-foreground mt-2 ${
                      density === 'compact' ? 'text-[10px]' : 'text-xs'
                    }`}>
                      {formatDateTime(drill.timestamp)}
                    </p>
                  </ViewCard>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dictionary Header */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dictionary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
            >
              {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddForm ? 'Cancel' : 'Add Word'}
            </Button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <ViewCard 
              title="Add New Word"
              density={density}
              className="bg-blue-50 dark:bg-blue-900/10"
            >
              <form onSubmit={handleVocabSubmit} className={density === 'compact' ? 'space-y-2.5' : 'space-y-4'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={density === 'compact' ? 'text-xs' : ''}>Russian Word *</Label>
                    <Input
                      value={wordRu}
                      onChange={(e) => setWordRu(e.target.value)}
                      placeholder="математика"
                      className={density === 'compact' ? 'h-8 text-sm' : ''}
                    />
                  </div>

                  <div>
                    <Label className={density === 'compact' ? 'text-xs' : ''}>English *</Label>
                    <Input
                      value={translationEn}
                      onChange={(e) => setTranslationEn(e.target.value)}
                      placeholder="mathematics"
                      className={density === 'compact' ? 'h-8 text-sm' : ''}
                    />
                  </div>
                </div>

                <div>
                  <Label className={density === 'compact' ? 'text-xs' : ''}>Material (Optional)</Label>
                  <Input
                    value={dictMaterialName}
                    onChange={(e) => setDictMaterialName(e.target.value)}
                    placeholder="e.g., Calculus"
                    className={density === 'compact' ? 'h-8 text-sm' : ''}
                  />
                </div>

                <div>
                  <Label className={density === 'compact' ? 'text-xs' : ''}>Example (Optional)</Label>
                  <Textarea
                    value={exampleSentence}
                    onChange={(e) => setExampleSentence(e.target.value)}
                    placeholder="Математика — это наука..."
                    rows={2}
                    className={density === 'compact' ? 'text-sm' : ''}
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={!wordRu || !translationEn || addVocabMutation.isPending}
                  size={density === 'compact' ? 'sm' : 'default'}
                >
                  {addVocabMutation.isPending ? 'Adding...' : 'Add to Dictionary'}
                </Button>
              </form>
            </ViewCard>
          )}

          {/* Vocabulary List */}
          {!vocabulary || vocabulary.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchTerm ? 'No matching words found' : 'No vocabulary yet'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vocabulary.map((entry) => (
                <ViewCard key={entry.id} density={density}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                        <span className="font-bold text-base">{entry.word_ru}</span>
                        <span className="text-muted-foreground text-sm">= {entry.translation_en}</span>
                      </div>

                      {entry.example_sentence && (
                        <p className="text-muted-foreground italic mb-1.5 text-xs">
                          "{entry.example_sentence}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        {entry.material_name && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {entry.material_name}
                          </Badge>
                        )}
                        <span>Reviewed {entry.review_count}x</span>
                        {entry.last_reviewed && (
                          <>
                            <span>•</span>
                            <span>Last: {formatDate(entry.last_reviewed)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                      Added<br/>{formatDate(entry.first_seen)}
                    </div>
                  </div>
                </ViewCard>
              ))}
            </div>
          )}
        </div>
      )}
    </BaseView>
  )
}
