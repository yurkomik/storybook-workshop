/* ============================================================================
   GalleryPreviewCard

   Image card with hover overlay showing file info + remove button.
   Uses aspect-ratio: 1 for uniform square thumbnails.
   ============================================================================ */

import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryFileState } from './types'
import './GalleryUpload.css'

interface GalleryPreviewCardProps {
  fileState: GalleryFileState
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

export function GalleryPreviewCard({
  fileState,
  disabled = false,
  onRemove,
}: GalleryPreviewCardProps) {
  const { id, file, progress, status, error, previewUrl } = fileState

  return (
    <div className={cn(
      'gallery-card-enter group relative aspect-square overflow-hidden rounded-lg',
      'border transition-all duration-200',
      status === 'error' ? 'border-destructive/50' : 'border-border',
      status === 'complete' && 'border-green-500/30',
    )}>
      {/* Image or placeholder */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="gallery-shimmer flex h-full w-full items-center justify-center bg-secondary">
          <span className="text-xs text-muted-foreground">{file.name.split('.').pop()?.toUpperCase()}</span>
        </div>
      )}

      {/* Upload progress overlay */}
      {status === 'uploading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          <Loader2 className="size-6 animate-spin text-white" />
          <span className="mt-1 text-xs font-medium tabular-nums text-white">{progress}%</span>
          {/* Bottom progress bar */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20">
            <div
              className="h-full bg-white transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Complete badge */}
      {status === 'complete' && (
        <div className="absolute right-1.5 top-1.5">
          <CheckCircle className="size-5 text-green-500 drop-shadow-md" />
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20">
          <AlertCircle className="size-6 text-destructive" />
          {error && (
            <span className="mt-1 max-w-[80%] text-center text-[10px] leading-tight text-destructive">
              {error}
            </span>
          )}
        </div>
      )}

      {/* Hover overlay with info + remove */}
      <div className={cn(
        'absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-2',
        'opacity-0 transition-opacity duration-200',
        'group-hover:opacity-100',
        status === 'error' && 'opacity-100',
      )}>
        <p className="truncate text-xs font-medium text-white">{file.name}</p>
        <p className="text-[10px] text-white/70">{formatFileSize(file.size)}</p>

        {/* Remove button */}
        <button
          type="button"
          aria-label={`Remove ${file.name}`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.(id)
          }}
          className={cn(
            'absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full',
            'bg-black/50 text-white/80 transition-colors',
            'hover:bg-destructive hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
