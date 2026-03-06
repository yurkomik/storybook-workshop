/* ============================================================================
   GameDropZone

   "Mission Zone" with pixelated border and retro arcade aesthetic.
   Flashing border and "INCOMING!" text on drag-over.
   ============================================================================ */

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import './GameUpload.css'

interface GameDropZoneProps {
  disabled?: boolean
  accept?: string[]
  maxFiles?: number
  forceDragOver?: boolean
  onFiles: (files: File[]) => void
}

export function GameDropZone({
  disabled = false,
  accept,
  maxFiles = 10,
  forceDragOver = false,
  onFiles,
}: GameDropZoneProps) {
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
      aria-label="Drop files here or click to browse"
      aria-disabled={disabled}
      className={cn(
        'game-pixel-border relative flex flex-col items-center justify-center gap-2 rounded-none p-6',
        'cursor-pointer font-mono transition-all duration-200',
        'bg-black/90 text-green-400',
        effectiveDragOver && 'game-border-blink game-shake',
        disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
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

      {effectiveDragOver ? (
        <>
          <span className="text-xl font-bold tracking-widest text-yellow-400">
            ! INCOMING !
          </span>
          <span className="text-xs text-yellow-400/70">Release to deploy files</span>
        </>
      ) : (
        <>
          <span className="text-sm font-bold tracking-wider uppercase">
            {'>> Mission Zone <<'}
          </span>
          <span className="text-xs text-green-400/60">
            Drop loot here or [CLICK] to browse
          </span>
        </>
      )}

      {/* Corner brackets for retro frame */}
      <span className="absolute left-2 top-2 text-green-400/40 text-xs font-bold">[</span>
      <span className="absolute right-2 top-2 text-green-400/40 text-xs font-bold">]</span>
      <span className="absolute bottom-2 left-2 text-green-400/40 text-xs font-bold">[</span>
      <span className="absolute bottom-2 right-2 text-green-400/40 text-xs font-bold">]</span>
    </div>
  )
}
