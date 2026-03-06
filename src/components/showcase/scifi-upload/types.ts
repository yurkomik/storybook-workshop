/* ============================================================================
   Sci-fi Upload Types

   Cyberpunk terminal themed upload types.
   ============================================================================ */

export interface ScifiUploadProps {
  accept?: string[]
  maxFiles?: number
  maxSizeBytes?: number
  disabled?: boolean
  onFilesSelected?: (files: File[]) => void
  onFileRemove?: (fileId: string) => void
  onError?: (error: ScifiUploadError) => void
}

export interface ScifiFileState {
  id: string
  file: File
  progress: number
  status: 'pending' | 'scanning' | 'uploading' | 'verified' | 'corrupted'
  error?: string
}

export interface ScifiUploadError {
  type: 'file-too-large' | 'invalid-type' | 'too-many-files' | 'upload-failed'
  message: string
  fileName?: string
}
