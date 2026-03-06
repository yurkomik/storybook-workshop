/* ============================================================================
   ScifiUpload — Main Orchestrator

   Cyberpunk terminal upload. Files go through a "scanning" phase
   before uploading, adding an extra visual stage.
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import { ScifiDropZone } from './ScifiDropZone'
import { ScifiFileItem } from './ScifiFileItem'
import type { ScifiUploadProps, ScifiFileState, ScifiUploadError } from './types'
import './ScifiUpload.css'

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

function matchesAccept(file: File, accept: string[]): boolean {
  if (!Array.isArray(accept) || accept.length === 0) return true
  return accept.some((p) => {
    if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p.toLowerCase())
    if (p.endsWith('/*')) return file.type.startsWith(p.slice(0, -2))
    return file.type === p
  })
}

export function ScifiUpload({
  accept,
  maxFiles = 10,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  onFilesSelected,
  onFileRemove,
  onError,
}: ScifiUploadProps) {
  const [files, setFiles] = useState<ScifiFileState[]>([])
  const uploadTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer))
    }
  }, [])

  const startScanning = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'scanning' as const } : f))
    )

    // Scanning phase: progress 0→30 quickly
    const scanTimer = setInterval(() => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId)
        if (!file || file.status !== 'scanning') {
          clearInterval(scanTimer)
          uploadTimers.current.delete(`scan-${fileId}`)
          return prev
        }
        const increment = Math.floor(Math.random() * 8) + 5
        const newProgress = Math.min(file.progress + increment, 30)
        return prev.map((f) => {
          if (f.id !== fileId) return f
          if (newProgress >= 30) {
            clearInterval(scanTimer)
            uploadTimers.current.delete(`scan-${fileId}`)
            // Transition to uploading
            startUploading(fileId)
            return { ...f, progress: 30, status: 'uploading' as const }
          }
          return { ...f, progress: newProgress }
        })
      })
    }, 80)

    uploadTimers.current.set(`scan-${fileId}`, scanTimer)
  }, [])

  const startUploading = useCallback((fileId: string) => {
    const timer = setInterval(() => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId)
        if (!file || file.status !== 'uploading') {
          clearInterval(timer)
          uploadTimers.current.delete(fileId)
          return prev
        }
        const increment = Math.floor(Math.random() * 8) + 3
        const newProgress = Math.min(file.progress + increment, 100)
        return prev.map((f) => {
          if (f.id !== fileId) return f
          if (newProgress >= 100) {
            clearInterval(timer)
            uploadTimers.current.delete(fileId)
            return { ...f, progress: 100, status: 'verified' as const }
          }
          return { ...f, progress: newProgress }
        })
      })
    }, 100)

    uploadTimers.current.set(fileId, timer)
  }, [])

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const errors: ScifiUploadError[] = []
      const validFiles: File[] = []

      const slotsAvailable = maxFiles - files.length
      if (incoming.length > slotsAvailable) {
        errors.push({
          type: 'too-many-files',
          message: `CAPACITY EXCEEDED: MAX ${maxFiles} FILES`,
        })
        incoming = incoming.slice(0, Math.max(0, slotsAvailable))
      }

      for (const file of incoming) {
        if (Array.isArray(accept) && accept.length > 0 && !matchesAccept(file, accept)) {
          errors.push({ type: 'invalid-type', message: `REJECTED FORMAT: ${file.name}`, fileName: file.name })
          continue
        }
        if (file.size > maxSizeBytes) {
          errors.push({
            type: 'file-too-large',
            message: `PAYLOAD TOO LARGE: ${file.name}`,
            fileName: file.name,
          })
          continue
        }
        validFiles.push(file)
      }

      for (const error of errors) onError?.(error)
      if (validFiles.length === 0) return

      const newStates: ScifiFileState[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending' as const,
      }))

      setFiles((prev) => [...prev, ...newStates])
      onFilesSelected?.(validFiles)

      for (const fs of newStates) {
        setTimeout(() => startScanning(fs.id), 200)
      }
    },
    [accept, maxFiles, maxSizeBytes, files.length, onFilesSelected, onError, startScanning]
  )

  const handleRemove = useCallback(
    (id: string) => {
      // Clean up both scan and upload timers
      for (const key of [`scan-${id}`, id]) {
        const timer = uploadTimers.current.get(key)
        if (timer) {
          clearInterval(timer)
          uploadTimers.current.delete(key)
        }
      }
      setFiles((prev) => prev.filter((f) => f.id !== id))
      onFileRemove?.(id)
    },
    [onFileRemove]
  )

  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-lg border font-mono"
      style={{
        borderColor: 'oklch(75% 0.15 195 / 0.15)',
        backgroundColor: 'oklch(12% 0.02 260)',
      }}
    >
      <ScifiDropZone
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled}
        onFiles={handleFiles}
      />
      {files.length > 0 && (
        <div className="flex flex-col">
          {files.map((fileState) => (
            <ScifiFileItem
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
