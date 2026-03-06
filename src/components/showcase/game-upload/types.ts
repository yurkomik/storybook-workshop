/* ============================================================================
   Game Upload Types

   Gamified upload types: XP, levels, combos, rarity, achievements.
   ============================================================================ */

export interface GameUploadProps {
  accept?: string[]
  maxFiles?: number
  maxSizeBytes?: number
  disabled?: boolean
  onFilesSelected?: (files: File[]) => void
  onFileRemove?: (fileId: string) => void
  onError?: (error: GameUploadError) => void
  /** Sound event callback for game audio integration */
  onSoundEvent?: (event: 'drop' | 'complete' | 'levelUp' | 'combo' | 'error') => void
}

export type LootRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface GameFileState {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
  /** Rarity determined by file size */
  rarity: LootRarity
  /** XP earned when upload completes */
  xpValue: number
}

export interface GameUploadError {
  type: 'file-too-large' | 'invalid-type' | 'too-many-files' | 'upload-failed'
  message: string
  fileName?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}
