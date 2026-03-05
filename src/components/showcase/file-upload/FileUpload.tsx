/* ============================================================================
   FileUpload — Main Orchestrator

   Composes DropZone + FileList into a complete upload experience.
   Manages file state, validation, and simulated upload progress.

   Architecture decisions:
   - State is fully internal (uncontrolled) — the parent only receives callbacks.
     This keeps the API simple for the common case. A controlled version could
     be added later by lifting `files` into props.
   - Upload progress is simulated via setInterval to demonstrate the UI states
     without requiring a real backend. The simulation advances in random
     increments to look realistic.
   - File IDs use crypto.randomUUID() for uniqueness without external deps.
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import { DropZone } from './DropZone'
import { FileList } from './FileList'
import type { FileUploadProps, FileState, FileUploadError } from './types'

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Check whether a File's type matches an accept pattern.
 * Supports exact extensions (.pdf), exact MIME types (image/png),
 * and wildcard MIME types (image/*).
 */
function matchesAccept(file: File, accept: string[]): boolean {
  if (!Array.isArray(accept) || accept.length === 0) return true

  return accept.some((pattern) => {
    // Extension pattern like ".pdf"
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase())
    }
    // Wildcard MIME like "image/*"
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2)
      return file.type.startsWith(prefix)
    }
    // Exact MIME match
    return file.type === pattern
  })
}

export function FileUpload({
  accept,
  maxFiles = 1,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  variant = 'default',
  showPreview = false,
  onFilesSelected,
  onFileRemove,
  onError,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileState[]>([])

  // Track interval IDs so we can clean up on unmount
  const uploadTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer))
    }
  }, [])

  /**
   * Simulate an upload for a given file. Advances progress in ~100ms ticks
   * with random increments so the bar doesn't look robotic.
   */
  const simulateUpload = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'uploading' as const } : f
      )
    )

    const timer = setInterval(() => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId)
        if (!file || file.status !== 'uploading') {
          clearInterval(timer)
          uploadTimers.current.delete(fileId)
          return prev
        }

        // Random increment between 5 and 15 to look natural
        const increment = Math.floor(Math.random() * 11) + 5
        const newProgress = Math.min(file.progress + increment, 100)

        return prev.map((f) => {
          if (f.id !== fileId) return f
          if (newProgress >= 100) {
            clearInterval(timer)
            uploadTimers.current.delete(fileId)
            return { ...f, progress: 100, status: 'complete' as const }
          }
          return { ...f, progress: newProgress }
        })
      })
    }, 100)

    uploadTimers.current.set(fileId, timer)
  }, [])

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const errors: FileUploadError[] = []
      const validFiles: File[] = []

      // Check total count constraint
      const slotsAvailable = maxFiles - files.length
      if (incoming.length > slotsAvailable) {
        errors.push({
          type: 'too-many-files',
          message: `Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed. ${files.length} already selected.`,
        })
        // Still try to accept as many as we can
        incoming = incoming.slice(0, Math.max(0, slotsAvailable))
      }

      for (const file of incoming) {
        // Type validation
        if (Array.isArray(accept) && accept.length > 0 && !matchesAccept(file, accept)) {
          errors.push({
            type: 'invalid-type',
            message: `"${file.name}" is not an accepted file type. Accepted: ${accept.join(', ')}`,
            fileName: file.name,
          })
          continue
        }

        // Size validation
        if (file.size > maxSizeBytes) {
          const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
          errors.push({
            type: 'file-too-large',
            message: `"${file.name}" exceeds the ${maxMB} MB limit.`,
            fileName: file.name,
          })
          continue
        }

        validFiles.push(file)
      }

      // Report errors
      for (const error of errors) {
        onError?.(error)
      }

      if (validFiles.length === 0) return

      // Create FileState entries
      const newFileStates: FileState[] = validFiles.map((file) => {
        const id = crypto.randomUUID()
        return {
          id,
          file,
          progress: 0,
          status: 'pending' as const,
          previewUrl:
            showPreview && file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined,
        }
      })

      setFiles((prev) => [...prev, ...newFileStates])
      onFilesSelected?.(validFiles)

      // Start simulated uploads
      for (const fs of newFileStates) {
        // Small delay before starting so the user sees "pending" briefly
        setTimeout(() => simulateUpload(fs.id), 300)
      }
    },
    [accept, maxFiles, maxSizeBytes, files.length, showPreview, onFilesSelected, onError, simulateUpload]
  )

  const handleRemove = useCallback(
    (id: string) => {
      // Clear any running upload timer
      const timer = uploadTimers.current.get(id)
      if (timer) {
        clearInterval(timer)
        uploadTimers.current.delete(id)
      }

      setFiles((prev) => {
        const file = prev.find((f) => f.id === id)
        // Revoke object URL to prevent memory leaks
        if (file?.previewUrl) {
          URL.revokeObjectURL(file.previewUrl)
        }
        return prev.filter((f) => f.id !== id)
      })

      onFileRemove?.(id)
    },
    [onFileRemove]
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <DropZone
        variant={variant}
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled}
        onFiles={handleFiles}
      />
      <FileList
        files={files}
        showPreview={showPreview}
        disabled={disabled}
        onRemove={handleRemove}
      />
    </div>
  )
}
