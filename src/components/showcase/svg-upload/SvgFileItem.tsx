/* ============================================================================
   SvgFileItem

   File row with morphing SVG status icons.
   Checkmark draws itself via stroke-dashoffset animation.
   Error icon uses a shake animation.
   ============================================================================ */

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileState } from './types'
import './SvgUpload.css'

interface SvgFileItemProps {
  fileState: FileState
  disabled?: boolean
  onRemove?: (id: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function StatusIcon({ status, progress }: { status: FileState['status']; progress: number }) {
  const size = 20

  switch (status) {
    case 'pending':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" className="text-muted-foreground">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
      )

    case 'uploading':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" className="text-primary">
          {/* Track */}
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
          {/* Progress arc */}
          <circle
            cx="10" cy="10" r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 7}
            strokeDashoffset={2 * Math.PI * 7 * (1 - progress / 100)}
            transform="rotate(-90 10 10)"
            className="transition-all duration-200"
          />
        </svg>
      )

    case 'complete':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" className="text-green-600 dark:text-green-400">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <polyline
            points="6,10 9,13 14,7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="svg-upload-check"
          />
        </svg>
      )

    case 'error':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" className="text-destructive">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="7" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="13" y1="7" x2="7" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
  }
}

export function SvgFileItem({ fileState, disabled = false, onRemove }: SvgFileItemProps) {
  const { id, file, progress, status, error } = fileState

  return (
    <div
      className={cn(
        'svg-upload-file-enter group flex items-center gap-3 rounded-lg border p-3',
        'transition-colors duration-200',
        status === 'error' && 'border-destructive/40 bg-destructive/5',
        status === 'complete' && 'border-green-500/30 bg-green-500/5',
        status !== 'error' && status !== 'complete' && 'border-border bg-card',
      )}
    >
      {/* SVG Status Icon */}
      <div className="flex size-8 shrink-0 items-center justify-center">
        <StatusIcon status={status} progress={progress} />
      </div>

      {/* File info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
          {status === 'uploading' && (
            <span className="text-xs font-medium tabular-nums text-primary">{progress}%</span>
          )}
          {status === 'error' && error && (
            <span className="truncate text-xs text-destructive">{error}</span>
          )}
        </div>

        {/* Progress bar */}
        {status === 'uploading' && (
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        onClick={() => onRemove?.(id)}
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md',
          'text-muted-foreground transition-all duration-200',
          'hover:bg-destructive/10 hover:text-destructive',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          'opacity-0 group-hover:opacity-100',
          status === 'error' && 'opacity-100',
        )}
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
