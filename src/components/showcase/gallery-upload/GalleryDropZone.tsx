/* ============================================================================
   GalleryDropZone

   Elegant drop area with camera icon and pulsing border.
   Designed for a visual-first gallery experience.
   ============================================================================ */

import { useRef, useState, useCallback } from 'react'
import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import './GalleryUpload.css'

interface GalleryDropZoneProps {
  disabled?: boolean
  accept?: string[]
  maxFiles?: number
  forceDragOver?: boolean
  onFiles: (files: File[]) => void
}

export function GalleryDropZone({
  disabled = false,
  accept,
  maxFiles = 12,
  forceDragOver = false,
  onFiles,
}: GalleryDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
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
    if (files.length > 0) onFiles(files)
  }, [disabled, onFiles])

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFiles(files)
    e.target.value = ''
  }, [onFiles])

  const acceptString = Array.isArray(accept) && accept.length > 0 ? accept.join(',') : undefined

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop images here or click to browse"
      aria-disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6',
        'transition-all duration-300 cursor-pointer',
        'border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30',
        effectiveDragOver && 'border-primary bg-primary/5 ring-2 ring-primary/20 gallery-drop-pulse',
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
        accept={acceptString}
        multiple={maxFiles > 1}
        disabled={disabled}
        onChange={handleInputChange}
      />

      <div className={cn(
        'flex size-12 items-center justify-center rounded-full transition-colors duration-300',
        effectiveDragOver ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground',
      )}>
        <Camera className="size-5" />
      </div>

      <div className="text-center">
        <p className={cn(
          'text-sm font-medium transition-colors',
          effectiveDragOver ? 'text-primary' : 'text-foreground',
        )}>
          {effectiveDragOver ? 'Drop your images' : 'Add photos to gallery'}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Drag & drop or click to browse
        </p>
      </div>
    </div>
  )
}
