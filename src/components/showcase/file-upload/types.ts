/* ============================================================================
   FileUpload Types

   Shared type definitions for the FileUpload component suite.
   Separated into its own file so sub-components (DropZone, FileItem, FileList)
   can import without circular dependencies.
   ============================================================================ */

export interface FileUploadProps {
  /** Accepted file types, e.g. ['.pdf', '.png', 'image/*'] */
  accept?: string[]
  /** Maximum number of files allowed. Defaults to 1. */
  maxFiles?: number
  /** Maximum file size in bytes. Defaults to 10MB (10 * 1024 * 1024). */
  maxSizeBytes?: number
  /** Whether the upload zone is disabled */
  disabled?: boolean
  /** Visual variant: 'default' is full drop zone, 'compact' is smaller inline, 'minimal' is just a button */
  variant?: 'default' | 'compact' | 'minimal'
  /** Show thumbnail previews for image files */
  showPreview?: boolean
  /** Called when files are selected via drop or browse */
  onFilesSelected?: (files: File[]) => void
  /** Called when a file is removed from the list */
  onFileRemove?: (fileId: string) => void
  /** Called when a validation or upload error occurs */
  onError?: (error: FileUploadError) => void
}

export interface FileState {
  /** Unique identifier for this file entry */
  id: string
  /** The native File object */
  file: File
  /** Upload progress from 0 to 100 */
  progress: number
  /** Current status of the file */
  status: 'pending' | 'uploading' | 'complete' | 'error'
  /** Error message if status is 'error' */
  error?: string
  /** Object URL for image preview, created via URL.createObjectURL */
  previewUrl?: string
}

export interface FileUploadError {
  /** Category of the error for programmatic handling */
  type: 'file-too-large' | 'invalid-type' | 'too-many-files' | 'upload-failed'
  /** Human-readable error message */
  message: string
  /** Name of the file that caused the error, if applicable */
  fileName?: string
}
