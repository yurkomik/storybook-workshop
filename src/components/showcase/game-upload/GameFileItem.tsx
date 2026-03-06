/* ============================================================================
   GameFileItem

   File as "loot item" with rarity glow based on file size.
   Rarity tiers: common (green), uncommon (blue), rare (purple),
   epic (magenta), legendary (gold).
   ============================================================================ */

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameFileState, LootRarity } from './types'
import './GameUpload.css'

interface GameFileItemProps {
  fileState: GameFileState
  disabled?: boolean
  onRemove?: (id: string) => void
}

const RARITY_CONFIG: Record<LootRarity, { label: string; textClass: string; bgClass: string }> = {
  common: { label: 'COMMON', textClass: 'text-green-400', bgClass: 'bg-green-400/10' },
  uncommon: { label: 'UNCOMMON', textClass: 'text-blue-400', bgClass: 'bg-blue-400/10' },
  rare: { label: 'RARE', textClass: 'text-purple-400', bgClass: 'bg-purple-400/10' },
  epic: { label: 'EPIC', textClass: 'text-pink-400', bgClass: 'bg-pink-400/10' },
  legendary: { label: 'LEGENDARY', textClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10' },
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function GameFileItem({ fileState, disabled = false, onRemove }: GameFileItemProps) {
  const { id, file, progress, status, error, rarity, xpValue } = fileState
  const config = RARITY_CONFIG[rarity]

  return (
    <div
      className={cn(
        'group flex items-center gap-3 border-l-3 p-2.5 font-mono text-sm',
        'transition-all duration-200',
        config.bgClass,
        `border-l-current ${config.textClass}`,
        status === 'complete' && `rarity-${rarity} game-rarity-glow`,
        status === 'error' && 'border-l-red-500 bg-red-500/10',
      )}
    >
      {/* Rarity badge */}
      <span className={cn('shrink-0 text-[9px] font-bold tracking-wider', config.textClass)}>
        [{config.label}]
      </span>

      {/* File info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs text-green-300">{file.name}</span>
          <span className="shrink-0 text-[10px] text-green-400/50">{formatFileSize(file.size)}</span>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2">
          {status === 'pending' && (
            <span className="text-[10px] text-green-400/40">QUEUED...</span>
          )}
          {status === 'uploading' && (
            <>
              <div className="h-1 flex-1 overflow-hidden bg-green-400/10">
                <div
                  className="h-full bg-green-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] tabular-nums text-green-400">{progress}%</span>
            </>
          )}
          {status === 'complete' && (
            <span className={cn('text-[10px] font-bold', config.textClass)}>
              DEPLOYED +{xpValue}XP
            </span>
          )}
          {status === 'error' && (
            <span className="truncate text-[10px] text-red-400">{error ?? 'MISSION FAILED'}</span>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        onClick={() => onRemove?.(id)}
        className={cn(
          'flex size-6 shrink-0 items-center justify-center',
          'text-green-400/30 transition-colors',
          'hover:text-red-400',
          'opacity-0 group-hover:opacity-100',
          status === 'error' && 'opacity-100 text-red-400/60',
          'disabled:pointer-events-none',
        )}
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
