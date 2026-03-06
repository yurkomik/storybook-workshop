/* ============================================================================
   GameHUD — Heads-Up Display

   XP bar, level badge, and combo counter.
   The XP bar uses a gradient from green → gold.
   ============================================================================ */

import { cn } from '@/lib/utils'
import './GameUpload.css'

interface GameHUDProps {
  level: number
  xp: number
  xpToNextLevel: number
  combo: number
  totalFiles: number
}

export function GameHUD({ level, xp, xpToNextLevel, combo, totalFiles }: GameHUDProps) {
  const xpPercent = Math.min((xp / xpToNextLevel) * 100, 100)

  return (
    <div className="flex flex-col gap-2 rounded-none border-2 border-green-400/30 bg-black/90 p-3 font-mono">
      {/* Top row: Level + Combo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-green-400/20 px-2 py-0.5 text-xs font-bold text-green-400">
            LVL {level}
          </span>
          <span className="text-[10px] text-green-400/50">
            FILES: {totalFiles}
          </span>
        </div>

        {combo > 1 && (
          <span className="game-combo-pop rounded-sm bg-yellow-400/20 px-2 py-0.5 text-xs font-bold text-yellow-400">
            COMBO x{combo}!
          </span>
        )}
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-400/60">XP</span>
          <span className="tabular-nums text-green-400/60">
            {xp} / {xpToNextLevel}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-sm bg-green-400/10">
          <div
            className={cn(
              'h-full rounded-sm transition-all duration-500 ease-out',
              xpPercent >= 80
                ? 'bg-gradient-to-r from-green-400 to-yellow-400'
                : 'bg-gradient-to-r from-green-600 to-green-400',
            )}
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
