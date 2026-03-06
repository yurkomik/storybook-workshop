/* ============================================================================
   FolderDropZone

   A morphing folder that opens when files are dragged over or clicked.
   Built from layered divs with CSS 3D transforms — the FRONT panel tilts
   toward the viewer via rotateX(25deg), creating a gap for the file card
   to slowly descend into from above.

   Layer stack (back to front):
     1. Glow        — radial gradient behind everything
     2. Back panel   — lighter purple with folder tab (static body)
     3. File card    — white card that descends into the folder
     4. Front panel  — solid purple with upload arrow (tilts open)
   ============================================================================ */

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import './FolderUpload.css'

interface FolderDropZoneProps {
  disabled?: boolean
  accept?: string[]
  maxFiles?: number
  /** Force drag-over visual for stories */
  forceDragOver?: boolean
  /** Force error visual for stories */
  forceError?: boolean
  /** Show the file card in the folder (after a file was dropped) */
  showFileCard?: boolean
  /** Name to display on the file card */
  fileCardName?: string
  /** Whether the folder is in an error state */
  hasError?: boolean
  /** Error message to display below the folder */
  errorMessage?: string
  /** Custom label below folder */
  label?: string
  /** Custom sublabel */
  sublabel?: string
  onFiles: (files: File[]) => void
}

function buildAcceptString(accept?: string[]): string | undefined {
  if (!Array.isArray(accept) || accept.length === 0) return undefined
  return accept.join(',')
}

export function FolderDropZone({
  disabled = false,
  accept,
  maxFiles = 5,
  forceDragOver = false,
  forceError = false,
  showFileCard = false,
  fileCardName,
  hasError = false,
  errorMessage,
  label,
  sublabel,
  onFiles,
}: FolderDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Nested SVG/content emits extra dragenter/dragleave events as the cursor moves around.
  const dragDepthRef = useRef(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [justDropped, setJustDropped] = useState(false)
  const effectiveDragOver = forceDragOver || isDragOver
  const effectiveError = forceError || hasError

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    dragDepthRef.current += 1
    setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setIsDragOver(false)
    }
  }, [disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setIsDragOver(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setJustDropped(true)
      setTimeout(() => setJustDropped(false), 1200)
      onFiles(files)
    }
  }, [disabled, onFiles])

  const handleClick = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFiles(files)
    e.target.value = ''
  }, [onFiles])

  const isOpen = effectiveDragOver || justDropped || showFileCard

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop files here or click to browse"
      aria-disabled={disabled}
      className={cn(
        'folder-dropzone relative flex flex-col items-center justify-center gap-4 rounded-xl p-8 outline-none',
        'transition-all duration-300 cursor-pointer select-none',
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

      {/* Folder 3D scene */}
      <div className={cn(
        'folder-scene relative overflow-visible',
        justDropped && 'folder-bounce',
        effectiveError && 'folder-shake',
      )}>
        {/* Glow layer — behind everything, visible during open + error */}
        <div
          className={cn(
            'folder-glow-layer pointer-events-none absolute inset-0 -inset-x-4 -inset-y-2 rounded-3xl',
            'transition-opacity duration-350',
            (isOpen || effectiveError) ? 'opacity-100' : 'opacity-0',
            effectiveDragOver && !effectiveError && 'folder-glow-pulse',
            effectiveError && 'folder-error-glow-pulse',
          )}
          style={{
            background: effectiveError
              ? 'radial-gradient(ellipse at center, oklch(65% 0.2 25 / 0.35) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, oklch(70% 0.15 280 / 0.35) 0%, transparent 70%)',
          }}
        />

        {/* Folder container — preserve-3d so children live in 3D space */}
        <div className="folder-stage relative overflow-visible" style={{ width: 200, height: 160, transformStyle: 'preserve-3d' }}>

          {/* Back panel — static folder body with tab */}
          <div className="folder-back-panel absolute inset-0">
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
              {/* Single silhouette avoids a seam where the tab meets the body */}
              <path
                d="M20 20V8Q20 2 26 2H70Q76 2 78 8L84 20H180Q192 20 192 32V138Q192 150 180 150H20Q8 150 8 138V32Q8 20 20 20Z"
                className="transition-all duration-300"
                fill={effectiveError ? 'oklch(75% 0.12 25 / 0.7)' : 'oklch(78% 0.10 280 / 0.7)'}
                stroke={effectiveError ? 'oklch(65% 0.15 25 / 0.5)' : 'oklch(70% 0.12 280 / 0.5)'}
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* File card — descends slowly into the folder from above */}
          {(showFileCard || justDropped) && (
            <div
              className="folder-file-card-slot absolute"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={cn(
                'flex w-[120px] items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-lg',
                justDropped ? 'folder-file-card-enter' : 'folder-file-card-idle',
              )}>
                {/* Mini file icon */}
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="shrink-0">
                  <path
                    d="M0 2C0 0.9 0.9 0 2 0H10L16 6V18C16 19.1 15.1 20 14 20H2C0.9 20 0 19.1 0 18V2Z"
                    fill="oklch(85% 0.05 250)"
                  />
                  <path d="M10 0L16 6H12C10.9 6 10 5.1 10 4V0Z" fill="oklch(75% 0.08 250)" />
                </svg>
                <span className="truncate text-[10px] font-medium text-gray-700">
                  {fileCardName ?? 'Document.pdf'}
                </span>
              </div>
            </div>
          )}

          {/* Front panel — tilts OPEN toward viewer on drag/click */}
          <div
            className="folder-front-panel absolute inset-0"
            data-open={isOpen}
            data-error={effectiveError}
          >
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
              {/* Main body */}
              <rect
                x="8" y="40" width="184" height="112"
                rx="12"
                className="transition-[stroke] duration-300"
                fill={effectiveError ? 'oklch(63% 0.17 25)' : 'oklch(70% 0.15 280)'}
                stroke={effectiveError ? 'oklch(55% 0.18 25 / 0.4)' : 'oklch(65% 0.15 280 / 0.4)'}
                strokeWidth="1"
              />

              {/* Upload arrow — bobs when idle, X icon on error */}
              {effectiveError ? (
                <g>
                  <line x1="88" y1="82" x2="112" y2="106" stroke="oklch(90% 0.05 25)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="112" y1="82" x2="88" y2="106" stroke="oklch(90% 0.05 25)" strokeWidth="3" strokeLinecap="round" />
                </g>
              ) : (
                <g className={cn(!isOpen && 'folder-float')}>
                  <line
                    x1="100" y1="108" x2="100" y2="78"
                    stroke="oklch(95% 0.02 280)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="86,90 100,76 114,90"
                    stroke="oklch(95% 0.02 280)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Text below folder */}
      <div className="space-y-1 text-center">
        <p className={cn(
          'text-sm font-medium transition-colors duration-200',
          effectiveError
            ? 'text-destructive'
            : isOpen
              ? 'text-[oklch(72%_0.14_280)]'
              : 'text-foreground',
        )}>
          {effectiveError
            ? 'Upload failed'
            : effectiveDragOver
              ? 'Release to upload'
              : label ?? 'Drop files into the folder'}
        </p>
        {effectiveError && errorMessage ? (
          <p className="text-xs text-destructive/80">{errorMessage}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {sublabel ?? (
              <>
                or click to browse
                {Array.isArray(accept) && accept.length > 0 && (
                  <span className="ml-1">({accept.join(', ')})</span>
                )}
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
