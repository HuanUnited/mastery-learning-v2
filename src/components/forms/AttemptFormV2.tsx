import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useTimer } from '@/hooks/useTimer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, ChevronsUpDown, Pin } from 'lucide-react'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import type { StatusTag } from '@/lib/types'

export function AttemptFormV2() {
  const queryClient = useQueryClient()
  const { capturedMinutes } = useTimer()

  // Pin states (persisted)
  const [subjectPinned, setSubjectPinned] = useState(true)
  const [materialPinned, setMaterialPinned] = useState(true)
  const [problemPinned, setProblemPinned] = useState(false)

  // Context (persisted based on pins)
  const [subject, setSubject] = useState('')
  const [materialEn, setMaterialEn] = useState('')
  const [materialRu, setMaterialRu] = useState('')
  const [problemTitle, setProblemTitle] = useState('')
  const [problemGeneratedId, setProblemGeneratedId] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [problemImage, setProblemImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageFilename, setExistingImageFilename] = useState<string | null>(null)

  // Attempt data (resets)
  const [successful, setSuccessful] = useState(false)
  const [timeSpent, setTimeSpent] = useState<string>('')
  const [difficulty, setDifficulty] = useState<number>()
  const [errors, setErrors] = useState('')
  const [resolution, setResolution] = useState('')
  const [commentary, setCommentary] = useState('')
  const [statusTag, setStatusTag] = useState<StatusTag>()
  const [resources, setResources] = useState('')
  const [isFreshStart, setIsFreshStart] = useState(false)

  // Combobox states
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [materialOpen, setMaterialOpen] = useState(false)
  const [problemOpen, setProblemOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  // Input values for "Create X" display
  const [subjectInputValue, setSubjectInputValue] = useState('')
  const [materialInputValue, setMaterialInputValue] = useState('')
  const [problemInputValue, setProblemInputValue] = useState('')

  // Queries
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.getSubjects(),
  })

  const { data: materials } = useQuery({
    queryKey: ['materials', subject],
    queryFn: () => api.getMaterialsForSubject(subject),
    enabled: !!subject,
  })

  const { data: problems } = useQuery({
    queryKey: ['problems', materialEn],
    queryFn: () => api.getProblemsForMaterial(materialEn),
    enabled: !!materialEn,
  })

  const { data: allProblems } = useQuery({
    queryKey: ['all-problems-for-resources'],
    queryFn: () => api.getRecentProblems(100),
  })

  // Get unique resources for autocomplete
  const uniqueResources = Array.from(
    new Set(
      allProblems?.flatMap(p => 
        p.attempts.flatMap(a => a.resources?.map(r => r.name) || [])
      ) || []
    )
  )

  // Auto-fill time from timer
  useEffect(() => {
    if (capturedMinutes !== null) {
      setTimeSpent(capturedMinutes.toString())
    }
  }, [capturedMinutes])

  // Load existing problem data when selected
  const loadExistingProblem = async (problemId: number) => {
    try {
      const problemDetail = await api.getProblemById(problemId)
      
      setProblemDescription(problemDetail.description || '')
      
      if (problemDetail.image_filename) {
        setExistingImageFilename(problemDetail.image_filename)
        try {
          const imagePath = await api.getProblemImagePath(problemDetail.image_filename)
          const assetUrl = convertFileSrc(imagePath)
          setImagePreview(assetUrl)
        } catch (error) {
          console.error('Failed to load existing image:', error)
          setImagePreview(null)
        }
      } else {
        setExistingImageFilename(null)
        setImagePreview(null)
      }
    } catch (error) {
      console.error('Failed to load problem details:', error)
      setProblemDescription('')
      setImagePreview(null)
      setExistingImageFilename(null)
    }
  }

  // Image preview for new uploads
  const handleImageChange = (file: File | null) => {
    setProblemImage(file)
    setExistingImageFilename(null)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const logMutation = useMutation({
    mutationFn: api.logAttempt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-problems'] })
      queryClient.invalidateQueries({ queryKey: ['material-stats'] })
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      
      // Show success notification
      alert('✅ Attempt logged successfully!')
      
      // Reset based on pins
      if (!subjectPinned) setSubject('')
      if (!materialPinned) {
        setMaterialEn('')
        setMaterialRu('')
      }
      if (!problemPinned) {
        setProblemTitle('')
        setProblemGeneratedId('')
        setProblemDescription('')
        setProblemImage(null)
        setImagePreview(null)
        setExistingImageFilename(null)
      }
      
      // Always reset attempt fields
      setSuccessful(false)
      setTimeSpent('')
      setDifficulty(undefined)
      setErrors('')
      setResolution('')
      setCommentary('')
      setStatusTag(undefined)
      setResources('')
      setIsFreshStart(false)
    },
    onError: (error) => {
      alert(`❌ Error logging attempt: ${error}`)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject || !materialEn || !problemTitle) {
      alert('⚠️ Please fill Subject, Material, and Problem')
      return
    }

    let imageFilename: string | undefined = existingImageFilename || undefined
    
    if (problemImage) {
      try {
        const { invoke } = await import('@tauri-apps/api/tauri')
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1])
          }
          reader.onerror = reject
          reader.readAsDataURL(problemImage)
        })
        
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const ext = problemImage.name.split('.').pop() || 'png'
        const tempId = `temp_${Date.now()}`
        
        imageFilename = await invoke<string>('save_problem_image', {
          problemId: tempId,
          imageData: Array.from(bytes),
          extension: ext,
        })
      } catch (error) {
        console.error('Image upload failed:', error)
        alert('⚠️ Image upload failed, continuing without image')
      }
    }

    logMutation.mutate({
      subjectName: subject,
      materialNameEn: materialEn,
      materialNameRu: materialRu || undefined,
      problemTitle,
      problemDescription: problemDescription || undefined,
      problemImageFilename: imageFilename,
      attemptData: {
        successful,
        timeSpentMinutes: timeSpent ? parseFloat(timeSpent) : undefined,
        difficultyRating: difficulty,
        errors: errors || undefined,
        resolution: resolution || undefined,
        commentary: commentary || undefined,
        statusTag,
        resources: resources ? resources.split(',').map(r => r.trim()).filter(r => r) : [],
      },
      isFreshStart,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Left: Image Preview + Problem Context (1 col - wider now) */}
        <Card className="p-4 space-y-4 lg:col-span-1 flex flex-col">
          <h3 className="font-semibold text-lg">Problem Context</h3>

          {imagePreview ? (
            <div className="flex-1 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Problem preview"
                className="max-w-full max-h-[500px] object-contain rounded border"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded p-8 text-center text-muted-foreground">
              <div>
                <p className="text-sm">No image selected</p>
                <p className="text-xs mt-2">Upload new or select existing problem with image</p>
              </div>
            </div>
          )}

          <div>
            <Label>Upload New Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              className="text-sm w-full mt-1"
            />
          </div>

          {problemDescription && (
            <div className="text-sm p-3 bg-muted rounded max-h-48 overflow-y-auto">
              <strong>Description:</strong>
              <p className="mt-1 whitespace-pre-wrap">{problemDescription}</p>
            </div>
          )}
        </Card>

        {/* Right: Form Fields (2 cols) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          {/* Context Fields */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Problem Identification</h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Subject *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubjectPinned(!subjectPinned)}
                    className="h-6 w-6 p-0"
                  >
                    <Pin className={`h-3 w-3 ${subjectPinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      <span className="truncate">{subject || "Select subject"}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type new..." 
                        value={subjectInputValue}
                        onValueChange={setSubjectInputValue}
                      />
                      <CommandEmpty>
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              if (subjectInputValue) {
                                setSubject(subjectInputValue)
                                setSubjectOpen(false)
                                setSubjectInputValue('')
                              }
                            }}
                          >
                            <span className="font-bold italic">Create "{subjectInputValue}"</span>
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {subjects?.map((s: { name: string }) => (
                          <CommandItem
                            key={s.name}
                            onSelect={() => {
                              setSubject(s.name)
                              setSubjectOpen(false)
                              setSubjectInputValue('')
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${subject === s.name ? 'opacity-100' : 'opacity-0'}`} />
                            {s.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Material */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Material *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMaterialPinned(!materialPinned)}
                    className="h-6 w-6 p-0"
                  >
                    <Pin className={`h-3 w-3 ${materialPinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Popover open={materialOpen} onOpenChange={setMaterialOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={!subject}
                    >
                      <span className="truncate">{materialEn || "Select material"}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type new..." 
                        value={materialInputValue}
                        onValueChange={setMaterialInputValue}
                      />
                      <CommandEmpty>
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              if (materialInputValue) {
                                setMaterialEn(materialInputValue)
                                setMaterialOpen(false)
                                setMaterialInputValue('')
                              }
                            }}
                          >
                            <span className="font-bold italic">Create "{materialInputValue}"</span>
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {materials?.map((m: { name_en: string; name_ru?: string }) => (
                          <CommandItem
                            key={m.name_en}
                            onSelect={() => {
                              setMaterialEn(m.name_en)
                              setMaterialRu(m.name_ru || '')
                              setMaterialOpen(false)
                              setMaterialInputValue('')
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${materialEn === m.name_en ? 'opacity-100' : 'opacity-0'}`} />
                            {m.name_en}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Problem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Problem *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setProblemPinned(!problemPinned)}
                    className="h-6 w-6 p-0"
                  >
                    <Pin className={`h-3 w-3 ${problemPinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Popover open={problemOpen} onOpenChange={setProblemOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={!materialEn}
                    >
                      <span className="truncate">{problemTitle || "Select problem"}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type new..." 
                        value={problemInputValue}
                        onValueChange={setProblemInputValue}
                      />
                      <CommandEmpty>
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              if (problemInputValue) {
                                setProblemTitle(problemInputValue)
                                setProblemGeneratedId('')
                                setProblemDescription('')
                                setImagePreview(null)
                                setExistingImageFilename(null)
                                setProblemOpen(false)
                                setProblemInputValue('')
                              }
                            }}
                          >
                            <span className="font-bold italic">Create "{problemInputValue}"</span>
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {problems?.map((p) => (
                          <CommandItem
                            key={p.generated_id}
                            onSelect={() => {
                              setProblemTitle(p.title)
                              setProblemGeneratedId(p.generated_id)
                              loadExistingProblem(p.id)
                              setProblemOpen(false)
                              setProblemInputValue('')
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${problemTitle === p.title ? 'opacity-100' : 'opacity-0'}`} />
                            <span className="truncate">{p.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Problem Description</Label>
              <Textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
          </Card>

          {/* Attempt Data */}
          <Card className="p-4 space-y-4 flex-1">
            <h3 className="font-semibold text-lg">Attempt Details</h3>

            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="successful"
                  checked={successful}
                  onCheckedChange={(c) => setSuccessful(c as boolean)}
                />
                <Label htmlFor="successful" className="cursor-pointer">Successful</Label>
              </div>

              <div>
                <Label>Time (min)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  placeholder="5.5"
                  className={capturedMinutes !== null ? 'bg-green-50 dark:bg-green-900/20 border-green-500/50' : ''}
                />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty?.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(d => (
                      <SelectItem key={d} value={d.toString()}>{'⭐'.repeat(d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={statusTag} onValueChange={(v) => setStatusTag(v as StatusTag)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_attempt">First</SelectItem>
                    <SelectItem value="stuck">Stuck</SelectItem>
                    <SelectItem value="breakthrough">Breakthrough</SelectItem>
                    <SelectItem value="debugging">Debugging</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Errors</Label>
                <Textarea 
                  value={errors} 
                  onChange={(e) => setErrors(e.target.value)} 
                  rows={3}
                  placeholder="What went wrong?"
                />
              </div>

              <div>
                <Label>Resolution</Label>
                <Textarea 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value)} 
                  rows={3}
                  placeholder="How did you fix it?"
                />
              </div>
            </div>

            <div>
              <Label>Commentary</Label>
              <Textarea 
                value={commentary} 
                onChange={(e) => setCommentary(e.target.value)} 
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            <div>
              <Label>Resources Used (comma-separated)</Label>
              <Popover open={resourcesOpen} onOpenChange={setResourcesOpen}>
                <PopoverTrigger asChild>
                  <Input 
                    value={resources} 
                    onChange={(e) => setResources(e.target.value)}
                    onFocus={() => setResourcesOpen(true)}
                    placeholder="e.g., Textbook p.45, StackOverflow, ChatGPT"
                  />
                </PopoverTrigger>
                {uniqueResources.length > 0 && (
                  <PopoverContent 
                    className="w-[400px] p-0" 
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      <CommandGroup heading="Previously Used">
                        {uniqueResources.slice(0, 10).map((resource) => (
                          <CommandItem
                            key={resource}
                            onSelect={() => {
                              const currentResources = resources.split(',').map(r => r.trim()).filter(r => r)
                              if (!currentResources.includes(resource)) {
                                setResources([...currentResources, resource].join(', '))
                              }
                            }}
                          >
                            {resource}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fresh-start"
                checked={isFreshStart} 
                onCheckedChange={(c) => setIsFreshStart(c as boolean)} 
              />
              <Label htmlFor="fresh-start" className="cursor-pointer">Fresh Start (New Batch)</Label>
            </div>
          </Card>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={logMutation.isPending}
          >
            {logMutation.isPending ? 'Logging...' : 'Log Attempt'}
          </Button>
        </div>
      </div>
    </form>
  )
}
