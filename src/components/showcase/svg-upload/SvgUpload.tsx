/* ============================================================================
   SvgUpload — Main Orchestrator

   Same state pattern as FileUpload: uncontrolled with callbacks.
   Composes SvgDropZone + SvgFileItem with SVG-themed visuals.
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import { SvgDropZone } from './SvgDropZone'
import { SvgFileItem } from './SvgFileItem'
import type { SvgUploadProps, FileState, SvgUploadError } from './types'

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

function matchesAccept(file: File, accept: string[]): boolean {
  if (!Array.isArray(accept) || accept.length === 0) return true
  return accept.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase())
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -2))
    return file.type === pattern
  })
}

export function SvgUpload({
  accept,
  maxFiles = 5,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  onFilesSelected,
  onFileRemove,
  onError,
}: SvgUploadProps) {
  const [files, setFiles] = useState<FileState[]>([])
  const uploadTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer))
    }
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
      const errors: SvgUploadError[] = []
      const validFiles: File[] = []

      const slotsAvailable = maxFiles - files.length
      if (incoming.length > slotsAvailable) {
        errors.push({
          type: 'too-many-files',
          message: `Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed. ${files.length} already selected.`,
        })
        incoming = incoming.slice(0, Math.max(0, slotsAvailable))
      }

      for (const file of incoming) {
        if (Array.isArray(accept) && accept.length > 0 && !matchesAccept(file, accept)) {
          errors.push({
            type: 'invalid-type',
            message: `"${file.name}" is not an accepted type. Accepted: ${accept.join(', ')}`,
            fileName: file.name,
          })
          continue
        }
        if (file.size > maxSizeBytes) {
          errors.push({
            type: 'file-too-large',
            message: `"${file.name}" exceeds the ${(maxSizeBytes / (1024 * 1024)).toFixed(1)} MB limit.`,
            fileName: file.name,
          })
          continue
        }
        validFiles.push(file)
      }

      for (const error of errors) onError?.(error)
      if (validFiles.length === 0) return

      const newFileStates: FileState[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending' as const,
      }))

      setFiles((prev) => [...prev, ...newFileStates])
      onFilesSelected?.(validFiles)

      for (const fs of newFileStates) {
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
      setFiles((prev) => prev.filter((f) => f.id !== id))
      onFileRemove?.(id)
    },
    [onFileRemove]
  )

  // Calculate aggregate progress for the ring
  const uploadingFiles = files.filter((f) => f.status === 'uploading')
  const avgProgress =
    uploadingFiles.length > 0
      ? uploadingFiles.reduce((sum, f) => sum + f.progress, 0) / uploadingFiles.length
      : files.length > 0 && files.every((f) => f.status === 'complete')
        ? 100
        : 0

  return (
    <div className="flex w-full flex-col gap-3">
      <SvgDropZone
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled}
        progress={avgProgress}
        isUploading={uploadingFiles.length > 0}
        onFiles={handleFiles}
      />
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((fileState) => (
            <SvgFileItem
              key={fileState.id}
              fileState={fileState}
              disabled={disabled}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
