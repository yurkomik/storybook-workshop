/* ============================================================================
   GalleryUpload — Main Orchestrator

   Composes GalleryDropZone + GalleryGrid into a visual gallery experience.
   Creates preview URLs for image files.
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import { GalleryDropZone } from './GalleryDropZone'
import { GalleryGrid } from './GalleryGrid'
import type { GalleryUploadProps, GalleryFileState, GalleryUploadError } from './types'

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

function matchesAccept(file: File, accept: string[]): boolean {
  if (!Array.isArray(accept) || accept.length === 0) return true
  return accept.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase())
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -2))
    return file.type === pattern
  })
}

export function GalleryUpload({
  accept = ['image/*'],
  maxFiles = 12,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  onFilesSelected,
  onFileRemove,
  onError,
}: GalleryUploadProps) {
  const [files, setFiles] = useState<GalleryFileState[]>([])
  const uploadTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer))
      // Revoke all preview URLs
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const simulateUpload = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' as const } : f))
    )

    const timer = setInterval(() => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId)
        if (!file || file.status !== 'uploading') {
          clearInterval(timer)
          uploadTimers.current.delete(fileId)
          return prev
        }
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
      const errors: GalleryUploadError[] = []
      const validFiles: File[] = []

      const slotsAvailable = maxFiles - files.length
      if (incoming.length > slotsAvailable) {
        errors.push({
          type: 'too-many-files',
          message: `Maximum ${maxFiles} files allowed. ${files.length} already selected.`,
        })
        incoming = incoming.slice(0, Math.max(0, slotsAvailable))
      }

      for (const file of incoming) {
        if (Array.isArray(accept) && accept.length > 0 && !matchesAccept(file, accept)) {
          errors.push({
            type: 'invalid-type',
            message: `"${file.name}" is not accepted. Accepted: ${accept.join(', ')}`,
            fileName: file.name,
          })
          continue
        }
        if (file.size > maxSizeBytes) {
          errors.push({
            type: 'file-too-large',
            message: `"${file.name}" exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(1)} MB.`,
            fileName: file.name,
          })
          continue
        }
        validFiles.push(file)
      }

      for (const error of errors) onError?.(error)
      if (validFiles.length === 0) return

      const newStates: GalleryFileState[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending' as const,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }))

      setFiles((prev) => [...prev, ...newStates])
      onFilesSelected?.(validFiles)

      for (const fs of newStates) {
        setTimeout(() => simulateUpload(fs.id), 300)
      }
    },
    [accept, maxFiles, maxSizeBytes, files.length, onFilesSelected, onError, simulateUpload]
  )

  const handleRemove = useCallback(
    (id: string) => {
      const timer = uploadTimers.current.get(id)
      if (timer) {
        clearInterval(timer)
        uploadTimers.current.delete(id)
      }
      setFiles((prev) => {
        const file = prev.find((f) => f.id === id)
        if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl)
        return prev.filter((f) => f.id !== id)
      })
      onFileRemove?.(id)
    },
    [onFileRemove]
  )

  return (
    <div className="flex w-full flex-col gap-4">
      <GalleryDropZone
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled}
        onFiles={handleFiles}
      />
      <GalleryGrid
        files={files}
        disabled={disabled}
        onRemove={handleRemove}
      />
    </div>
  )
}
