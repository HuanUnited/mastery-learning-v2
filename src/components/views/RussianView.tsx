import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import { Plus, Search, X, BookOpen, Languages } from 'lucide-react'

export function RussianView() {
  const queryClient = useQueryClient()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')
  const [activeTab, setActiveTab] = useState('dictionary')

  // Dictionary state
  const [showAddWord, setShowAddWord] = useState(false)
  const [searchWord, setSearchWord] = useState('')
  const [wordRu, setWordRu] = useState('')
  const [translationEn, setTranslationEn] = useState('')
  const [materialName, setMaterialName] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')

  // Drill state
  const [showAddDrill, setShowAddDrill] = useState(false)
  const [searchDrill, setSearchDrill] = useState('')
  const [drillNameRu, setDrillNameRu] = useState('')
  const [drillNameEn, setDrillNameEn] = useState('')
  const [drillStatus, setDrillStatus] = useState<'to_practice' | 'practicing' | 'mastered'>('to_practice')
  const [drillNotes, setDrillNotes] = useState('')

  const { data: vocabulary } = useQuery({
    queryKey: ['vocabulary', searchWord],
    queryFn: () => searchWord ? api.searchVocabulary(searchWord) : api.getAllVocabulary(),
  })

  const { data: drills } = useQuery({
    queryKey: ['russian-drills', searchDrill],
    queryFn: () => searchDrill ? api.searchRussianDrills(searchDrill) : api.getAllRussianDrills(),
  })

  const addWordMutation = useMutation({
    mutationFn: () => api.addVocabulary(wordRu, translationEn, materialName || undefined, exampleSentence || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
      setWordRu('')
      setTranslationEn('')
      setMaterialName('')
      setExampleSentence('')
      setShowAddWord(false)
    },
  })

  const addDrillMutation = useMutation({
    mutationFn: () => api.addRussianDrill(drillNameRu, drillNameEn, drillStatus, drillNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['russian-drills'] })
      setDrillNameRu('')
      setDrillNameEn('')
      setDrillStatus('to_practice')
      setDrillNotes('')
      setShowAddDrill(false)
    },
  })

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wordRu || !translationEn) return
    addWordMutation.mutate()
  }

  const handleAddDrill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!drillNameRu || !drillNameEn) return
    addDrillMutation.mutate()
  }

  return (
    <BaseView
      title="Russian Learning"
      subtitle="Vocabulary and pronunciation practice"
      density={density}
      maxWidth="6xl"
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dictionary">
            <BookOpen className="h-4 w-4 mr-2" />
            Dictionary
          </TabsTrigger>
          <TabsTrigger value="drills">
            <Languages className="h-4 w-4 mr-2" />
            Pronunciation Drills
          </TabsTrigger>
        </TabsList>

        {/* Dictionary Tab */}
        <TabsContent value="dictionary" className="space-y-4">
          {/* Add Form */}
          {showAddWord && (
            <ViewCard title="Add New Word" density={density} className="bg-blue-50 dark:bg-blue-900/10">
              <form onSubmit={handleAddWord} className={density === 'compact' ? 'space-y-2.5' : 'space-y-4'}>
                <div className="grid sm:grid-cols-2 gap-3">
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
                    <Label className={density === 'compact' ? 'text-xs' : ''}>English Translation *</Label>
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
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="e.g., Calculus"
                    className={density === 'compact' ? 'h-8 text-sm' : ''}
                  />
                </div>
                <div>
                  <Label className={density === 'compact' ? 'text-xs' : ''}>Example (Optional)</Label>
                  <Textarea
                    value={exampleSentence}
                    onChange={(e) => setExampleSentence(e.target.value)}
                    placeholder="Example sentence..."
                    rows={2}
                    className={density === 'compact' ? 'text-sm' : ''}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!wordRu || !translationEn || addWordMutation.isPending}
                    size={density === 'compact' ? 'sm' : 'default'}
                  >
                    Add Word
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddWord(false)}
                    size={density === 'compact' ? 'sm' : 'default'}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </ViewCard>
          )}

          {/* Search & Add Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dictionary..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className={`pl-9 ${density === 'compact' ? 'h-8 text-sm' : ''}`}
              />
            </div>
            <Button
              size={density === 'compact' ? 'sm' : 'default'}
              onClick={() => setShowAddWord(!showAddWord)}
            >
              {showAddWord ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Dictionary List */}
          <ViewCard title="Vocabulary" density={density}>
            {!vocabulary || vocabulary.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No words found.</p>
            ) : (
              <div className="space-y-2">
                {vocabulary.map((word) => (
                  <div key={word.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{word.wordRu}</h4>
                        <p className="text-sm text-muted-foreground">{word.translationEn}</p>
                      </div>
                      {word.materialName && (
                        <Badge variant="outline" className="text-xs">{word.materialName}</Badge>
                      )}
                    </div>
                    {word.exampleSentence && (
                      <p className="text-xs bg-muted p-2 rounded mt-2">{word.exampleSentence}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Added {formatDate(word.dateAdded)}</p>
                  </div>
                ))}
              </div>
            )}
          </ViewCard>
        </TabsContent>

        {/* Drills Tab */}
        <TabsContent value="drills" className="space-y-4">
          {/* Add Form */}
          {showAddDrill && (
            <ViewCard title="Add New Drill" density={density} className="bg-green-50 dark:bg-green-900/10">
              <form onSubmit={handleAddDrill} className={density === 'compact' ? 'space-y-2.5' : 'space-y-4'}>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={density === 'compact' ? 'text-xs' : ''}>Russian Name *</Label>
                    <Input
                      value={drillNameRu}
                      onChange={(e) => setDrillNameRu(e.target.value)}
                      placeholder="Интегрирование"
                      className={density === 'compact' ? 'h-8 text-sm' : ''}
                    />
                  </div>
                  <div>
                    <Label className={density === 'compact' ? 'text-xs' : ''}>English Name *</Label>
                    <Input
                      value={drillNameEn}
                      onChange={(e) => setDrillNameEn(e.target.value)}
                      placeholder="Integration"
                      className={density === 'compact' ? 'h-8 text-sm' : ''}
                    />
                  </div>
                </div>
                <div>
                  <Label className={density === 'compact' ? 'text-xs' : ''}>Status</Label>
                  <Select value={drillStatus} onValueChange={(v: any) => setDrillStatus(v)}>
                    <SelectTrigger className={density === 'compact' ? 'h-8 text-sm' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to_practice">To Practice</SelectItem>
                      <SelectItem value="practicing">Practicing</SelectItem>
                      <SelectItem value="mastered">Mastered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={density === 'compact' ? 'text-xs' : ''}>Notes (Optional)</Label>
                  <Textarea
                    value={drillNotes}
                    onChange={(e) => setDrillNotes(e.target.value)}
                    placeholder="Practice notes..."
                    rows={2}
                    className={density === 'compact' ? 'text-sm' : ''}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!drillNameRu || !drillNameEn || addDrillMutation.isPending}
                    size={density === 'compact' ? 'sm' : 'default'}
                  >
                    Add Drill
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDrill(false)}
                    size={density === 'compact' ? 'sm' : 'default'}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </ViewCard>
          )}

          {/* Search & Add Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drills..."
                value={searchDrill}
                onChange={(e) => setSearchDrill(e.target.value)}
                className={`pl-9 ${density === 'compact' ? 'h-8 text-sm' : ''}`}
              />
            </div>
            <Button
              size={density === 'compact' ? 'sm' : 'default'}
              onClick={() => setShowAddDrill(!showAddDrill)}
            >
              {showAddDrill ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Drills List */}
          <ViewCard title="Pronunciation Practice" density={density}>
            {!drills || drills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No drills found.</p>
            ) : (
              <div className="grid gap-3">
                {['to_practice', 'practicing', 'mastered'].map((status) => {
                  const statusDrills = drills.filter((d) => d.status === status)
                  if (statusDrills.length === 0) return null

                  return (
                    <div key={status}>
                      <h4 className="font-semibold capitalize text-sm mb-2 flex items-center gap-2">
                        {status === 'mastered' && '✓'}
                        {status.replace('_', ' ')}
                        <Badge variant="outline" className="text-xs">{statusDrills.length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {statusDrills.map((drill) => (
                          <div key={drill.id} className="p-3 rounded-lg border bg-card">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold">{drill.nameRu}</h5>
                                <p className="text-sm text-muted-foreground">{drill.nameEn}</p>
                              </div>
                              <Badge
                                variant={drill.status === 'mastered' ? 'default' : 'outline'}
                                className={drill.status === 'mastered' ? 'mastery-badge' : 'text-xs'}
                              >
                                {drill.status === 'mastered' && '★ '}
                                {drill.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {drill.notes && (
                              <p className="text-xs bg-muted p-2 rounded mt-2">{drill.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Last: {formatDate(drill.lastReviewed)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ViewCard>
        </TabsContent>
      </Tabs>
    </BaseView>
  )
}
