/* ============================================================================
   Folder Upload Types

   Re-exports shared types from file-upload and defines FolderUpload-specific
   props. The morphing folder variant reuses the same FileState / error model
   so it can compose the standard FileList component.
   ============================================================================ */

export type { FileState, FileUploadError } from '../file-upload/types'

export interface FolderUploadProps {
  /** Accepted file types, e.g. ['.pdf', 'image/*'] */
  accept?: string[]
  /** Maximum number of files allowed. Defaults to 5. */
  maxFiles?: number
  /** Maximum file size in bytes. Defaults to 10MB. */
  maxSizeBytes?: number
  /** Whether the upload zone is disabled */
  disabled?: boolean
  /** Custom label below folder */
  label?: string
  /** Custom sublabel (file type hints) */
  sublabel?: string
  /** Called when files are selected via drop or browse */
  onFilesSelected?: (files: File[]) => void
  /** Called when a file is removed from the list */
  onFileRemove?: (fileId: string) => void
  /** Called when a validation error occurs */
  onError?: (error: import('../file-upload/types').FileUploadError) => void
}
