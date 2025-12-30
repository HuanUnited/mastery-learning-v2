import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StatusTag } from '@/lib/types'
import { ImageUpload } from './ImageUpload'
import { useTimer } from '@/hooks/useTimer'
import { useState, useEffect } from 'react'




export function AttemptForm() {
  const formState = useFormPersistence()
  
  // Problem Desc & Image
  const [problemImage, setProblemImage] = useState<File | null>(null)
  const [problemDescription, setProblemDescription] = useState('')

  // Context fields (persisted)
  const [subject, setSubject] = useState(formState.subjectName)
  const [materialEn, setMaterialEn] = useState(formState.materialNameEn)
  const [materialRu, setMaterialRu] = useState(formState.materialNameRu)
  const [problemTitle, setProblemTitle] = useState(formState.problemTitle)
  
  // Attempt-specific fields (cleared after submit)
  const [successful, setSuccessful] = useState(false)
  const [timeSpent, setTimeSpent] = useState<string>('')

  const { capturedMinutes } = useTimer()

// Auto-fill from timer
useEffect(() => {
  if (capturedMinutes !== null) {
    setTimeSpent(capturedMinutes.toString())
  }
}, [capturedMinutes])
  const [difficulty, setDifficulty] = useState<number | undefined>()
  const [errors, setErrors] = useState('')
  const [resolution, setResolution] = useState('')
  const [commentary, setCommentary] = useState('')
  const [statusTag, setStatusTag] = useState<StatusTag | undefined>()
  const [resources, setResources] = useState('')
  const [isFreshStart, setIsFreshStart] = useState(false)

  // Timers

  
  const { mutate: logAttempt, isPending, data: lastResponse } = useMutation({
    mutationFn: api.logAttempt,
    onSuccess: (response) => {
      // Persist context for next attempt
      formState.setContext({
        subjectName: subject,
        materialNameEn: materialEn,
        materialNameRu: materialRu,
        problemTitle: problemTitle,
      })
      
      // Clear attempt-specific fields
      setSuccessful(false)
      setTimeSpent('')
      setDifficulty(undefined)
      setErrors('')
      setResolution('')
      setCommentary('')
      setStatusTag(undefined)
      setResources('')
      setIsFreshStart(false)
      setProblemImage(null)
      setProblemDescription('')

      
      console.log('✅ Logged attempt:', response)
    },
    onError: (error) => {
      console.error('❌ Error logging attempt:', error)
      alert(`Error: ${error}`)
    },
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!subject || !materialEn || !problemTitle) {
    alert('Please fill in Subject, Material, and Problem Title')
    return
  }

  // Handle image upload first if present
  let imageFilename: string | undefined
  if (problemImage) {
    try {
      const { invoke } = await import('@tauri-apps/api/tauri')
      
      // Read file as base64
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove data:image/...;base64, prefix
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(problemImage)
      })
      
      // Convert base64 to bytes
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      
      // Get file extension
      const ext = problemImage.name.split('.').pop() || 'png'
      
      // Save image
      const tempId = `temp_${Date.now()}`
      imageFilename = await invoke<string>('save_problem_image', {
        problemId: tempId,
        imageData: Array.from(bytes),
        extension: ext,
      })
      
      console.log('📷 Image uploaded:', imageFilename)
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image')
      return
    }
  }
  
  logAttempt({
    subjectName: subject,
    materialNameEn: materialEn,
    materialNameRu: materialRu || undefined,
    problemTitle: problemTitle,
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
      resources: resources ? resources.split(',').map(r => r.trim()) : [],
    },
    isFreshStart,
  })
}
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Log Attempt</h2>
        
        {lastResponse && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              ✅ Logged Attempt #{lastResponse.attempt_number} for {lastResponse.generated_id}
              {lastResponse.batch_closed && ' (New Batch Started)'}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Context Section */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold text-sm text-muted-foreground">Problem Context</h3>
            
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Data Structures"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materialEn">Material (English) *</Label>
                <Input
                  id="materialEn"
                  value={materialEn}
                  onChange={(e) => setMaterialEn(e.target.value)}
                  placeholder="e.g., Calculus Chapter 3"
                />
              </div>
              
              <div>
                <Label htmlFor="materialRu">Material (Russian)</Label>
                <Input
                  id="materialRu"
                  value={materialRu}
                  onChange={(e) => setMaterialRu(e.target.value)}
                  placeholder="e.g., Математический анализ"
                />
              </div>
            </div>
            
            <div>
  <Label htmlFor="problemDescription">Problem Description</Label>
  <Textarea
    id="problemDescription"
    value={problemDescription}
    onChange={(e) => setProblemDescription(e.target.value)}
    placeholder="Describe the problem or theorem..."
    rows={2}
  />
</div>

<ImageUpload
  onImageChange={setProblemImage}
/>

            <div>
              <Label htmlFor="problemTitle">Problem Title *</Label>
              <Input
                id="problemTitle"
                value={problemTitle}
                onChange={(e) => setProblemTitle(e.target.value)}
                placeholder="e.g., Derivative of x^3"
              />
            </div>
          </div>
          
          {/* Attempt Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Attempt Details</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="successful"
                checked={successful}
                onCheckedChange={(checked) => setSuccessful(checked as boolean)}
              />
              <Label htmlFor="successful">Successful</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  step="0.1"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  placeholder="e.g., 15.5"
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Select
                  value={difficulty?.toString()}
                  onValueChange={(val) => setDifficulty(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">⭐ Very Easy</SelectItem>
                    <SelectItem value="2">⭐⭐ Easy</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Medium</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Hard</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Very Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="statusTag">Status</Label>
              <Select
                value={statusTag}
                onValueChange={(val) => setStatusTag(val as StatusTag)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_attempt">🆕 First Attempt</SelectItem>
                  <SelectItem value="stuck">🚫 Stuck</SelectItem>
                  <SelectItem value="breakthrough">💡 Breakthrough</SelectItem>
                  <SelectItem value="debugging">🐛 Debugging</SelectItem>
                  <SelectItem value="review">📝 Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="errors">Errors / What Went Wrong</Label>
              <Textarea
                id="errors"
                value={errors}
                onChange={(e) => setErrors(e.target.value)}
                placeholder="Describe what didn't work..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="resolution">Resolution / What Fixed It</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="How did you solve it or make progress?"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="commentary">Commentary / Notes</Label>
              <Textarea
                id="commentary"
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Additional thoughts, insights, etc."
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="resources">Resources Used (comma-separated)</Label>
              <Input
                id="resources"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                placeholder="e.g., ChatGPT, Textbook p.42, Stack Overflow"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="freshStart"
                checked={isFreshStart}
                onCheckedChange={(checked) => setIsFreshStart(checked as boolean)}
              />
              <Label htmlFor="freshStart">Mark as Fresh Start (new batch)</Label>
            </div>
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Logging...' : 'Log Attempt'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
