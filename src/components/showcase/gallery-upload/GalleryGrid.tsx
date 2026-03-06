/* ============================================================================
   GalleryGrid

   Responsive CSS grid of preview cards.
   Uses auto-fill with minmax for fluid columns.
   ============================================================================ */

import { GalleryPreviewCard } from './GalleryPreviewCard'
import type { GalleryFileState } from './types'

interface GalleryGridProps {
  files: GalleryFileState[]
  disabled?: boolean
  onRemove?: (id: string) => void
}

export function GalleryGrid({ files, disabled, onRemove }: GalleryGridProps) {
  if (files.length === 0) return null

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
      {files.map((fileState) => (
        <GalleryPreviewCard
          key={fileState.id}
          fileState={fileState}
          disabled={disabled}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
