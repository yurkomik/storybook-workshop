/* ============================================================================
   ScifiFileItem

   Terminal-style file processing row.
   Format: > SCANNING: filename.pdf [===     ] 42%
   Uses monospace font and custom OKLCH colors.
   ============================================================================ */

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScifiFileState } from './types'
import './ScifiUpload.css'

interface ScifiFileItemProps {
  fileState: ScifiFileState
  disabled?: boolean
  onRemove?: (id: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)}${units[i]}`
}

function getStatusLabel(status: ScifiFileState['status']): string {
  switch (status) {
    case 'pending': return 'QUEUED'
    case 'scanning': return 'SCANNING'
    case 'uploading': return 'TRANSMITTING'
    case 'verified': return 'VERIFIED'
    case 'corrupted': return 'CORRUPTED'
  }
}

function getStatusColor(status: ScifiFileState['status']): string {
  switch (status) {
    case 'pending': return 'oklch(75% 0.15 195 / 0.4)'
    case 'scanning': return 'oklch(80% 0.2 145)'
    case 'uploading': return 'oklch(75% 0.15 195)'
    case 'verified': return 'oklch(80% 0.2 145)'
    case 'corrupted': return 'oklch(65% 0.25 25)'
  }
}

export function ScifiFileItem({ fileState, disabled = false, onRemove }: ScifiFileItemProps) {
  const { id, file, progress, status, error } = fileState
  const color = getStatusColor(status)
  const label = getStatusLabel(status)

  // Build progress bar characters
  const barWidth = 12
  const filled = Math.round((progress / 100) * barWidth)
  const bar = '='.repeat(filled) + ' '.repeat(barWidth - filled)

  return (
    <div
      className={cn(
        'group flex items-center gap-2 border-b px-3 py-2 font-mono text-xs',
        'transition-all duration-200',
        status === 'corrupted' && 'scifi-glitch',
      )}
      style={{
        borderColor: 'oklch(75% 0.15 195 / 0.1)',
        backgroundColor: status === 'corrupted' ? 'oklch(65% 0.25 25 / 0.05)' : 'transparent',
      }}
    >
      {/* Prompt character */}
      <span style={{ color }} className={cn(
        status === 'uploading' && 'scifi-text-flicker',
        status === 'scanning' && 'scifi-text-flicker',
      )}>
        {'>'}
      </span>

      {/* Status + filename */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span style={{ color }} className="shrink-0 font-bold">
            {label}:
          </span>
          <span className="truncate" style={{ color: 'oklch(75% 0.15 195 / 0.7)' }}>
            {file.name}
          </span>
          <span className="shrink-0" style={{ color: 'oklch(75% 0.15 195 / 0.3)' }}>
            ({formatFileSize(file.size)})
          </span>
        </div>

        {/* Progress bar for uploading/scanning */}
        {(status === 'uploading' || status === 'scanning') && (
          <div className="flex items-center gap-1">
            <span style={{ color: 'oklch(75% 0.15 195 / 0.5)' }}>[</span>
            <span style={{ color }} className="tracking-widest">{bar}</span>
            <span style={{ color: 'oklch(75% 0.15 195 / 0.5)' }}>]</span>
            <span style={{ color }} className="tabular-nums">{progress}%</span>
          </div>
        )}

        {/* Error message */}
        {status === 'corrupted' && error && (
          <span style={{ color: 'oklch(65% 0.25 25)' }}>
            ERROR: {error}
          </span>
        )}

        {/* Verified checksum */}
        {status === 'verified' && (
          <span style={{ color: 'oklch(80% 0.2 145 / 0.6)' }}>
            CHECKSUM OK // TRANSFER COMPLETE
          </span>
        )}
      </div>

      {/* Cursor indicator for active item */}
      {(status === 'uploading' || status === 'scanning') && (
        <span className="scifi-cursor-blink shrink-0" style={{ color }}>_</span>
      )}

      {/* Remove */}
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        onClick={() => onRemove?.(id)}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-sm',
          'transition-all duration-200',
          'opacity-0 group-hover:opacity-100',
          status === 'corrupted' && 'opacity-100',
          'disabled:pointer-events-none',
        )}
        style={{ color: 'oklch(75% 0.15 195 / 0.3)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'oklch(65% 0.25 25)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'oklch(75% 0.15 195 / 0.3)' }}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
