/* ============================================================================
   Gallery Upload Types

   Gallery-specific types extending the base FileState pattern.
   Adds preview URL for image thumbnails.
   ============================================================================ */

export interface GalleryUploadProps {
  /** Accepted file types. Defaults to images only. */
  accept?: string[]
  /** Maximum number of files. Defaults to 12. */
  maxFiles?: number
  /** Maximum file size in bytes. Defaults to 10MB. */
  maxSizeBytes?: number
  /** Whether the component is disabled */
  disabled?: boolean
  /** Called when files are selected */
  onFilesSelected?: (files: File[]) => void
  /** Called when a file is removed */
  onFileRemove?: (fileId: string) => void
  /** Called on validation error */
  onError?: (error: GalleryUploadError) => void
}

export interface GalleryFileState {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
  /** Object URL or mock data URI for preview */
  previewUrl?: string
}

export interface GalleryUploadError {
  type: 'file-too-large' | 'invalid-type' | 'too-many-files' | 'upload-failed'
  message: string
  fileName?: string
}
