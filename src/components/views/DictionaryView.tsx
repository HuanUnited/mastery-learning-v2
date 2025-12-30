import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'

export function DictionaryView() {
  const queryClient = useQueryClient()
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

  if (isLoading) {
    return <div className="p-8">Loading dictionary...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Russian Dictionary</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="p-6 space-y-4 bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold">Add New Word</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Russian Word *</Label>
              <Input
                value={wordRu}
                onChange={(e) => setWordRu(e.target.value)}
                placeholder="математика"
              />
            </div>

            <div>
              <Label>English Translation *</Label>
              <Input
                value={translationEn}
                onChange={(e) => setTranslationEn(e.target.value)}
                placeholder="mathematics"
              />
            </div>
          </div>

          <div>
            <Label>Material (Optional)</Label>
            <Input
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="e.g., Calculus, Topology"
            />
          </div>

          <div>
            <Label>Example Sentence (Optional)</Label>
            <Textarea
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="Математика — это наука..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => addMutation.mutate()}
              disabled={!wordRu || !translationEn}
            >
              Add to Dictionary
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search dictionary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vocabulary List */}
      {!vocabulary || vocabulary.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {searchTerm ? 'No matching words found' : 'No vocabulary yet. Add your first word!'}
        </div>
      ) : (
        <div className="space-y-3">
          {vocabulary.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold">{entry.word_ru}</span>
                    <span className="text-lg text-muted-foreground">= {entry.translation_en}</span>
                  </div>

                  {entry.example_sentence && (
                    <p className="text-sm text-muted-foreground italic mb-2">
                      "{entry.example_sentence}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {entry.material_name && (
                      <Badge variant="outline">{entry.material_name}</Badge>
                    )}
                    <span>Reviewed {entry.review_count} times</span>
                    {entry.last_reviewed && (
                      <>
                        <span>•</span>
                        <span>Last: {new Date(entry.last_reviewed).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-muted-foreground">
                  Added {new Date(entry.first_seen).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
