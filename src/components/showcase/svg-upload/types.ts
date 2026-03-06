/* ============================================================================
   SVG Upload Types

   Extends the base FileState pattern from FileUpload.
   Adds SVG-specific visual states for the cloud animation.
   ============================================================================ */

export interface SvgUploadProps {
  /** Accepted file types, e.g. ['.pdf', 'image/*'] */
  accept?: string[]
  /** Maximum number of files allowed. Defaults to 5. */
  maxFiles?: number
  /** Maximum file size in bytes. Defaults to 10MB. */
  maxSizeBytes?: number
  /** Whether the upload zone is disabled */
  disabled?: boolean
  /** Called when files are selected via drop or browse */
  onFilesSelected?: (files: File[]) => void
  /** Called when a file is removed from the list */
  onFileRemove?: (fileId: string) => void
  /** Called when a validation error occurs */
  onError?: (error: SvgUploadError) => void
}

export interface FileState {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

export interface SvgUploadError {
  type: 'file-too-large' | 'invalid-type' | 'too-many-files' | 'upload-failed'
  message: string
  fileName?: string
}
