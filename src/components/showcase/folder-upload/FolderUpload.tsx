/* ============================================================================
   FolderUpload — Main Orchestrator

   Same uncontrolled-state pattern as SvgUpload: internal FileState[],
   simulated upload progress, and composition of FolderDropZone + FileList.
   The folder visually "swallows" the most recent file via the file card
   animation, then the standard FileList shows all files below.
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import { FolderDropZone } from './FolderDropZone'
import { FileList } from '../file-upload/FileList'
import type { FolderUploadProps, FileState, FileUploadError } from './types'

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

function matchesAccept(file: File, accept: string[]): boolean {
  if (!Array.isArray(accept) || accept.length === 0) return true
  return accept.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase())
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -2))
    return file.type === pattern
  })
}

export function FolderUpload({
  accept,
  maxFiles = 5,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  label,
  sublabel,
  onFilesSelected,
  onFileRemove,
  onError,
}: FolderUploadProps) {
  const [files, setFiles] = useState<FileState[]>([])
  const [lastFileName, setLastFileName] = useState<string | undefined>()
  const [showFileCard, setShowFileCard] = useState(false)
  const [errorState, setErrorState] = useState<{ hasError: boolean; message?: string }>({ hasError: false })
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
      const errors: FileUploadError[] = []
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

      if (errors.length > 0) {
        for (const error of errors) onError?.(error)
        setErrorState({ hasError: true, message: errors[0].message })
        setTimeout(() => setErrorState({ hasError: false }), 3000)
      }
      if (validFiles.length === 0) return

      // Show file card animation with the first file's name
      setLastFileName(validFiles[0].name)
      setShowFileCard(true)
      setTimeout(() => setShowFileCard(false), 1200)

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

  return (
    <div className="flex w-full flex-col gap-3">
      <FolderDropZone
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled}
        showFileCard={showFileCard}
        fileCardName={lastFileName}
        hasError={errorState.hasError}
        errorMessage={errorState.message}
        label={label}
        sublabel={sublabel}
        onFiles={handleFiles}
      />
      <FileList
        files={files}
        disabled={disabled}
        onRemove={handleRemove}
      />
    </div>
  )
}
