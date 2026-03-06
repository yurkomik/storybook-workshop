/* ============================================================================
   ScifiDropZone

   Neon-bordered holographic zone with corner accents, scanline overlay,
   and floating particles. Glassmorphism with backdrop-blur.
   ============================================================================ */

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ScifiScanline } from './ScifiScanline'
import { ScifiParticles } from './ScifiParticles'
import './ScifiUpload.css'

interface ScifiDropZoneProps {
  disabled?: boolean
  accept?: string[]
  maxFiles?: number
  forceDragOver?: boolean
  /** Number of ambient particles */
  particleCount?: number
  onFiles: (files: File[]) => void
}

export function ScifiDropZone({
  disabled = false,
  accept,
  maxFiles = 10,
  forceDragOver = false,
  particleCount = 20,
  onFiles,
}: ScifiDropZoneProps) {
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
        'relative flex flex-col items-center justify-center gap-3 p-8 font-mono',
        'border rounded-lg overflow-hidden cursor-pointer',
        'backdrop-blur-md bg-white/5',
        'transition-all duration-300',
        effectiveDragOver
          ? 'scifi-border-shift scifi-neon-pulse border-[oklch(75%_0.15_195)]'
          : 'border-[oklch(75%_0.15_195_/_0.3)]',
        disabled && 'pointer-events-none opacity-30 cursor-not-allowed',
      )}
      style={{
        backgroundColor: 'oklch(12% 0.02 260 / 0.95)',
      }}
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

      {/* Corner accents */}
      <span className="scifi-corner-accent scifi-corner-tl absolute left-2 top-2" />
      <span className="scifi-corner-accent scifi-corner-tr absolute right-2 top-2" />
      <span className="scifi-corner-accent scifi-corner-bl absolute bottom-2 left-2" />
      <span className="scifi-corner-accent scifi-corner-br absolute bottom-2 right-2" />

      {/* Scanline */}
      <ScifiScanline />

      {/* Particles */}
      <ScifiParticles count={particleCount} />

      {/* Content */}
      <div className="relative z-10 text-center">
        {effectiveDragOver ? (
          <p className="scifi-text-flicker text-sm font-bold tracking-widest" style={{ color: 'oklch(75% 0.15 195)' }}>
            INCOMING SIGNAL DETECTED
          </p>
        ) : disabled ? (
          <p className="text-sm font-bold tracking-widest text-red-400/60">
            SYSTEM OFFLINE
          </p>
        ) : (
          <>
            <p className="text-sm font-bold tracking-wider" style={{ color: 'oklch(75% 0.15 195)' }}>
              {'// UPLOAD TERMINAL'}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'oklch(75% 0.15 195 / 0.5)' }}>
              Drop files to initiate transfer
              <span className="scifi-cursor-blink ml-1">_</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
