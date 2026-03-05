/* ============================================================================
   FileItem

   Renders a single file row: icon, name, size, progress bar, status badge,
   and a remove button. Uses the Progress component from ui/ for the bar.
   Picks an icon based on MIME type so images/PDFs/text get distinct visuals.
   ============================================================================ */

import {
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import type { FileState } from './types'

interface FileItemProps {
  fileState: FileState
  showPreview?: boolean
  disabled?: boolean
  onRemove?: (id: string) => void
}

/**
 * Pick an appropriate icon based on the file's MIME type.
 * Falls back to a generic file icon for unknown types.
 */
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon
  if (type === 'application/pdf' || type.startsWith('text/')) return FileText
  return FileIcon
}

/**
 * Format bytes into a human-readable string (KB, MB, GB).
 * Uses 1024-based units since that matches user expectations for file sizes.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function FileItem({
  fileState,
  showPreview = false,
  disabled = false,
  onRemove,
}: FileItemProps) {
  const { id, file, progress, status, error, previewUrl } = fileState
  const Icon = getFileIcon(file.type)

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-md border border-border bg-card p-3',
        'transition-colors duration-150',
        status === 'error' && 'border-destructive/50 bg-destructive/5',
        status === 'complete' && 'border-primary/30 bg-primary/5'
      )}
    >
      {/* File icon or thumbnail preview */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
        {showPreview && previewUrl && file.type.startsWith('image/') ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="size-10 rounded-md object-cover"
          />
        ) : (
          <Icon className="size-5 text-muted-foreground" />
        )}
      </div>

      {/* File info and progress */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {file.name}
          </p>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>

          {/* Progress bar -- only visible during upload */}
          {status === 'uploading' && (
            <div className="flex-1">
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Error message */}
          {status === 'error' && error && (
            <span className="truncate text-xs text-destructive">{error}</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        onClick={() => onRemove?.(id)}
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md',
          'text-muted-foreground transition-colors',
          'hover:bg-destructive/10 hover:text-destructive',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          // Subtle on idle, visible on hover
          'opacity-0 group-hover:opacity-100',
          // Always visible on touch / when file has error
          status === 'error' && 'opacity-100'
        )}
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  StatusBadge — small inline indicator for file status                       */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: FileState['status'] }) {
  switch (status) {
    case 'pending':
      return null
    case 'uploading':
      return (
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
      )
    case 'complete':
      return (
        <CheckCircle className="size-4 shrink-0 text-green-600 dark:text-green-400" />
      )
    case 'error':
      return (
        <AlertCircle className="size-4 shrink-0 text-destructive" />
      )
  }
}
