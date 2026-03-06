/* ============================================================================
   SvgDropZone

   Inline SVG cloud shape with animated arrow and particle effects.
   The cloud is hand-crafted SVG — no icon library — for full animation control.
   Progress is shown as an SVG circle ring around the cloud.
   ============================================================================ */

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import './SvgUpload.css'

interface SvgDropZoneProps {
  disabled?: boolean
  accept?: string[]
  maxFiles?: number
  /** Force drag-over visual for stories */
  forceDragOver?: boolean
  /** Overall upload progress 0-100 (average of all files) */
  progress?: number
  /** Whether any files are currently uploading */
  isUploading?: boolean
  onFiles: (files: File[]) => void
}

function buildAcceptString(accept?: string[]): string | undefined {
  if (!Array.isArray(accept) || accept.length === 0) return undefined
  return accept.join(',')
}

export function SvgDropZone({
  disabled = false,
  accept,
  maxFiles = 5,
  forceDragOver = false,
  progress = 0,
  isUploading = false,
  onFiles,
}: SvgDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const effectiveDragOver = forceDragOver || isDragOver

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setJustDropped(true)
      setTimeout(() => setJustDropped(false), 400)
      onFiles(files)
    }
  }, [disabled, onFiles])

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFiles(files)
    e.target.value = ''
  }, [onFiles])

  // Progress ring math
  const ringRadius = 58
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (progress / 100) * ringCircumference

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop files here or click to browse"
      aria-disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8',
        'transition-all duration-300 cursor-pointer select-none',
        'border-border bg-background hover:border-primary/40 hover:bg-accent/30',
        effectiveDragOver && 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]',
        justDropped && 'svg-upload-bounce',
        disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={buildAcceptString(accept)}
        multiple={maxFiles > 1}
        disabled={disabled}
        onChange={handleInputChange}
      />

      {/* Particles on drag-over */}
      {effectiveDragOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="svg-particle" />
          ))}
        </div>
      )}

      {/* SVG Cloud with Arrow */}
      <div className={cn('relative', effectiveDragOver && 'svg-upload-pulse')}>
        <svg
          width="120"
          height="100"
          viewBox="0 0 120 100"
          fill="none"
          className={cn(
            'transition-transform duration-300',
            effectiveDragOver && 'scale-110',
          )}
        >
          {/* Progress ring (behind cloud) */}
          {isUploading && (
            <circle
              cx="60"
              cy="50"
              r={ringRadius}
              stroke="oklch(55% 0.15 250 / 0.15)"
              strokeWidth="3"
              fill="none"
            />
          )}
          {isUploading && (
            <circle
              cx="60"
              cy="50"
              r={ringRadius}
              stroke="oklch(55% 0.15 250)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              className="transition-all duration-300"
              transform="rotate(-90 60 50)"
            />
          )}

          {/* Cloud body */}
          <path
            d="M30 65 C15 65 8 55 12 45 C10 35 18 25 30 27 C33 15 48 10 58 18 C65 10 82 10 88 22 C100 20 110 30 108 42 C115 50 110 62 98 65 Z"
            className={cn(
              'transition-all duration-300',
              effectiveDragOver
                ? 'fill-primary/10 stroke-primary'
                : 'fill-secondary stroke-border',
            )}
            strokeWidth="2"
          />

          {/* Upload arrow */}
          <g className={cn(!effectiveDragOver && !isUploading && 'svg-upload-float')}>
            <line
              x1="60" y1="58" x2="60" y2="35"
              className={cn(
                'transition-colors duration-300',
                effectiveDragOver ? 'stroke-primary' : 'stroke-muted-foreground',
              )}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polyline
              points="48,45 60,33 72,45"
              className={cn(
                'transition-colors duration-300',
                effectiveDragOver ? 'stroke-primary' : 'stroke-muted-foreground',
              )}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>

        {/* Upload progress percentage */}
        {isUploading && (
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-xs font-semibold tabular-nums text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="space-y-1 text-center">
        <p className={cn(
          'text-sm font-medium transition-colors duration-200',
          effectiveDragOver ? 'text-primary' : 'text-foreground',
        )}>
          {effectiveDragOver ? 'Release to upload' : 'Drag & drop your files'}
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse
          {Array.isArray(accept) && accept.length > 0 && (
            <span className="ml-1">({accept.join(', ')})</span>
          )}
        </p>
      </div>
    </div>
  )
}
