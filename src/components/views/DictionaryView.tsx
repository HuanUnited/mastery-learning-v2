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
import { formatDate } from '@/lib/utils'

export function DictionaryView() {
  const queryClient = useQueryClient()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state
  const [wordRu, setWordRu] = useState('')
  const [translationEn, setTranslationEn] = useState('')
  const [materialName, setMaterialName] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')

  const { data: vocabulary, isLoading } = useQuery({
    queryKey: ['vocabulary', searchTerm],
    queryFn: () => searchTerm ? api.searchVocabulary(searchTerm) : api.getAllVocabulary(),
  })

  const addMutation = useMutation({
    mutationFn: () => api.addVocabulary(
      wordRu,
      translationEn,
      materialName || undefined,
      exampleSentence || undefined
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
      setWordRu('')
      setTranslationEn('')
      setMaterialName('')
      setExampleSentence('')
      setShowAddForm(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wordRu || !translationEn) {
      alert('Russian word and English translation are required')
      return
    }
    addMutation.mutate()
  }

  if (isLoading) {
    return (
      <BaseView title="Russian Dictionary" density={density}>
        <p className="text-muted-foreground">Loading dictionary...</p>
      </BaseView>
    )
  }

  return (
    <BaseView 
      title="Russian Dictionary"
      density={density}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showAddForm ? 'Cancel' : 'Add Word'}
          </Button>
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
      {/* Add Form */}
      {showAddForm && (
        <ViewCard 
          title="Add New Word"
          density={density}
          className="bg-blue-50 dark:bg-blue-900/10"
        >
          <form onSubmit={handleSubmit} className={density === 'compact' ? 'space-y-2.5' : 'space-y-4'}>
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
                placeholder="e.g., Calculus, Topology"
                className={density === 'compact' ? 'h-8 text-sm' : ''}
              />
            </div>

            <div>
              <Label className={density === 'compact' ? 'text-xs' : ''}>Example Sentence (Optional)</Label>
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
              disabled={!wordRu || !translationEn || addMutation.isPending}
              size={density === 'compact' ? 'sm' : 'default'}
            >
              {addMutation.isPending ? 'Adding...' : 'Add to Dictionary'}
            </Button>
          </form>
        </ViewCard>
      )}

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${density === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
        <Input
          placeholder="Search dictionary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 ${density === 'compact' ? 'h-8 text-sm' : ''}`}
        />
      </div>

      {/* Vocabulary List */}
      {!vocabulary || vocabulary.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          {searchTerm ? 'No matching words found' : 'No vocabulary yet. Add your first word!'}
        </div>
      ) : (
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          {vocabulary.map((entry) => (
            <ViewCard key={entry.id} density={density}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className={`flex items-baseline gap-3 mb-1.5 flex-wrap ${density === 'compact' ? 'text-base' : 'text-lg'}`}>
                    <span className="font-bold">{entry.word_ru}</span>
                    <span className="text-muted-foreground">= {entry.translation_en}</span>
                  </div>

                  {entry.example_sentence && (
                    <p className={`text-muted-foreground italic mb-1.5 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                      "{entry.example_sentence}"
                    </p>
                  )}

                  <div className={`flex items-center gap-2 text-muted-foreground flex-wrap ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                    {entry.material_name && (
                      <Badge variant="outline" className={density === 'compact' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
                        {entry.material_name}
                      </Badge>
                    )}
                    <span>Reviewed {entry.review_count} times</span>
                    {entry.last_reviewed && (
                      <>
                        <span>•</span>
                        <span>Last: {formatDate(entry.last_reviewed)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={`text-right text-muted-foreground shrink-0 ${density === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                  Added<br/>{formatDate(entry.first_seen)}
                </div>
              </div>
            </ViewCard>
          ))}
        </div>
      )}
    </BaseView>
  )
}
