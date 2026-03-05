/* ============================================================================
   FileList

   Container for selected files. Renders FileItem rows in a vertical stack.
   Separated so that layout concerns (spacing, animation) live here while
   individual file rendering logic stays in FileItem.
   ============================================================================ */

import { FileItem } from './FileItem'
import type { FileState } from './types'

interface FileListProps {
  files: FileState[]
  showPreview?: boolean
  disabled?: boolean
  onRemove?: (id: string) => void
}

export function FileList({
  files,
  showPreview = false,
  disabled = false,
  onRemove,
}: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {files.map((fileState) => (
        <FileItem
          key={fileState.id}
          fileState={fileState}
          showPreview={showPreview}
          disabled={disabled}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
