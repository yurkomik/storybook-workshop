/* ============================================================================
   GameUpload — Main Orchestrator

   Gamified file upload with XP system, combo counter, and achievements.
   File rarity is determined by file size:
     <100KB = common, <500KB = uncommon, <2MB = rare, <10MB = epic, >=10MB = legendary
   ============================================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameDropZone } from './GameDropZone'
import { GameHUD } from './GameHUD'
import { GameFileItem } from './GameFileItem'
import type { GameUploadProps, GameFileState, GameUploadError, LootRarity, Achievement } from './types'
import './GameUpload.css'

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024 // 50MB for game theme
const XP_PER_LEVEL = 500

function getRarity(size: number): LootRarity {
  if (size < 100_000) return 'common'
  if (size < 500_000) return 'uncommon'
  if (size < 2_000_000) return 'rare'
  if (size < 10_000_000) return 'epic'
  return 'legendary'
}

function getXpValue(rarity: LootRarity): number {
  switch (rarity) {
    case 'common': return 25
    case 'uncommon': return 50
    case 'rare': return 100
    case 'epic': return 200
    case 'legendary': return 500
  }
}

function matchesAccept(file: File, accept: string[]): boolean {
  if (!Array.isArray(accept) || accept.length === 0) return true
  return accept.some((p) => {
    if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p.toLowerCase())
    if (p.endsWith('/*')) return file.type.startsWith(p.slice(0, -2))
    return file.type === p
  })
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-upload', title: 'FIRST UPLOAD!', description: 'Deploy your first file', icon: '>' },
  { id: 'five-streak', title: '5 FILE STREAK!', description: 'Deploy 5 files total', icon: '>>' },
  { id: 'combo-master', title: 'COMBO MASTER!', description: 'Drop 3+ files at once', icon: 'x3' },
  { id: 'legendary-find', title: 'LEGENDARY FIND!', description: 'Upload a legendary file', icon: '***' },
]

export function GameUpload({
  accept,
  maxFiles = 10,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  onFilesSelected,
  onFileRemove,
  onError,
  onSoundEvent,
}: GameUploadProps) {
  const [files, setFiles] = useState<GameFileState[]>([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null)
  const uploadTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())
  const totalCompleted = useRef(0)

  useEffect(() => {
    return () => {
      uploadTimers.current.forEach((timer) => clearInterval(timer))
    }
  }, [])

  const unlockAchievement = useCallback((achievement: Achievement) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(achievement.id)) return prev
      setActiveAchievement(achievement)
      setTimeout(() => setActiveAchievement(null), 3000)
      return [...prev, achievement.id]
    })
  }, [])

  const addXp = useCallback((amount: number) => {
    setXp((prev) => {
      const newXp = prev + amount
      const currentLevel = Math.floor(newXp / XP_PER_LEVEL) + 1
      setLevel((prevLevel) => {
        if (currentLevel > prevLevel) {
          onSoundEvent?.('levelUp')
        }
        return currentLevel
      })
      return newXp
    })
  }, [onSoundEvent])

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
            addXp(f.xpValue)
            onSoundEvent?.('complete')
            totalCompleted.current++

            // Check achievements
            if (totalCompleted.current === 1) {
              unlockAchievement(ACHIEVEMENTS[0])
            }
            if (totalCompleted.current === 5) {
              unlockAchievement(ACHIEVEMENTS[1])
            }
            if (f.rarity === 'legendary') {
              unlockAchievement(ACHIEVEMENTS[3])
            }

            return { ...f, progress: 100, status: 'complete' as const }
          }
          return { ...f, progress: newProgress }
        })
      })
    }, 100)

    uploadTimers.current.set(fileId, timer)
  }, [addXp, onSoundEvent, unlockAchievement])

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const errors: GameUploadError[] = []
      const validFiles: File[] = []

      const slotsAvailable = maxFiles - files.length
      if (incoming.length > slotsAvailable) {
        errors.push({
          type: 'too-many-files',
          message: `MAX ${maxFiles} FILES. ${files.length} deployed.`,
        })
        incoming = incoming.slice(0, Math.max(0, slotsAvailable))
      }

      for (const file of incoming) {
        if (Array.isArray(accept) && accept.length > 0 && !matchesAccept(file, accept)) {
          errors.push({ type: 'invalid-type', message: `REJECTED: ${file.name}`, fileName: file.name })
          continue
        }
        if (file.size > maxSizeBytes) {
          errors.push({ type: 'file-too-large', message: `TOO HEAVY: ${file.name}`, fileName: file.name })
          continue
        }
        validFiles.push(file)
      }

      for (const error of errors) {
        onError?.(error)
        onSoundEvent?.('error')
      }
      if (validFiles.length === 0) return

      // Combo detection
      const newCombo = validFiles.length >= 2 ? validFiles.length : 0
      setCombo(newCombo)
      if (newCombo > 0) {
        onSoundEvent?.('combo')
        if (newCombo >= 3) unlockAchievement(ACHIEVEMENTS[2])
        // Reset combo display after 2s
        setTimeout(() => setCombo(0), 2000)
      }

      onSoundEvent?.('drop')

      const newStates: GameFileState[] = validFiles.map((file) => {
        const rarity = getRarity(file.size)
        return {
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: 'pending' as const,
          rarity,
          xpValue: getXpValue(rarity),
        }
      })

      setFiles((prev) => [...prev, ...newStates])
      onFilesSelected?.(validFiles)

      for (const fs of newStates) {
        setTimeout(() => simulateUpload(fs.id), 300)
      }
    },
    [accept, maxFiles, maxSizeBytes, files.length, onFilesSelected, onError, onSoundEvent, simulateUpload, unlockAchievement]
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

  const xpInCurrentLevel = xp % XP_PER_LEVEL

  return (
    <div className="flex w-full flex-col gap-0 rounded-lg overflow-hidden border-2 border-green-400/20 bg-black/95">
      {/* HUD */}
      <GameHUD
        level={level}
        xp={xpInCurrentLevel}
        xpToNextLevel={XP_PER_LEVEL}
        combo={combo}
        totalFiles={files.length}
      />

      {/* Drop Zone */}
      <GameDropZone
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled}
        onFiles={handleFiles}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col">
          {files.map((fileState) => (
            <GameFileItem
              key={fileState.id}
              fileState={fileState}
              disabled={disabled}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Achievement Banner */}
      {activeAchievement && (
        <div className="game-achievement-slide fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-none border-2 border-yellow-400 bg-black/95 px-4 py-3 font-mono shadow-lg">
          <span className="text-lg font-bold text-yellow-400">{activeAchievement.icon}</span>
          <div>
            <p className="text-sm font-bold text-yellow-400">{activeAchievement.title}</p>
            <p className="text-[10px] text-yellow-400/60">{activeAchievement.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
