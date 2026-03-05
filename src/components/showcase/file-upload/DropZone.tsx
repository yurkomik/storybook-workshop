/* ============================================================================
   DropZone

   The drag-and-drop target area. Handles native HTML5 drag events and
   delegates to a hidden file input for click-to-browse. Uses CVA for
   variant management so the three visual modes share a single component.
   ============================================================================ */

import { useRef, useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { FileUploadProps } from './types'

const dropZoneVariants = cva(
  // Base styles shared by all variants
  'relative transition-colors duration-200',
  {
    variants: {
      variant: {
        default: [
          'flex flex-col items-center justify-center gap-3',
          'rounded-lg border-2 border-dashed border-border',
          'p-8 text-center',
          'hover:border-primary/50 hover:bg-accent/50',
          'cursor-pointer',
        ],
        compact: [
          'flex items-center gap-3',
          'rounded-md border border-dashed border-border',
          'px-4 py-3',
          'hover:border-primary/50 hover:bg-accent/50',
          'cursor-pointer',
        ],
        // Minimal variant does not render a drop zone at all -- just a button
        minimal: '',
      },
      isDragOver: {
        true: '',
        false: '',
      },
      isDisabled: {
        true: 'pointer-events-none opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      // Drag-over highlight differs per variant
      {
        variant: 'default',
        isDragOver: true,
        isDisabled: false,
        className: 'border-primary bg-primary/5 ring-2 ring-primary/20',
      },
      {
        variant: 'compact',
        isDragOver: true,
        isDisabled: false,
        className: 'border-primary bg-primary/5 ring-2 ring-primary/20',
      },
    ],
    defaultVariants: {
      variant: 'default',
      isDragOver: false,
      isDisabled: false,
    },
  }
)

type DropZoneVariants = VariantProps<typeof dropZoneVariants>

interface DropZoneProps {
  variant: NonNullable<FileUploadProps['variant']>
  accept?: string[]
  maxFiles?: number
  disabled?: boolean
  /** Externally controlled drag-over state for stories */
  forceDragOver?: boolean
  onFiles: (files: File[]) => void
}

/**
 * Build the `accept` attribute for the hidden file input.
 * Maps our array format to a comma-separated string.
 */
function buildAcceptString(accept?: string[]): string | undefined {
  if (!Array.isArray(accept) || accept.length === 0) return undefined
  return accept.join(',')
}

export function DropZone({
  variant,
  accept,
  maxFiles = 1,
  disabled = false,
  forceDragOver = false,
  onFiles,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Combine internal drag state with external force prop (for story DragOver)
  const effectiveDragOver = forceDragOver || isDragOver

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (disabled) return
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) onFiles(droppedFiles)
    },
    [disabled, onFiles]
  )

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? [])
      if (selectedFiles.length > 0) onFiles(selectedFiles)
      // Reset so the same file can be re-selected
      e.target.value = ''
    },
    [onFiles]
  )

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      className="hidden"
      accept={buildAcceptString(accept)}
      multiple={maxFiles > 1}
      disabled={disabled}
      onChange={handleInputChange}
    />
  )

  // Minimal variant: just a button, no drop zone
  if (variant === 'minimal') {
    return (
      <div>
        {hiddenInput}
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleClick}
          className="gap-2"
        >
          <Upload className="size-4" />
          Choose file{maxFiles > 1 ? 's' : ''}
        </Button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Drop files here or click to browse`}
      aria-disabled={disabled}
      className={cn(
        dropZoneVariants({
          variant,
          isDragOver: effectiveDragOver,
          isDisabled: disabled,
        })
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
      {hiddenInput}

      {variant === 'default' && (
        <>
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full',
              'bg-secondary text-muted-foreground',
              effectiveDragOver && 'bg-primary/10 text-primary'
            )}
          >
            <Upload className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {effectiveDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse
              {Array.isArray(accept) && accept.length > 0 && (
                <span className="ml-1">({accept.join(', ')})</span>
              )}
            </p>
          </div>
        </>
      )}

      {variant === 'compact' && (
        <>
          <Upload
            className={cn(
              'size-4 shrink-0 text-muted-foreground',
              effectiveDragOver && 'text-primary'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {effectiveDragOver ? 'Drop here' : 'Drop files or click to browse'}
          </span>
        </>
      )}
    </div>
  )
}
