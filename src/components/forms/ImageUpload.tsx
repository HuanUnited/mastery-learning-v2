import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  currentImage?: string
}

export function ImageUpload({ onImageChange, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onImageChange(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
  }

  return (
    <div className="space-y-2">
      <Label>Problem Image (Optional)</Label>
      
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Problem preview"
            className="max-w-md max-h-64 rounded border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="text-sm text-muted-foreground">
              Click to upload image<br />
              <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}
